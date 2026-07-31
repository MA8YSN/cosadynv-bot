import { embeds, buttons, row, colors } from '../ui';
import { GiveawayRow } from '../database/giveaways.repository';
import { ASSETS } from '../config/assets';

export interface GiveawayPanelData {
  id: string;
  prize: string;
  winnerCount: number;
  endsAt: Date;
  entryCount: number;
}

export function buildActiveGiveawayPanelEmbed(giveaway: GiveawayPanelData) {
  const endsAtSeconds = Math.floor(giveaway.endsAt.getTime() / 1000);

  return embeds.banner({
    title: 'Giveaway',
    icon: 'gift',
    image: ASSETS.banners.giveaway || undefined,
    description: 'Click the button below to enter.',
    fields: [
      { name: 'Prize', value: giveaway.prize, inline: true },
      { name: 'Winners', value: String(giveaway.winnerCount), inline: true },
      { name: 'Entries', value: String(giveaway.entryCount), inline: true },
      { name: 'Ends', value: `<t:${endsAtSeconds}:R>`, inline: true },
    ],
  });
}

export function buildEndedGiveawayPanelEmbed(giveaway: GiveawayRow) {
  return embeds.brand({
    title: 'Giveaway Ended',
    icon: 'gift',
    color: colors.neutral,
    description: 'This giveaway has ended. Winners have been announced below.',
    fields: [{ name: 'Prize', value: giveaway.prize, inline: true }],
  });
}

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