/**
 * commands/verification.ts
 * ─────────────────────────────────────────────────────────────────────────
 * /verification <panel> [channel]
 *
 * Deploys a Verification-domain panel to a channel. `panel` chooses
 * which one — Main (the original two-button panel) or Pre-Entry (a
 * single "Enter Code" button for Lobby members verifying later). Both
 * panels feed into the exact same verification flow — see
 * embeds/preEntryPanel.ts for how the Pre-Entry panel reuses the Main
 * panel's button/modal/service without any duplicated logic.
 *
 * One command for the whole Verification domain, choosing which panel to
 * post, rather than a separate command per panel — keeps this scalable
 * as more panel variants show up later, and is a small step toward how a
 * future Panel Manager would work (one deploy surface, multiple panel
 * choices) without building that manager now.
 */

import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../types';
import { buildVerificationPanelPayload } from '../embeds/verificationPanel';
import { buildPreEntryPanelPayload } from '../embeds/preEntryPanel';
import { resolveTargetChannel } from '../utils/resolveTargetChannel';
import { logger } from '../utils/logger';

const PANEL_BUILDERS: Record<string, () => ReturnType<typeof buildVerificationPanelPayload>> = {
  main: buildVerificationPanelPayload,
  'pre-entry': buildPreEntryPanelPayload,
};

const PANEL_LABELS: Record<string, string> = {
  main: 'Main Verification',
  'pre-entry': 'Pre-Entry',
};

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('verification')
    .setDescription('Deploy a verification panel to a channel.')
    .addStringOption((option) =>
      option
        .setName('panel')
        .setDescription('Which verification panel to deploy')
        .setRequired(true)
        .addChoices(
          { name: 'Main Verification', value: 'main' },
          { name: 'Pre-Entry', value: 'pre-entry' },
        ),
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel to deploy the panel into (defaults to this channel)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const panelKey = interaction.options.getString('panel', true);
    const targetChannel = resolveTargetChannel(interaction);

    if (!targetChannel) {
      await interaction.reply({
        content: '❌ Please choose a valid text channel.',
        ephemeral: true,
      });
      return;
    }

    const buildPayload = PANEL_BUILDERS[panelKey];
    if (!buildPayload) {
      await interaction.reply({ content: '❌ Unknown panel type.', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      await targetChannel.send(buildPayload());

      await interaction.editReply({
        content: `✅ ${PANEL_LABELS[panelKey]} panel deployed to ${targetChannel}.`,
      });

      logger.info(
        `${interaction.user.tag} deployed the ${PANEL_LABELS[panelKey]} panel to #${targetChannel.name}`,
        'VerificationCommand',
      );
    } catch (error) {
      logger.error(error as Error, 'VerificationCommand');
      await interaction.editReply({
        content:
          '❌ Failed to deploy the panel. Make sure the bot has permission to send ' +
          'messages in that channel.',
      });
    }
  },
};

export default command;