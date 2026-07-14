/**
 * buttons/embedStudioField.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Handles all three "Set X" field buttons (Title, Description, Footer) in
 * Embed Studio with one generic handler — the field being edited comes
 * from the customId (`embed_studio_field:<sessionId>:<fieldKey>`), not
 * from separate code paths per field. Adding a v2 field to
 * services/embedStudioService.ts's TEXT_FIELDS array is enough for this
 * handler to support it automatically.
 */

import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import { getSessionOrReply, TEXT_FIELDS } from '../services/embedStudioService';
import { createModal } from '../ui';
import { logger } from '../utils/logger';

const button: Button = {
  customId: 'embed_studio_field',

  async execute(interaction: ButtonInteraction): Promise<void> {
    const [, sessionId, fieldKey] = interaction.customId.split(':');
    const draft = await getSessionOrReply(interaction, sessionId);
    if (!draft) return;

    const field = TEXT_FIELDS.find((f) => f.key === fieldKey);
    if (!field) {
      logger.warn(`Unknown Embed Studio field: ${fieldKey}`, 'EmbedStudioField');
      return;
    }

    const modal = createModal({
      customId: `embed_studio_modal:${sessionId}:${fieldKey}`,
      title: `Set ${field.label}`,
      fields: [
        {
          customId: 'value',
          label: field.label,
          style: field.style,
          value: draft[field.key],
          required: field.required,
          maxLength: field.maxLength,
        },
      ],
    });

    await interaction.showModal(modal);
  },
};

export default button;