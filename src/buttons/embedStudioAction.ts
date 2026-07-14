/**
 * buttons/embedStudioAction.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Handles the Preview / Publish / Cancel buttons in Embed Studio.
 * customId format: `embed_studio_action:<sessionId>:<preview|publish|cancel>`.
 */

import { ButtonInteraction, TextChannel } from 'discord.js';
import { Button } from '../types';
import {
  deleteSession,
  getSessionOrReply,
  getValidationError,
} from '../services/embedStudioService';
import { renderDraftEmbed } from '../embeds/draftEmbedRenderer';
import { buildPublishSuccessPayload } from '../embeds/embedStudioDashboard';
import { embeds } from '../ui';
import { logger } from '../utils/logger';

const button: Button = {
  customId: 'embed_studio_action',

  async execute(interaction: ButtonInteraction): Promise<void> {
    const [, sessionId, action] = interaction.customId.split(':');
    const draft = await getSessionOrReply(interaction, sessionId);
    if (!draft) return;

    if (action === 'cancel') {
      deleteSession(sessionId);
      await interaction.update({
        embeds: [
          embeds.info({ title: 'Embed Studio Cancelled', description: 'No embed was published.' }),
        ],
        components: [],
      });
      return;
    }

    if (action === 'preview') {
      if (!draft.title && !draft.description) {
        await interaction.reply({
          content: '❌ Add at least a title or description before previewing.',
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        content: '👀 Preview — this is what your embed will look like:',
        embeds: [renderDraftEmbed(draft)],
        ephemeral: true,
      });
      return;
    }

    if (action === 'publish') {
      const validationError = getValidationError(draft);
      if (validationError || !draft.channelId) {
        await interaction.reply({
          content: `❌ ${validationError ?? 'Please select a channel.'}`,
          ephemeral: true,
        });
        return;
      }

      const channel = await interaction.client.channels.fetch(draft.channelId).catch(() => null);

      if (!channel || !(channel instanceof TextChannel)) {
        await interaction.reply({
          content: '❌ Could not find that channel, or the bot lacks access to it.',
          ephemeral: true,
        });
        return;
      }

      try {
        await channel.send({ embeds: [renderDraftEmbed(draft)] });
        deleteSession(sessionId);

        await interaction.update(buildPublishSuccessPayload(channel.id));

        logger.info(`${interaction.user.tag} published an embed to #${channel.name}`, 'EmbedStudio');
      } catch (error) {
        logger.error(error as Error, 'EmbedStudio');
        await interaction.reply({
          content: '❌ Failed to send that embed. Make sure the bot can post in that channel.',
          ephemeral: true,
        });
      }
    }
  },
};

export default button;