/**
 * embeds/giveawayCollectionPanel.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The winner collection panel — generic over collection type. Pure
 * rendering only: takes a giveaway row + a computed status, returns a
 * payload. No Discord sending, no database access.
 */

import { embeds, buttons, row } from '../ui';
import { GiveawayRow } from '../database/giveaways.repository';
import { CollectionStatus } from '../services/giveawayCollectionService';
import { getCollectionTypeByKey } from '../config/giveawayCollectionTypes.config';
import { GIVEAWAY_CONFIG } from '../config/giveaway.config';

export function buildCollectionPanelEmbed(giveaway: GiveawayRow, status: CollectionStatus) {
  const type = getCollectionTypeByKey(giveaway.collection_type);
  const chain = (giveaway.collection_config as { chain?: string } | null)?.chain;

  const deadlineSeconds = giveaway.ended_at
    ? Math.floor(new Date(giveaway.ended_at).getTime() / 1000) +
      GIVEAWAY_CONFIG.walletSubmissionDeadlineHours * 3600
    : null;

  const winnerLines = status.rows.map((r) => {
    const statusIcon = r.submitted ? '🟢' : '🔴';
    const statusText =
      r.submitted && r.submittedAt
        ? `Submitted <t:${Math.floor(new Date(r.submittedAt).getTime() / 1000)}:R>`
        : 'Waiting';
    return `${statusIcon} <@${r.userId}> • ${statusText}`;
  });

  const descriptionLines = [
    'Congratulations! If your name appears in the winner list below, click the button to submit.',
    '',
    `**Prize:** ${giveaway.prize}`,
    chain ? `**Chain:** ${chain}` : null,
    deadlineSeconds ? `**Deadline:** <t:${deadlineSeconds}:R>` : null,
    '',
    ...winnerLines,
    '',
    `**${status.submittedCount} / ${status.totalCount} Submitted**`,
  ].filter((line): line is string => line !== null);

  return embeds.brand({
    title: `🏆 ${type?.label ?? 'Winner'} Collection`,
    description: descriptionLines.join('\n'),
  });
}

/** Full message payload — embed + the submit button — ready to send or use to edit an existing message. */
export function buildCollectionPanelPayload(giveaway: GiveawayRow, status: CollectionStatus) {
  const type = getCollectionTypeByKey(giveaway.collection_type);

  const actionRow = row(
    buttons.success({
      customId: `giveaway_collection_submit:${giveaway.id}`,
      label: type?.buttonLabel ?? 'Submit',
      icon: 'wallet',
    }),
  );

  return {
    embeds: [buildCollectionPanelEmbed(giveaway, status)],
    components: [actionRow],
  };
}