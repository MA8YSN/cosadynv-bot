/**
 * embeds/giveawayResult.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The winner announcement message posted after a giveaway ends or is
 * rerolled. Built through src/ui.
 *
 * Uses createEmbed() directly rather than embeds.success() — that preset
 * force-prefixes the title with icons.success (✅), and this message
 * wants its own emoji (🎉 / 🔁) instead. Same deliberate, documented
 * exception already used in draftEmbedRenderer.ts and the verification
 * success message.
 */

import { createEmbed, colors } from '../ui';
import { GiveawayRow } from '../database/giveaways.repository';

export type GiveawayResultReason = 'initial' | 'reroll';

export function buildGiveawayResultEmbed(
  giveaway: GiveawayRow,
  winnerUserIds: string[],
  reason: GiveawayResultReason,
) {
  const title = reason === 'reroll' ? '🔁 Winners Rerolled' : '🎉 Winners Announced';

  const winnersText =
    winnerUserIds.length > 0
      ? winnerUserIds.map((id) => `<@${id}>`).join('\n')
      : '*No eligible entrants — no winners could be selected.*';

  return createEmbed({
    title,
    color: colors.success,
    description: [`**Prize:** ${giveaway.prize}`, '', '**Winners:**', winnersText].join('\n'),
  });
}

export function buildGiveawayResultPayload(
  giveaway: GiveawayRow,
  winnerUserIds: string[],
  reason: GiveawayResultReason,
) {
  return {
    content: winnerUserIds.length > 0 ? winnerUserIds.map((id) => `<@${id}>`).join(' ') : undefined,
    embeds: [buildGiveawayResultEmbed(giveaway, winnerUserIds, reason)],
  };
}