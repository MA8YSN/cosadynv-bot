/**
 * commands/deploy.ts
 * ─────────────────────────────────────────────────────────────────────────
 * /deploy [channel]
 *
 * Sends a preview embed into the target channel (or the current channel if
 * none is given). This is the foundation implementation: it proves the
 * command handler, the embed module, and Discord's API are all wired
 * together correctly.
 *
 * Later, this will grow into the entry point for deploying every kind of
 * embed the community needs (rules, verification panels, giveaways...),
 * most likely via subcommands (`/deploy embed`, `/deploy verification`, ...)
 * that each delegate to their own file in `embeds/`.
 *
 * Any .ts file default-exported from `commands/` (matching the `Command`
 * shape) is picked up automatically by the command handler — no manual
 * registration needed inside the code. It DOES still need to be pushed to
 * Discord's API via `npm run deploy-commands` whenever its structure changes.
 */

import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../types';
import { buildDeployPreviewEmbed } from '../embeds/deployPreviewEmbed';
import { resolveTargetChannel } from '../utils/resolveTargetChannel';
import { logger } from '../utils/logger';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('deploy')
    .setDescription('Deploy a preview embed into a channel.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel to deploy the embed into (defaults to this channel)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false),
    )
    // Restrict to members who can manage the server by default. Server admins
    // can still further customize this in Discord's Integrations settings.
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    // This command only makes sense inside a server, never in DMs.
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

    // Defer first: sending the embed + acknowledging the interaction are two
    // separate steps, and Discord requires a response within 3 seconds.
    // Deferring buys us up to 15 minutes.
    await interaction.deferReply({ ephemeral: true });

    try {
      const embed = buildDeployPreviewEmbed(interaction.user);
      await targetChannel.send({ embeds: [embed] });

      await interaction.editReply({
        content: `✅ Embed deployed to ${targetChannel}.`,
      });

      logger.info(
        `${interaction.user.tag} deployed an embed to #${targetChannel.name}`,
        'DeployCommand',
      );
    } catch (error) {
      logger.error(error as Error, 'DeployCommand');
      await interaction.editReply({
        content:
          '❌ Something went wrong while deploying that embed. ' +
          'Make sure the bot has permission to send messages in that channel.',
      });
    }
  },
};

export default command;
