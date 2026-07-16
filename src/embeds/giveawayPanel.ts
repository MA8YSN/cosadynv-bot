/**
 * embeds/giveawayPanel.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The giveaway panel — active and ended variants — plus the Enter button.
 * Built entirely through src/ui. Pure rendering only: takes plain data,
 * returns embeds/payloads. No Discord sending, no database access — that
 * belongs to services/giveawayPresentation.ts and
 * database/giveaways.repository.ts respectively.
 */

import { embeds, buttons, row, colors } from '../ui';
import { GiveawayRow } from '../database/giveaways.repository';

export interface GiveawayPanelData {
  id: string;
  prize: string;
  winnerCount: number;
  endsAt: Date;
  entryCount: number;
}

export function buildActiveGiveawayPanelEmbed(giveaway: GiveawayPanelData) {
  const endsAtSeconds = Math.floor(giveaway.endsAt.getTime() / 1000);

  return embeds.brand({
    title: 'Giveaway',
    icon: 'gift',
    description: [
      `**Prize:** ${giveaway.prize}`,
      `**Winners:** ${giveaway.winnerCount}`,
      `**Entries:** ${giveaway.entryCount}`,
      `**Ends:** <t:${endsAtSeconds}:R>`,
      '',
      'Click the button below to enter!',
    ].join('\n'),
  });
}

export function buildEndedGiveawayPanelEmbed(giveaway: GiveawayRow) {
  return embeds.brand({
    title: 'Giveaway Ended',
    icon: 'gift',
    color: colors.neutral,
    description: [
      `**Prize:** ${giveaway.prize}`,
      '',
      'This giveaway has ended. Winners have been announced below.',
    ].join('\n'),
  });
}

/** Full message payload for a freshly created giveaway — embed + the Enter button. */
export function buildGiveawayPanelPayload(giveaway: GiveawayPanelData) {
  const actionRow = row(
    buttons.success({
      customId: `giveaway_enter:${giveaway.id}`,
      label: 'Enter Giveaway',
      icon: 'gift',
    }),
  );

  return {
    embeds: [buildActiveGiveawayPanelEmbed(giveaway)],
    components: [actionRow],
  };
}