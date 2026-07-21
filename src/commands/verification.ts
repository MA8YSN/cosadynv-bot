/**
 * commands/verification.ts
 * ─────────────────────────────────────────────────────────────────────────
 * /verification mode|deploy|set-role|code|setup
 *
 * Full V2 command surface (Phases 1-5 combined):
 *   mode      - choose the active verification mode
 *   deploy    - post the panel matching the active mode (panel choice
 *               only matters for code_lobby, which has Main + Pre-Entry)
 *   set-role  - manually set Verified/Lobby role (superseded by `setup`
 *               for new configurations, still useful for existing roles)
 *   code      - add/remove/list valid codes (code_lobby mode only)
 *   setup     - automatic server setup: creates missing roles/channels,
 *               configures their permissions, idempotent
 *
 * Talks only to verificationModeService.ts, lobbyVerificationService.ts,
 * and verificationSetupService.ts — never to the repository directly.
 */

import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../types';
import { VERIFICATION_MODES } from '../config/verificationModes.config';
import {
  getVerificationConfig,
  setVerificationMode,
  updateVerificationConfig,
} from '../services/verificationModeService';
import { VerificationMode } from '../database/verificationConfig.repository';
import { buildSimpleVerificationPanelPayload } from '../embeds/simpleVerificationPanel';
import { buildCaptchaVerificationPanelPayload } from '../embeds/captchaVerificationPanel';
import { buildLobbyVerificationPanelPayload } from '../embeds/lobbyVerificationPanel';
import { buildLobbyPreEntryPanelPayload } from '../embeds/lobbyPreEntryPanel';
import { addValidCode, removeValidCode, listValidCodes } from '../services/lobbyVerificationService';
import { runAutomaticSetup } from '../services/verificationSetupService';
import { resolveTargetChannel } from '../utils/resolveTargetChannel';
import { embeds } from '../ui';
import { logger } from '../utils/logger';

type PanelChoice = 'main' | 'pre-entry';
type PanelBuilder = (panel: PanelChoice) => ReturnType<typeof buildSimpleVerificationPanelPayload>;

