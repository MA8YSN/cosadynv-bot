/**
 * config/giveaway.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Static, non-secret behavior settings for the Giveaway System. Giveaway
 * DATA (prizes, winner counts, entries) lives in Supabase — this file is
 * only for settings that apply to the feature as a whole.
 */

export const GIVEAWAY_CONFIG = {
  /**
   * How often the background scheduler runs. Each tick does two things:
   * ends any giveaway whose duration has elapsed, and refreshes the live
   * entry count on every other active giveaway's panel (only editing a
   * panel if its count actually changed since the last tick).
   *
   * Lower = more responsive entry-count updates, more Discord API calls.
   * Higher = less responsive, fewer calls. 30s is a reasonable default
   * for most communities — smaller/quieter servers could go to 10-15s,
   * very large ones may prefer 60s.
   */
  schedulerIntervalMs: 30 * 1000,

  /**
   * Display-only for V1 — shown on the winner collection panel as a
   * countdown, but nothing automatically happens when it passes. Staff
   * decide manually what to do about non-responders, using the existing
   * /giveaway reroll command. Actual enforcement (auto-reroll, auto-ping)
   * would mean extending the scheduler again — a real feature, not built
   * until something actually asks for it.
   */
  walletSubmissionDeadlineHours: 24,
};