/**
 * config/welcome.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Static, non-guild-specific Welcome System settings. This is NOT where
 * admin-chosen settings live (channel, theme, message, DM toggle) — those
 * are per-guild and persist in Supabase via welcomeConfig.repository.ts.
 * This file is only for values that apply the same way everywhere.
 */

export const WELCOME_CONFIG = {
  canvasWidth: 1024,
  canvasHeight: 500,

  defaultTheme: 'classic',
  defaultMessageTemplate: 'Welcome {user} to {server}! You are member #{member_count}. 🎉',

  /** Documents every variable resolveWelcomeVariables() supports — see services/welcomeVariables.ts. */
  availableVariables: [
    '{user}',
    '{username}',
    '{server}',
    '{member_count}',
    '{created_at}',
    '{joined_at}',
  ],

  /** Setup wizard draft sessions auto-expire after this long, matching Embed Studio's convention. */
  sessionTtlMs: 15 * 60 * 1000,

  /**
   * @napi-rs/canvas has no fallback system font on a bare container —
   * without an explicitly bundled + registered font, card text renders
   * invisibly. `fontFamily` is the name we register the file under
   * (arbitrary — not tied to the actual font's real name);
   * `fontFileName` is the file expected at assets/fonts/<fontFileName>.
   * See assets/fonts/README.md for setup and
   * services/welcomeImageService.ts for where this gets loaded.
   */
  fontFamily: 'WelcomeCardFont',
  fontFileName: 'Inter-Regular.ttf',
};