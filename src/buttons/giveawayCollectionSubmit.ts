/**
 * buttons/giveawayCollectionSubmit.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The winner-gated submit button. customId format:
 * `giveaway_collection_submit:<giveawayId>`. Talks only to
 * giveawayCollectionService.ts — no repository imports here.
 */

import { ButtonInteraction, TextInputStyle } from 'discord.js';
import { Button } from '../types';
import { getGiveawayById, isGiveawayWinner } from '../services/giveawayCollectionService';
import { getCollectionTypeByKey } from '../config/giveawayCollectionTypes.config';
import { createModal } from '../ui';

const button: Button = {
  customId: 'giveaway_collection_submit',

  async execute(interaction: ButtonInteraction): Promise<void> {
    const [, giveawayId] = interaction.customId.split(':');

    const giveaway = await getGiveawayById(giveawayId);
    if (!giveaway || !giveaway.collection_type) {
      await interaction.reply({
        content: '❌ This collection is no longer available.',
        ephemeral: true,
      });
      return;
    }

    const isWinner = await isGiveawayWinner(giveawayId, interaction.user.id);
    if (!isWinner) {
      await interaction.reply({
        content: '❌ You weren\u2019t selected for this giveaway.',
        ephemeral: true,
      });
      return;
    }

    const type = getCollectionTypeByKey(giveaway.collection_type);
    if (!type) return;

    const modal = createModal({
      customId: `giveaway_collection_modal:${giveawayId}`,
      title: type.getModalTitle(giveaway.collection_config ?? {}),
      fields: [
        {
          customId: 'value',
          label: type.fieldLabel,
          style: TextInputStyle.Short,
          required: true,
          maxLength: 100,
          placeholder: type.getPlaceholder?.(giveaway.collection_config ?? {}),
        },
      ],
    });

    await interaction.showModal(modal);
  },
};

export default button;