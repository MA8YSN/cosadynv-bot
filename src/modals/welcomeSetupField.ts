/**
 * modals/welcomeSetupField.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Handles the message-template submission from buttons/welcomeSetupField.ts.
 * customId format: `welcome_setup_modal:<sessionId>`.
 */

import { ModalSubmitInteraction } from 'discord.js';
import { ModalHandler } from '../types';
import { getDraftOrReply, updateDraft } from '../services/welcomeSetupService';
import { buildWelcomeSetupPayload } from '../embeds/welcomeSetupDashboard';

const modal: ModalHandler = {
  customId: 'welcome_setup_modal',

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    const [, sessionId] = interaction.customId.split(':');
    const draft = await getDraftOrReply(interaction, sessionId);
    if (!draft) return;

    const value = interaction.fields.getTextInputValue('value').trim();
    const updated = updateDraft(sessionId, { messageTemplate: value })!;

    if (interaction.isFromMessage()) {
      await interaction.update(buildWelcomeSetupPayload(updated));
    } else {
      await interaction.reply({ ...buildWelcomeSetupPayload(updated), ephemeral: true });
    }
  },
};

export default modal;