/**
 * commands/verification.ts
 * ─────────────────────────────────────────────────────────────────────────
 * /verification mode <simple|captcha|code_lobby>
 *
 * Verification System V2 — replaces the old panel-deploy command
 * entirely, per approved plan. Phase 1 ships exactly this one
 * subcommand: pick the active mode, persisted to Supabase. Phases 2-5
 * each add their own subcommands here (panel deployment, setup, etc.) —
 * this file is deliberately minimal for now, not a placeholder for
 * something bigger already written elsewhere.
 *
 * The old verification files (verification.config.ts, verificationService.ts,
 * verificationPanel.ts, preEntryPanel.ts, verifyCodeButton.ts,
 * verifyLobbyButton.ts, verifyCodeModal.ts) remain in place but inert —
 * nothing currently deploys their panels since this command no longer
 * does. They're removed in Phase 4 once code_lobby mode's new
 * implementation replaces them.
 */

import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types';
import { VERIFICATION_MODES } from '../config/verificationModes.config';
import { setVerificationMode } from '../services/verificationModeService';
import { VerificationMode } from '../database/verificationConfig.repository';
import { embeds } from '../ui';
import { logger } from '../utils/logger';

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
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'mode') return handleMode(interaction);
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
            'Note: no panel is deployed yet — that\u2019s added in a later phase. ' +
            'This only sets which mode will be used.',
        }),
      ],
    });

    logger.info(
      `${interaction.user.tag} set verification mode to ${mode}`,
      'VerificationCommand',
    );
  } catch (error) {
    logger.error(error as Error, 'VerificationCommand');
    await interaction.editReply({
      content: '❌ Failed to update the verification mode. Please try again.',
    });
  }
}

export default command;