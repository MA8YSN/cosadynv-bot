/**
 * modals/giveawayCollectionSubmit.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Handles the value submission from buttons/giveawayCollectionSubmit.ts.
 * customId format: `giveaway_collection_modal:<giveawayId>`. Re-validates
 * winner status and value format server-side via the service — never
 * trusts that the button's own gating was sufficient.
 */

import { ModalSubmitInteraction } from 'discord.js';
import { ModalHandler } from '../types';
import {
  getGiveawayById,
  submitCollectionEntry,
  getCollectionStatus,
} from '../services/giveawayCollectionService';
import { updateCollectionPanel } from '../services/giveawayPresentation';
import { embeds } from '../ui';

const modal: ModalHandler = {
  customId: 'giveaway_collection_modal',

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    const [, giveawayId] = interaction.customId.split(':');
    await interaction.deferReply({ ephemeral: true });

    const giveaway = await getGiveawayById(giveawayId);
    if (!giveaway) {
      await interaction.editReply({ content: '❌ This collection is no longer available.' });
      return;
    }

    const value = interaction.fields.getTextInputValue('value');
    const outcome = await submitCollectionEntry(giveaway, interaction.user.id, value);

    if (outcome === 'not-a-winner') {
      await interaction.editReply({ content: '❌ You weren\u2019t selected for this giveaway.' });
      return;
    }

    if (outcome === 'invalid-value') {
      await interaction.editReply({
        content:
          '❌ That doesn\u2019t look like a valid address for this chain. Please double-check and try again.',
      });
      return;
    }

    if (outcome === 'no-collection' || outcome === 'failed') {
      await interaction.editReply({ content: '❌ Something went wrong. Please try again.' });
      return;
    }

    // outcome === 'submitted'
    const status = await getCollectionStatus(giveawayId);
    await updateCollectionPanel(interaction.client, giveaway, status);

    await interaction.editReply({
      embeds: [
        embeds.success({
          title: 'Submitted!',
          description: 'Your submission has been recorded.',
        }),
      ],
    });
  },
};

export default modal;