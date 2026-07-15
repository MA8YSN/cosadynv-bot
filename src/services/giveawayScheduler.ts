/**
 * services/giveawayScheduler.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Background loop that finds expired active giveaways and ends them
 * automatically, using the exact same endGiveaway() implementation
 * /giveaway end calls manually — see giveawayService.ts. Started once
 * from index.ts after login.
 *
 * Guarded against overlap: if a check is still running when the next
 * tick fires, that tick is skipped rather than running concurrently.
 * Safe across bot restarts — giveaway state lives in Supabase, not
 * memory, so a missed tick just gets caught on the next one.
 */

import { Client } from 'discord.js';
import { listExpiredActiveGiveaways } from '../database/giveaways.repository';
import { endGiveaway } from './giveawayService';
import { GIVEAWAY_CONFIG } from '../config/giveaway.config';
import { logger } from '../utils/logger';

let isChecking = false;

async function checkExpiredGiveaways(client: Client): Promise<void> {
  if (isChecking) return;
  isChecking = true;

  try {
    const expired = await listExpiredActiveGiveaways();
    for (const giveaway of expired) {
      await endGiveaway(client, giveaway.id);
    }
  } catch (error) {
    logger.error(error as Error, 'GiveawayScheduler');
  } finally {
    isChecking = false;
  }
}

export function startGiveawayScheduler(client: Client): void {
  setInterval(() => {
    void checkExpiredGiveaways(client);
  }, GIVEAWAY_CONFIG.schedulerIntervalMs);

  logger.info(
    `Giveaway scheduler started (checking every ${GIVEAWAY_CONFIG.schedulerIntervalMs / 1000}s)`,
    'GiveawayScheduler',
  );
}