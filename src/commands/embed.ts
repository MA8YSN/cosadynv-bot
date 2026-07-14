/**
 * commands/embed.ts
 * ─────────────────────────────────────────────────────────────────────────
 * /embed
 *
 * Opens the Embed Studio: a persistent, ephemeral workspace for building
 * and publishing a fully custom embed to any channel. The command itself
 * takes no options — channel selection happens inside the Studio via a
 * native Discord channel select menu, not a slash-command argument.
 *
 * The bot has no concept of "this is a rules embed" or "this is a
 * giveaway embed" — it only knows "an admin is building an embed". What
 * the content means is entirely up to the admin.
 */

import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../types';
import { createSession } from '../services/embedStudioService';
import { buildStudioPayload } from '../embeds/embedStudioDashboard';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Open Embed Studio to build and publish a custom embed.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const draft = createSession(interaction.user.id);

    await interaction.reply({
      ...buildStudioPayload(draft),
      ephemeral: true,
    });
  },
};

export default command;