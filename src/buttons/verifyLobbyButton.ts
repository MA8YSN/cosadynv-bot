/**
 * buttons/verifyLobbyButton.ts
 * ─────────────────────────────────────────────────────────────────────────
 * "Join Waiting Area" — grants the Lobby role directly, no modal needed.
 * Idempotent: a member who already has Lobby gets a friendly
 * "already joined" reply instead of an error.
 */

import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import { grantLobbyRole } from '../services/verificationService';
import { embeds } from '../ui';

const button: Button = {
  customId: 'verify_lobby_button',

  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ ephemeral: true });

    const outcome = await grantLobbyRole(interaction.member);

    if (outcome === 'already-had') {
      await interaction.editReply({
        embeds: [
          embeds.info({
            title: 'Already in the Waiting Area',
            description: 'You\u2019ve already joined the waiting area.',
          }),
        ],
      });
      return;
    }

    if (outcome === 'failed') {
      await interaction.editReply({
        embeds: [
          embeds.error({
            title: 'Something Went Wrong',
            description: 'Please contact a staff member for help.',
          }),
        ],
      });
      return;
    }

    await interaction.editReply({
      embeds: [
        embeds.success({
          title: 'Joined the Waiting Area',
          description: 'A team member will assist you shortly.',
        }),
      ],
    });
  },
};

export default button;