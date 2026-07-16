/**
 * buttons/welcomeSetupField.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Opens the message-template modal. customId format: `welcome_setup_field:<sessionId>`.
 */

import { ButtonInteraction, TextInputStyle } from 'discord.js';
import { Button } from '../types';
import { getDraftOrReply } from '../services/welcomeSetupService';
import { createModal } from '../ui';

const button: Button = {
  customId: 'welcome_setup_field',

  async execute(interaction: ButtonInteraction): Promise<void> {
    const [, sessionId] = interaction.customId.split(':');
    const draft = await getDraftOrReply(interaction, sessionId);
    if (!draft) return;

    const modal = createModal({
      customId: `welcome_setup_modal:${sessionId}`,
      title: 'Set Welcome Message',
      fields: [
        {
          customId: 'value',
          label: 'Message (supports {user} {server} etc.)',
          style: TextInputStyle.Paragraph,
          value: draft.messageTemplate,
          required: true,
          maxLength: 1000,
        },
      ],
    });

    await interaction.showModal(modal);
  },
};

export default button;