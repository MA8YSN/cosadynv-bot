/**
 * services/giveawayCollectionService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Business logic for winner collection (V1: wallets, generalized for
 * future types via config/giveawayCollectionTypes.config.ts). Talks to
 * both giveaways.repository.ts (for winner lookups) and
 * giveawayCollections.repository.ts (for submissions) — this file is a
 * peer service to giveawayService.ts, so direct repository access here
 * is expected, same as giveawayScheduler.ts already does.
 */

import { Client } from 'discord.js';
import { getGiveaway, getWinners, GiveawayRow } from '../database/giveaways.repository';
import {
  getCollectionEntries,
  upsertCollectionEntry,
} from '../database/giveawayCollections.repository';
import { getCollectionTypeByKey } from '../config/giveawayCollectionTypes.config';
import { logger } from '../utils/logger';

export type SubmitOutcome =
  | 'submitted'
  | 'not-a-winner'
  | 'invalid-value'
  | 'no-collection'
  | 'failed';

export async function isGiveawayWinner(giveawayId: string, userId: string): Promise<boolean> {
  const winners = await getWinners(giveawayId);
  return winners.includes(userId);
}

/** Re-checks winner status and re-validates the value server-side — never trust the button alone. */
export async function submitCollectionEntry(
  giveaway: GiveawayRow,
  userId: string,
  rawValue: string,
): Promise<SubmitOutcome> {
  if (!giveaway.collection_type) return 'no-collection';

  const type = getCollectionTypeByKey(giveaway.collection_type);
  if (!type) return 'no-collection';

  const isWinner = await isGiveawayWinner(giveaway.id, userId);
  if (!isWinner) return 'not-a-winner';

  const value = rawValue.trim();
  const config = giveaway.collection_config ?? {};
  if (!type.validate(value, config)) return 'invalid-value';

  try {
    await upsertCollectionEntry(giveaway.id, userId, value);
    return 'submitted';
  } catch (error) {
    logger.error(error as Error, 'GiveawayCollectionService');
    return 'failed';
  }
}

export interface CollectionStatusRow {
  userId: string;
  submitted: boolean;
  submittedAt: string | null;
}

export interface CollectionStatus {
  rows: CollectionStatusRow[];
  submittedCount: number;
  totalCount: number;
}

/** Cross-references winners with submissions, computed here rather than in SQL — matches this project's existing "logic in services" convention. */
export async function getCollectionStatus(giveawayId: string): Promise<CollectionStatus> {
  const winners = await getWinners(giveawayId);
  const entries = await getCollectionEntries(giveawayId);
  const entryByUser = new Map(entries.map((entry) => [entry.user_id, entry]));

  const rows: CollectionStatusRow[] = winners.map((userId) => {
    const entry = entryByUser.get(userId);
    return {
      userId,
      submitted: Boolean(entry),
      submittedAt: entry?.submitted_at ?? null,
    };
  });

  return {
    rows,
    submittedCount: rows.filter((row) => row.submitted).length,
    totalCount: rows.length,
  };
}

/** Resolves a Discord user ID to a username for the CSV export, falling back to the raw ID if the user can't be fetched (left the server, etc). */
async function resolveUsername(client: Client, userId: string): Promise<string> {
  try {
    const user = await client.users.fetch(userId);
    return user.username;
  } catch {
    return userId;
  }
}

function formatCsvTimestamp(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;
}

export async function exportCollectionAsCsv(giveaway: GiveawayRow, client: Client): Promise<string> {
  const type = getCollectionTypeByKey(giveaway.collection_type);
  const fieldLabel = type?.fieldLabel ?? 'Value';
  const entries = await getCollectionEntries(giveaway.id);

  const header = `User,${fieldLabel},Submitted`;

  const lines = await Promise.all(
    entries.map(async (entry) => {
      const username = await resolveUsername(client, entry.user_id);
      return `${username},${entry.value},${formatCsvTimestamp(entry.submitted_at)}`;
    }),
  );

  return [header, ...lines].join('\n');
}

/** Thin re-export so commands never import the giveaways repository directly. */
export function getGiveawayById(id: string): Promise<GiveawayRow | null> {
  return getGiveaway(id);
}