/**
 * services/giveawayService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Giveaway business logic — decides WHAT happened (who entered, who won,
 * whether a giveaway already ended), using database/giveaways.repository.ts.
 * Discord side-effects (posting/editing messages) are delegated to
 * services/giveawayPresentation.ts. This is the layering approved for
 * the feature: repository -> service -> Discord presentation.
 *
 * This file is the ONLY place, alongside giveawayScheduler.ts, that
 * imports the repository directly — commands and buttons always call
 * into this file, never the repository.
 */

import { randomUUID } from 'node:crypto';
import { Client, TextChannel } from 'discord.js';
import * as repo from '../database/giveaways.repository';
import {
  postGiveawayPanel,
  deleteGiveawayMessage,
  updateGiveawayPanelEnded,
  announceGiveawayWinners,
} from './giveawayPresentation';
import { logger } from '../utils/logger';

export interface CreateGiveawayParams {
  channel: TextChannel;
  guildId: string;
  prize: string;
  winnerCount: number;
  createdBy: string;
  endsAt: Date;
}

/**
 * Creates a giveaway: posts the panel message, then inserts the DB row
 * using that message's real ID. If the insert fails, the just-sent panel
 * message is deleted so we never leave an orphaned message whose button
 * points at a giveaway that doesn't exist in the database — the whole
 * operation fails cleanly rather than leaving inconsistent state.
 *
 * The giveaway's ID is generated here (client-side, via randomUUID())
 * rather than left to Postgres — this is what lets the panel's Enter
 * button reference the correct ID from the moment the message is sent,
 * before the database row exists at all.
 */
export async function createGiveaway(params: CreateGiveawayParams): Promise<repo.GiveawayRow> {
  const id = randomUUID();

  const message = await postGiveawayPanel(params.channel, {
    id,
    prize: params.prize,
    winnerCount: params.winnerCount,
    endsAt: params.endsAt,
  });

  try {
    return await repo.insertGiveaway({
      id,
      guildId: params.guildId,
      channelId: params.channel.id,
      messageId: message.id,
      prize: params.prize,
      winnerCount: params.winnerCount,
      createdBy: params.createdBy,
      endsAt: params.endsAt,
    });
  } catch (error) {
    logger.error(error as Error, 'GiveawayService');
    await deleteGiveawayMessage(params.channel.client, params.channel.id, message.id);
    throw error;
  }
}

export type EntryOutcome = 'entered' | 'already-entered' | 'ended' | 'failed';

export async function enterGiveaway(giveawayId: string, userId: string): Promise<EntryOutcome> {
  const giveaway = await repo.getGiveaway(giveawayId);
  if (!giveaway || giveaway.status !== 'active') return 'ended';

  try {
    const inserted = await repo.insertEntry(giveawayId, userId);
    return inserted ? 'entered' : 'already-entered';
  } catch (error) {
    logger.error(error as Error, 'GiveawayService');
    return 'failed';
  }
}

export function listActiveGiveaways(guildId: string): Promise<repo.GiveawayRow[]> {
  return repo.listActiveGiveaways(guildId);
}

/**
 * The single "determine what happens when a giveaway ends" implementation.
 * Picks winners, records them, marks the giveaway ended. Pure business
 * logic — does not touch Discord. Returns null if the giveaway doesn't
 * exist or was already ended, so callers can no-op instead of
 * double-announcing.
 */
async function determineGiveawayOutcome(
  giveawayId: string,
): Promise<{ giveaway: repo.GiveawayRow; winners: string[] } | null> {
  const giveaway = await repo.getGiveaway(giveawayId);
  if (!giveaway || giveaway.status !== 'active') return null;

  const winners = await repo.getRandomEntrants(giveawayId, giveaway.winner_count);
  await repo.replaceWinners(giveawayId, winners);
  await repo.markGiveawayEnded(giveawayId);

  return { giveaway: { ...giveaway, status: 'ended', ended_at: new Date().toISOString() }, winners };
}

/**
 * Ends a giveaway: determines the outcome, then updates the panel message
 * and announces winners. This is the ONE implementation used by both the
 * scheduler (automatic) and /giveaway end (manual) — see
 * services/giveawayScheduler.ts and commands/giveaway.ts. Returns false
 * if there was nothing to end (already ended, or doesn't exist).
 */
export async function endGiveaway(client: Client, giveawayId: string): Promise<boolean> {
  const outcome = await determineGiveawayOutcome(giveawayId);
  if (!outcome) return false;

  await updateGiveawayPanelEnded(client, outcome.giveaway);
  await announceGiveawayWinners(client, outcome.giveaway, outcome.winners, 'initial');
  return true;
}

/**
 * Redraws winners for an already-ended giveaway, excluding the previous
 * winners by default, and replaces the winner set entirely — V1 does not
 * keep reroll history (see architecture notes; `giveaway_winners` holds
 * only the current winner set, not every past draw).
 */
export async function rerollGiveaway(client: Client, giveawayId: string): Promise<boolean> {
  const giveaway = await repo.getGiveaway(giveawayId);
  if (!giveaway || giveaway.status !== 'ended') return false;

  const previousWinners = await repo.getWinners(giveawayId);
  const newWinners = await repo.getRandomEntrants(
    giveawayId,
    giveaway.winner_count,
    previousWinners,
  );

  await repo.replaceWinners(giveawayId, newWinners);
  await announceGiveawayWinners(client, giveaway, newWinners, 'reroll');
  return true;
}