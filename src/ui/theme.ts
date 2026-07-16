/**
 * ui/theme.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The single source of truth for the bot's visual identity: colors and
 * icons. Nothing else in the bot should hardcode a hex color or a
 * status/branding emoji — reference `colors.*` / `icons.*` instead.
 * Change a value here and it propagates to every embed and button in the
 * bot automatically.
 */

import { botConfig } from '../config/bot.config';

export const colors = {
  primary: 0xf1c40f, // Bot role color (gold/yellow) — update if you grab the exact hex later
  secondary: 0x2b2d31,
  success: 0x2ecc71,
  warning: 0xf1c40f,
  danger: 0xe74c3c,
  info: 0x3498db,
  neutral: 0x2b2d31,
} as const;

export type ColorKey = keyof typeof colors;

/**
 * Unicode emoji for now, so the bot looks good with zero setup. Swap any
 * of these for a custom Discord emoji string (e.g. `<:verified:123456789>`)
 * once the server has its own emoji set — this is the only place that
 * needs to change; every embed/button referencing `icons.success` updates
 * automatically.
 */
export const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  loading: '⏳',
  lock: '🔒',
  unlock: '🔓',
  star: '⭐',
  crown: '👑',
  bolt: '⚡',
  chart: '📊',
  megaphone: '📣',
  gift: '🎁',
  id: '🪪',
  wallet: '👛',
  shield: '🛡️',
  arrowRight: '➜',
} as const;

export type IconKey = keyof typeof icons;

/**
 * Brand identity used in embed footers/authors by default. `name` is
 * pulled from bot.config.ts (the one place that owns the bot's display
 * name) so it isn't duplicated here. Fill in `iconURL` once you have a
 * server icon / bot avatar hosted somewhere — every embed's footer will
 * pick it up automatically.
 */
export const brand = {
  name: botConfig.name,
  iconURL: undefined as string | undefined,
};
/**
 * Converts a numeric color (e.g. colors.primary, the format ui/embed.ts
 * uses) into a CSS hex string (e.g. "#5865f2"), the format
 * @napi-rs/canvas expects. Lets welcomeThemes.config.ts reuse the bot's
 * actual brand colors instead of hardcoding a second, separate set of
 * hex values that could drift out of sync.
 */
export function toHex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}