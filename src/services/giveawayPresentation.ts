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
  buildEndedGiveawayPanelEmbed,
  GiveawayPanelData,
} from '../embeds/giveawayPanel';
import { buildGiveawayResultPayload, GiveawayResultReason } from '../embeds/giveawayResult';
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
    const channel = await client.channels.fetch(channelId);
    if (!channel || !(channel instanceof TextChannel)) return;

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
    const channel = await client.channels.fetch(giveaway.channel_id);
    if (!channel || !(channel instanceof TextChannel)) return;

    const message = await channel.messages.fetch(giveaway.message_id);
    await message.edit({
      embeds: [buildEndedGiveawayPanelEmbed(giveaway)],
      components: [],
    });
  } catch (error) {
    logger.error(error as Error, 'GiveawayPresentation');
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
    const channel = await client.channels.fetch(giveaway.channel_id);
    if (!channel || !(channel instanceof TextChannel)) return;

    await channel.send(buildGiveawayResultPayload(giveaway, winnerUserIds, reason));
  } catch (error) {
    logger.error(error as Error, 'GiveawayPresentation');
  }
}