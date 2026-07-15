/**
 * buttons/giveawayEnter.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The "Enter Giveaway" button. customId format: `giveaway_enter:<giveawayId>`.
 * Talks only to giveawayService.ts — no repository or presentation
 * imports here.
 */

import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import { enterGiveaway } from '../services/giveawayService';
import { embeds } from '../ui';

const button: Button = {
  customId: 'giveaway_enter',

  async execute(interaction: ButtonInteraction): Promise<void> {
    const [, giveawayId] = interaction.customId.split(':');

    await interaction.deferReply({ ephemeral: true });

    const outcome = await enterGiveaway(giveawayId, interaction.user.id);

    if (outcome === 'entered') {
      await interaction.editReply({
        embeds: [
          embeds.success({
            title: 'Entered!',
            description: 'Good luck! Winners will be announced when the giveaway ends.',
          }),
        ],
      });
      return;
    }

    if (outcome === 'already-entered') {
      await interaction.editReply({
        embeds: [
          embeds.info({
            title: 'Already Entered',
            description: 'You\u2019ve already entered this giveaway.',
          }),
        ],
      });
      return;
    }

    if (outcome === 'ended') {
      await interaction.editReply({
        embeds: [
          embeds.error({
            title: 'Giveaway Ended',
            description: 'This giveaway is no longer accepting entries.',
          }),
        ],
      });
      return;
    }

    await interaction.editReply({
      embeds: [
        embeds.error({
          title: 'Something Went Wrong',
          description: 'Please try again in a moment.',
        }),
      ],
    });
  },
};

export default button;