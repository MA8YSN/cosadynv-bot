/**
 * buttons/lobbyVerifyLobbyButton.ts
 * ─────────────────────────────────────────────────────────────────────────
 * "Join Waiting Area" — grants the Lobby role directly, no modal.
 */

import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import { joinLobby } from '../services/lobbyVerificationService';
import { embeds } from '../ui';

const button: Button = {
  customId: 'lobby_verify_lobby_button',

  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ ephemeral: true });

    const outcome = await joinLobby(interaction.member);

    if (outcome === 'already-in-lobby') {
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

    if (outcome === 'already-verified') {
      await interaction.editReply({
        embeds: [
          embeds.info({ title: 'Already Verified', description: 'You\u2019re already verified!' }),
        ],
      });
      return;
    }

    if (outcome === 'wrong-mode' || outcome === 'not-configured' || outcome === 'failed') {
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

    // outcome === 'joined'
    await interaction.editReply({
      embeds: [
        embeds.success({
          title: 'You\u2019re in the Lobby!',
          description: [
            'Welcome! While you wait, you now have access to:',
            '',
            '• 💬 Lobby Chat',
            '• 🎁 Lobby Giveaways',
            '• ⚓ Pre-Entry',
          ].join('\n'),
        }),
      ],
    });
  },
};

export default button;