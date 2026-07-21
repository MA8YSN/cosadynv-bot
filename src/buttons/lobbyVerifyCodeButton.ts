/**
 * buttons/lobbyVerifyCodeButton.ts
 * ─────────────────────────────────────────────────────────────────────────
 * "I Have a Code" (main panel) AND "Enter Code" (pre-entry panel) both
 * use this exact handler, since both buttons share the same customId —
 * see embeds/lobbyPreEntryPanel.ts for the reuse.
 */

import { ButtonInteraction, TextInputStyle } from 'discord.js';
import { Button } from '../types';
import { createModal } from '../ui';

const button: Button = {
  customId: 'lobby_verify_code_button',

  async execute(interaction: ButtonInteraction): Promise<void> {
    const modal = createModal({
      customId: 'lobby_verify_code_modal',
      title: 'Enter Your Invite Code',
      fields: [
        {
          customId: 'code',
          label: 'Invite Code',
          style: TextInputStyle.Short,
          required: true,
          maxLength: 100,
        },
      ],
    });

    await interaction.showModal(modal);
  },
};

export default button;