/** Dispatch table: which panel(s) each mode deploys. Adding a mode's panel here is the only wiring needed for /verification deploy to support it. */
const MODE_PANEL_BUILDERS: Partial<Record<VerificationMode, PanelBuilder>> = {
  simple: () => buildSimpleVerificationPanelPayload(),
  captcha: () => buildCaptchaVerificationPanelPayload(),
  code_lobby: (panel) =>
    panel === 'pre-entry' ? buildLobbyPreEntryPanelPayload() : buildLobbyVerificationPanelPayload(),
};

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('verification')
    .setDescription('Manage the Verification System.')
    .addSubcommand((sub) =>
      sub
        .setName('mode')
        .setDescription('Choose which verification mode is active.')
        .addStringOption((opt) =>
          opt
            .setName('type')
            .setDescription('Verification mode')
            .setRequired(true)
            .addChoices(
              ...VERIFICATION_MODES.map((mode) => ({ name: mode.label, value: mode.key })),
            ),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('deploy')
        .setDescription('Deploy the panel matching the active verification mode.')
        .addStringOption((opt) =>
          opt
            .setName('panel')
            .setDescription('Which panel (only relevant for Code Verification + Lobby)')
            .setRequired(false)
            .addChoices({ name: 'Main', value: 'main' }, { name: 'Pre-Entry', value: 'pre-entry' }),
        )
        .addChannelOption((opt) =>
          opt
            .setName('channel')
            .setDescription('Channel to deploy into (defaults to this channel)')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('set-role')
        .setDescription('Manually set the Verified or Lobby role.')
        .addStringOption((opt) =>
          opt
            .setName('type')
            .setDescription('Which role to set')
            .setRequired(true)
            .addChoices({ name: 'Verified', value: 'verified' }, { name: 'Lobby', value: 'lobby' }),
        )
        .addRoleOption((opt) => opt.setName('role').setDescription('The role').setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName('code')
        .setDescription('Manage valid invite codes (Code Verification + Lobby mode only).')
        .addStringOption((opt) =>
          opt
            .setName('action')
            .setDescription('add, remove, or list')
            .setRequired(true)
            .addChoices(
              { name: 'Add', value: 'add' },
              { name: 'Remove', value: 'remove' },
              { name: 'List', value: 'list' },
            ),
        )
        .addStringOption((opt) =>
          opt.setName('code').setDescription('The code (required for add/remove)').setRequired(false),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('setup')
        .setDescription('Automatically create/configure roles and channels for the active mode.'),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'mode') return handleMode(interaction);
    if (subcommand === 'deploy') return handleDeploy(interaction);
    if (subcommand === 'set-role') return handleSetRole(interaction);
    if (subcommand === 'code') return handleCode(interaction);
    if (subcommand === 'setup') return handleSetup(interaction);
  },
};

async function handleMode(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) return;

  const mode = interaction.options.getString('type', true) as VerificationMode;
  await interaction.deferReply({ ephemeral: true });

  try {
    await setVerificationMode(interaction.guildId, mode, interaction.user.id);
    const modeDefinition = VERIFICATION_MODES.find((m) => m.key === mode);

    await interaction.editReply({
      embeds: [
        embeds.success({
          title: 'Verification Mode Updated',
          description:
            `**${modeDefinition?.label ?? mode}** is now the active mode.\n\n` +
            'Run `/verification setup` to auto-configure roles/channels, or ' +
            '`/verification deploy` once everything is configured.',
        }),
      ],
    });

    logger.info(`${interaction.user.tag} set verification mode to ${mode}`, 'VerificationCommand');
  } catch (error) {
    logger.error(error as Error, 'VerificationCommand');
    await interaction.editReply({ content: '❌ Failed to update the verification mode. Please try again.' });
  }
}

async function handleDeploy(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) return;

  const panelChoice = (interaction.options.getString('panel') as PanelChoice | null) ?? 'main';
  const targetChannel = resolveTargetChannel(interaction);

  if (!targetChannel) {
    await interaction.reply({ content: '❌ Please choose a valid text channel.', ephemeral: true });
    return;
  }

  const config = await getVerificationConfig(interaction.guildId);
  if (!config || !config.active_mode) {
    await interaction.reply({
      content: '❌ No verification mode is set. Run `/verification mode` first.',
      ephemeral: true,
    });
    return;
  }

  const buildPayload = MODE_PANEL_BUILDERS[config.active_mode];
  if (!buildPayload) {
    await interaction.reply({
      content: `❌ The **${config.active_mode}** mode doesn\u2019t have a panel available yet.`,
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    await targetChannel.send(buildPayload(panelChoice));
    await interaction.editReply({ content: `✅ Verification panel deployed to ${targetChannel}.` });

    logger.info(
      `${interaction.user.tag} deployed the ${config.active_mode} panel to #${targetChannel.name}`,
      'VerificationCommand',
    );
  } catch (error) {
    logger.error(error as Error, 'VerificationCommand');
    await interaction.editReply({ content: '❌ Failed to deploy the panel.' });
  }
}

async function handleSetRole(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) return;

  const roleType = interaction.options.getString('type', true);
  const role = interaction.options.getRole('role', true);

  await interaction.deferReply({ ephemeral: true });

  try {
    const patch = roleType === 'verified' ? { verified_role_id: role.id } : { lobby_role_id: role.id };
    await updateVerificationConfig(interaction.guildId, patch, interaction.user.id);

    await interaction.editReply({
      content: `✅ ${roleType === 'verified' ? 'Verified' : 'Lobby'} role set to ${role}.`,
    });
  } catch (error) {
    logger.error(error as Error, 'VerificationCommand');
    await interaction.editReply({ content: '❌ Failed to save. Please try again.' });
  }
}

async function handleCode(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) return;

  const action = interaction.options.getString('action', true);
  const code = interaction.options.getString('code');

  await interaction.deferReply({ ephemeral: true });

  if ((action === 'add' || action === 'remove') && !code) {
    await interaction.editReply({ content: '❌ Please provide a code for this action.' });
    return;
  }

  try {
    if (action === 'add' && code) {
      const codes = await addValidCode(interaction.guildId, code, interaction.user.id);
      await interaction.editReply({ content: `✅ Code added. Total codes: ${codes.length}.` });
      return;
    }

    if (action === 'remove' && code) {
      const codes = await removeValidCode(interaction.guildId, code, interaction.user.id);
      await interaction.editReply({ content: `✅ Code removed. Total codes: ${codes.length}.` });
      return;
    }

    // action === 'list'
    const codes = await listValidCodes(interaction.guildId);
    await interaction.editReply({
      embeds: [
        embeds.brand({
          title: 'Valid Codes',
          description: codes.length > 0 ? codes.map((c) => `\`${c}\``).join('\n') : '*No codes configured.*',
        }),
      ],
    });
  } catch (error) {
    logger.error(error as Error, 'VerificationCommand');
    await interaction.editReply({ content: '❌ Something went wrong. Please try again.' });
  }
}

async function handleSetup(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) return;
  await interaction.deferReply({ ephemeral: true });

  const outcome = await runAutomaticSetup(interaction.guild, interaction.user.id);

  if (outcome.status === 'no-mode') {
    await interaction.editReply({
      content: '❌ No verification mode is set. Run `/verification mode` first.',
    });
    return;
  }

  if (outcome.status === 'failed') {
    await interaction.editReply({
      content:
        '❌ Setup failed — check the bot has **Manage Roles** and **Manage Channels** permissions, then try again.',
    });
    return;
  }

  const { result } = outcome;
  const channelList = Object.entries(result.channels)
    .map(([key, channel]) => `• ${channel} (${key})`)
    .join('\n');

  await interaction.editReply({
    embeds: [
      embeds.success({
        title: 'Automatic Setup Complete',
        description: [
          `**Mode:** ${result.mode.label}`,
          `**Verified role:** ${result.verifiedRole}`,
          result.lobbyRole ? `**Lobby role:** ${result.lobbyRole}` : null,
          '',
          '**Channels:**',
          channelList,
          '',
          'Note: this only manages the roles/channels above. Gating the rest ' +
            'of the server behind the Verified role is a manual step on your end.',
        ]
          .filter((line): line is string => line !== null)
          .join('\n'),
      }),
    ],
  });

  logger.info(
    `${interaction.user.tag} ran automatic verification setup (${result.mode.key})`,
    'VerificationCommand',
  );
}

export default command;