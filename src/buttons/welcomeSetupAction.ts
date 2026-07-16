/**
 * buttons/welcomeSetupAction.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Preview / Save / Cancel / DM-toggle. customId format:
 * `welcome_setup_action:<sessionId>:<preview|save|cancel|toggle_dm>`.
 */

import { AttachmentBuilder, ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import {
  deleteDraft,
  getDraftOrReply,
  saveDraftAsConfig,
  updateDraft,
} from '../services/welcomeSetupService';
import { buildWelcomeSetupPayload } from '../embeds/welcomeSetupDashboard';
import { buildResolvedWelcomeData, resolveWelcomeVariables } from '../services/welcomeVariables';
import { renderWelcomeCard } from '../services/welcomeImageService';
import { WELCOME_THEMES } from '../config/welcomeThemes.config';
import { embeds } from '../ui';
import { logger } from '../utils/logger';

const button: Button = {
  customId: 'welcome_setup_action',

  async execute(interaction: ButtonInteraction): Promise<void> {
    const [, sessionId, action] = interaction.customId.split(':');
    const draft = await getDraftOrReply(interaction, sessionId);
    if (!draft) return;

    if (action === 'toggle_dm') {
      const updated = updateDraft(sessionId, { dmEnabled: !draft.dmEnabled })!;
      await interaction.update(buildWelcomeSetupPayload(updated));
      return;
    }

    if (action === 'cancel') {
      deleteDraft(sessionId);
      await interaction.update({
        embeds: [
          embeds.info({ title: 'Welcome Setup Cancelled', description: 'No changes were saved.' }),
        ],
        components: [],
      });
      return;
    }

    if (action === 'preview') {
      if (!interaction.inCachedGuild()) return;
      await interaction.deferReply({ ephemeral: true });

      try {
        const data = buildResolvedWelcomeData(interaction.member);
        const content = resolveWelcomeVariables(draft.messageTemplate, data);
        const theme = WELCOME_THEMES.find((t) => t.key === draft.theme) ?? WELCOME_THEMES[0];
        const imageBuffer = await renderWelcomeCard(theme, data);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-preview.png' });

        await interaction.editReply({
          content: `👀 Preview — this is what a new member would receive:\n\n${content}`,
          files: [attachment],
        });
      } catch (error) {
        logger.error(error as Error, 'WelcomeSetupAction');
        await interaction.editReply({ content: '❌ Failed to generate the preview.' });
      }
      return;
    }

    if (action === 'save') {
      if (!draft.channelId) {
        await interaction.reply({
          content: '❌ Please select a channel before saving.',
          ephemeral: true,
        });
        return;
      }

      try {
        await saveDraftAsConfig(draft, interaction.user.id);

        deleteDraft(sessionId);

        await interaction.update({
          embeds: [
            embeds.success({
              title: 'Welcome Setup Saved',
              description: 'New members will now receive this welcome automatically.',
            }),
          ],
          components: [],
        });
      } catch (error) {
        logger.error(error as Error, 'WelcomeSetupAction');
        await interaction.reply({ content: '❌ Failed to save. Please try again.', ephemeral: true });
      }
    }
  },
};

export default button;