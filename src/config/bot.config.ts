/**
 * config/bot.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Non-secret, non-environment configuration: the bot's display name and
 * the gateway intents/partials the client needs.
 *
 * Keeping this separate from env.ts matters: env.ts is "what differs per
 * deployment" (tokens, IDs). This file is "what defines the bot's runtime
 * identity" and can safely be committed to git.
 *
 * Note: brand COLORS and ICONS live in `src/ui/theme.ts`, not here — that's
 * the design system's job (see src/ui/README.md). This file intentionally
 * does not duplicate them.
 */

import { GatewayIntentBits, Partials } from 'discord.js';

export const botConfig = {
  /** Displayed in embed footers etc. Adjust to your community's branding. */
  name: 'Community Bot',

  /**
   * Gateway intents: the events Discord will actually send us.
   * Only request what's needed — fewer intents means less data to process
   * and fewer privileged-intent approvals required in the Dev Portal.
   *
   * GuildMembers is a PRIVILEGED intent — added here for the Welcome
   * System's guildMemberAdd listener, but code alone isn't enough: it
   * must also be manually enabled in the Discord Developer Portal
   * (Bot tab -> Server Members Intent), or the gateway connection will
   * be rejected outright once this intent is requested.
   */
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],

  /** Partials let discord.js handle uncached structures (e.g. old messages). */
  partials: [Partials.Message, Partials.Channel],
} as const;
