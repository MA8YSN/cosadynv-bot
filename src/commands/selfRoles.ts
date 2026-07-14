/**
 * commands/selfRoles.ts
 * ─────────────────────────────────────────────────────────────────────────
 * /self-roles [channel]
 *
 * Deploys the Self Roles panel (currently just the Notifications category)
 * to a channel. Named `/self-roles` rather than `/notification-roles`
 * because this command is meant to grow into deploying additional
 * self-role categories later without a rename.
 *
 * V1 only has one category, so it's looked up by a hardcoded key below.
 * Once config/selfRoles.config.ts has more than one category, this becomes
 * a `category` command option instead — everything else (embed, select
 * menu, service) already supports that with no changes.
 */

import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../types';
import { SELF_ROLE_CATEGORIES } from '../config/selfRoles.config';
import { buildSelfRolesPanelPayload } from '../embeds/selfRolesPanel';
import { resolveTargetChannel } from '../utils/resolveTargetChannel';
import { logger } from '../utils/logger';

// V1 scope: always deploys this one category. See file header above.
const DEFAULT_CATEGORY_KEY = 'notifications';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('self-roles')
    .setDescription('Deploy the Self Roles panel to a channel.')
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
    const category = SELF_ROLE_CATEGORIES.find((c) => c.key === DEFAULT_CATEGORY_KEY);

    if (!targetChannel) {
      await interaction.reply({
        content: '❌ Please choose a valid text channel.',
        ephemeral: true,
      });
      return;
    }

    if (!category) {
      logger.error(
        `Self Roles category "${DEFAULT_CATEGORY_KEY}" is missing from config`,
        'SelfRolesCommand',
      );
      await interaction.reply({
        content: '❌ Self Roles isn\u2019t configured yet. Check config/selfRoles.config.ts.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      await targetChannel.send(buildSelfRolesPanelPayload(category));

      await interaction.editReply({
        content: `✅ Self Roles panel deployed to ${targetChannel}.`,
      });

      logger.info(
        `${interaction.user.tag} deployed the Self Roles panel to #${targetChannel.name}`,
        'SelfRolesCommand',
      );
    } catch (error) {
      logger.error(error as Error, 'SelfRolesCommand');
      await interaction.editReply({
        content:
          '❌ Failed to deploy the panel. Make sure the bot has permission to send ' +
          'messages in that channel.',
      });
    }
  },
};

export default command;