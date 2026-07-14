/**
 * commands/verification.ts
 * ─────────────────────────────────────────────────────────────────────────
 * /verification [channel]
 *
 * Deploys the permanent Verification panel to a channel. Same shape as
 * /self-roles — admin-only, reuses resolveTargetChannel() from the recent
 * infrastructure refactor instead of duplicating that logic again.
 */

import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../types';
import { buildVerificationPanelPayload } from '../embeds/verificationPanel';
import { resolveTargetChannel } from '../utils/resolveTargetChannel';
import { logger } from '../utils/logger';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('verification')
    .setDescription('Deploy the Verification panel to a channel.')
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
    const targetChannel = resolveTargetChannel(interaction);

    if (!targetChannel) {
      await interaction.reply({
        content: '❌ Please choose a valid text channel.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      await targetChannel.send(buildVerificationPanelPayload());

      await interaction.editReply({
        content: `✅ Verification panel deployed to ${targetChannel}.`,
      });

      logger.info(
        `${interaction.user.tag} deployed the Verification panel to #${targetChannel.name}`,
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