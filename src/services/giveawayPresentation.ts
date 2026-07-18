async function fetchTextChannel(client: Client, channelId: string): Promise<TextChannel | null> {
  const cached = client.channels.cache.get(channelId);

  if (cached instanceof TextChannel) {
    return cached;
  }

  try {
    const fetched = await client.channels.fetch(channelId);

    if (fetched instanceof TextChannel) {
      return fetched;
    }
  } catch (error) {
    logger.error(error as Error, 'GiveawayPresentation');
  }

  return null;
}

/**
 * services/giveawayPresentation.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Discord-side effects for the Giveaway System — posting the panel,
 * editing it to "ended", announcing winners, and rolling back a panel
 * message if creation fails partway through. Deliberately isolated from
 * giveawayService.ts's business logic (which decides WHAT happened),
 * so either layer can be reused independently later — e.g. a future
 * "resend winner announcement" admin action could call
 * announceGiveawayWinners directly without re-running the logic that
 * determines winners.
 *
 * No repository/database access here — this file only talks to Discord.
 */

import { Client, Message, TextChannel } from 'discord.js';
import { GiveawayRow } from '../database/giveaways.repository';
import {
  buildGiveawayPanelPayload,
  buildActiveGiveawayPanelEmbed,
  buildEndedGiveawayPanelEmbed,
  GiveawayPanelData,
} from '../embeds/giveawayPanel';
import { buildGiveawayResultPayload, GiveawayResultReason } from '../embeds/giveawayResult';
import { buildCollectionPanelPayload } from '../embeds/giveawayCollectionPanel';
import { CollectionStatus } from './giveawayCollectionService';
import { logger } from '../utils/logger';

/** Sends the initial giveaway panel message. Throws on failure — the caller decides how to handle that. */
export async function postGiveawayPanel(
  channel: TextChannel,
  data: GiveawayPanelData,
): Promise<Message> {
  return channel.send(buildGiveawayPanelPayload(data));
}

/**
 * Best-effort cleanup — deletes a giveaway panel message. Used to roll
 * back a failed creation (see giveawayService.createGiveaway). Never
 * throws: a rollback failing shouldn't mask the original error that
 * triggered it.
 */
export async function deleteGiveawayMessage(
  client: Client,
  channelId: string,
  messageId: string,
): Promise<void> {
  try {
    const channel = await fetchTextChannel(client, channelId);
if (!channel) return;

    const message = await channel.messages.fetch(messageId);
    await message.delete();
  } catch (error) {
    logger.error(error as Error, 'GiveawayPresentation');
  }
}

/** Edits the original panel message to show the giveaway has ended and disables entry. */
export async function updateGiveawayPanelEnded(
  client: Client,
  giveaway: GiveawayRow,
): Promise<void> {
  try {
    const channel = await fetchTextChannel(client, giveaway.channel_id);
if (!channel) return;

    const message = await channel.messages.fetch(giveaway.message_id);
    await message.edit({
      embeds: [buildEndedGiveawayPanelEmbed(giveaway)],
      components: [],
    });
  } catch (error) {
  logger.error(
    new Error(
      [
        'Failed to update giveaway panel',
        `Giveaway ID: ${giveaway.id}`,
        `Channel ID: ${giveaway.channel_id}`,
        `Message ID: ${giveaway.message_id}`,
        `Original Error: ${error}`,
      ].join('\n'),
    ),
    'GiveawayPresentation',
  );
}
}

/** Posts a winner announcement message to the giveaway's channel. */
export async function announceGiveawayWinners(
  client: Client,
  giveaway: GiveawayRow,
  winnerUserIds: string[],
  reason: GiveawayResultReason,
): Promise<void> {
  try {
    const channel = await fetchTextChannel(client, giveaway.channel_id);
if (!channel) return;

    await channel.send(buildGiveawayResultPayload(giveaway, winnerUserIds, reason));
  } catch (error) {
  logger.error(
    new Error(
      [
        'Failed to announce giveaway winners',
        `Giveaway ID: ${giveaway.id}`,
        `Channel ID: ${giveaway.channel_id}`,
        `Message ID: ${giveaway.message_id}`,
        `Original Error: ${error}`,
      ].join('\n'),
    ),
    'GiveawayPresentation',
  );
}
}
/**
 * Edits the panel's embed to reflect a new entry count. Only `embeds` is
 * passed to `.edit()` — `components` is deliberately omitted rather than
 * re-specified, which leaves the existing Enter button exactly as it was
 * (Discord's message edit only touches fields you explicitly include).
 *
 * Called from services/giveawayScheduler.ts, and only when the count has
 * actually changed since the last tick — never on every single entry.
 */
export async function updateGiveawayPanelEntryCount(
  client: Client,
  giveaway: GiveawayRow,
  entryCount: number,
): Promise<void> {
  try {
    const channel = await fetchTextChannel(client, giveaway.channel_id);
if (!channel) return;

    const message = await channel.messages.fetch(giveaway.message_id);
    await message.edit({
      embeds: [
        buildActiveGiveawayPanelEmbed({
          id: giveaway.id,
          prize: giveaway.prize,
          winnerCount: giveaway.winner_count,
          endsAt: new Date(giveaway.ends_at),
          entryCount,
        }),
      ],
    });
  } catch (error) {
  logger.error(
    new Error(
      [
        'Failed to update giveaway entry count',
        `Giveaway ID: ${giveaway.id}`,
        `Channel ID: ${giveaway.channel_id}`,
        `Message ID: ${giveaway.message_id}`,
        `Original Error: ${error}`,
      ].join('\n'),
    ),
    'GiveawayPresentation',
  );
}
  
}
/** Posts the winner collection panel for the first time (called once, when a giveaway with a collection type ends). */
export async function postCollectionPanel(
  client: Client,
  channelId: string,
  giveaway: GiveawayRow,
  status: CollectionStatus,
): Promise<Message | null> {
  try {
    const channel = await fetchTextChannel(client, channelId);
if (!channel) return null;

    return await channel.send(buildCollectionPanelPayload(giveaway, status));
  } catch (error) {
    logger.error(error as Error, 'GiveawayPresentation');
    return null;
  }
}

/**
 * Edits the collection panel in place after a submission. Unlike entry
 * counts (throttled through the scheduler due to potentially hundreds of
 * entries), this edits immediately — submissions are bounded by
 * winner_count, realistically single digits, so there's no rate-limit
 * risk at this scale and immediate feedback is better UX.
 */
export async function updateCollectionPanel(
  client: Client,
  giveaway: GiveawayRow,
  status: CollectionStatus,
): Promise<void> {
  if (!giveaway.collection_channel_id || !giveaway.collection_message_id) return;

  try {
  const channel = await fetchTextChannel(
  client,
  giveaway.collection_channel_id,
);
if (!channel) return;

    const message = await channel.messages.fetch(giveaway.collection_message_id);
    await message.edit(buildCollectionPanelPayload(giveaway, status));
  } catch (error) {
    logger.error(error as Error, 'GiveawayPresentation');
  }
}