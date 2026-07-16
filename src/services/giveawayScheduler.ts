/**
 * services/giveawayScheduler.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Background loop with two jobs per tick, both reusing the same interval
 * (GIVEAWAY_CONFIG.schedulerIntervalMs) rather than running on separate
 * timers:
 *
 *   1. End any active giveaway whose duration has elapsed — using the
 *      exact same endGiveaway() implementation /giveaway end calls
 *      manually (see giveawayService.ts).
 *   2. Refresh the live entry count on every OTHER active giveaway's
 *      panel — but only when the count actually changed since the last
 *      tick, tracked in an in-memory map. This is what keeps this safe
 *      under load: 500 entries in one interval still produces at most
 *      one Discord edit per giveaway, not 500.
 *
 * Started once from index.ts after login. Guarded against overlap: if a
 * tick is still running when the next one fires, that tick is skipped.
 * Safe across bot restarts — giveaway state lives in Supabase, not
 * memory, so a missed tick just gets caught on the next one.
 */

import { Client } from 'discord.js';
import {
  listExpiredActiveGiveaways,
  listAllActiveGiveaways,
  countEntries,
} from '../database/giveaways.repository';
import { endGiveaway } from './giveawayService';
import { updateGiveawayPanelEntryCount } from './giveawayPresentation';
import { GIVEAWAY_CONFIG } from '../config/giveaway.config';
import { logger } from '../utils/logger';

let isChecking = false;

/**
 * Last entry count rendered on each giveaway's panel, keyed by giveaway
 * ID. Only edit Discord when the current count differs from this.
 * Cleared per-giveaway once it ends, so this never grows unbounded.
 */
const lastKnownEntryCounts = new Map<string, number>();

async function endExpiredGiveaways(client: Client): Promise<void> {
  const expired = await listExpiredActiveGiveaways();

  for (const giveaway of expired) {
    await endGiveaway(client, giveaway.id);
    lastKnownEntryCounts.delete(giveaway.id);
  }
}

async function refreshEntryCounts(client: Client): Promise<void> {
  // Runs after endExpiredGiveaways, so anything just ended above is
  // already 'ended' in the DB and won't appear in this "active" list —
  // no risk of double-editing a panel that was just replaced with the
  // "Ended" view.
  const active = await listAllActiveGiveaways();

  for (const giveaway of active) {
    const currentCount = await countEntries(giveaway.id);
    const lastCount = lastKnownEntryCounts.get(giveaway.id);

    if (currentCount === lastCount) continue;

    await updateGiveawayPanelEntryCount(client, giveaway, currentCount);
    lastKnownEntryCounts.set(giveaway.id, currentCount);
  }
}

async function runSchedulerTick(client: Client): Promise<void> {
  if (isChecking) return;
  isChecking = true;

  try {
    await endExpiredGiveaways(client);
    await refreshEntryCounts(client);
  } catch (error) {
    logger.error(error as Error, 'GiveawayScheduler');
  } finally {
    isChecking = false;
  }
}

export function startGiveawayScheduler(client: Client): void {
  setInterval(() => {
    void runSchedulerTick(client);
  }, GIVEAWAY_CONFIG.schedulerIntervalMs);

  logger.info(
    `Giveaway scheduler started (checking every ${GIVEAWAY_CONFIG.schedulerIntervalMs / 1000}s)`,
    'GiveawayScheduler',
  );
}