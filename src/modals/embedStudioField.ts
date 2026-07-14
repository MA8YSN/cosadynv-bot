/**
 * modals/embedStudioField.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Handles the modal submitted by buttons/embedStudioField.ts. One generic
 * handler for all three text fields — same "config drives it, not
 * per-field code" pattern as the button handler.
 * customId format: `embed_studio_modal:<sessionId>:<fieldKey>`.
 */

import { ModalSubmitInteraction } from 'discord.js';
import { ModalHandler } from '../types';
import { getSessionOrReply, updateSession, TEXT_FIELDS } from '../services/embedStudioService';
import { buildStudioPayload } from '../embeds/embedStudioDashboard';

const modal: ModalHandler = {
  customId: 'embed_studio_modal',

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    const [, sessionId, fieldKey] = interaction.customId.split(':');
    const draft = await getSessionOrReply(interaction, sessionId);
    if (!draft) return;

    const field = TEXT_FIELDS.find((f) => f.key === fieldKey);
    if (!field) return;

    const value = interaction.fields.getTextInputValue('value').trim();
    const updated = updateSession(sessionId, { [field.key]: value || undefined })!;

    // The modal was always launched from a button on the Studio dashboard
    // message, so .update() is available — but TS only knows that once we
    // narrow with isFromMessage(). The else branch is defensive and
    // shouldn't trigger given how this modal is opened.
    if (interaction.isFromMessage()) {
      await interaction.update(buildStudioPayload(updated));
    } else {
      await interaction.reply({ ...buildStudioPayload(updated), ephemeral: true });
    }
  },
};

export default modal;