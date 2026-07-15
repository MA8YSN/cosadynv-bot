/**
 * config/giveaway.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Static, non-secret behavior settings for the Giveaway System. Giveaway
 * DATA (prizes, winner counts, entries) lives in Supabase — this file is
 * only for settings that apply to the feature as a whole.
 */

export const GIVEAWAY_CONFIG = {
  /** How often the background scheduler checks for expired giveaways. */
  schedulerIntervalMs: 30 * 1000,
};