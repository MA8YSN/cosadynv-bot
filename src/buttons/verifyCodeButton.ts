/**
 * buttons/verifyCodeButton.ts
 * ─────────────────────────────────────────────────────────────────────────
 * "I Have a Code" — opens a single-field modal for the invite code.
 * Actual validation happens in modals/verifyCodeModal.ts on submit.
 */

import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import { createModal } from '../ui';

const button: Button = {
  customId: 'verify_code_button',

  async execute(interaction: ButtonInteraction): Promise<void> {
    const modal = createModal({
      customId: 'verify_code_modal',
      title: 'Enter Your Invite Code',
      fields: [
        {
          customId: 'code',
          label: 'Invite Code',
          required: true,
          maxLength: 100,
        },
      ],
    });

    await interaction.showModal(modal);
  },
};

export default button;