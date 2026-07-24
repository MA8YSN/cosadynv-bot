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
  primary: 0x5865f2,
  secondary: 0x5865f2,
  success: 0x5865f2,
  warning: 0x5865f2,
  danger: 0x5865f2,
  info: 0x5865f2,
  neutral: 0x5865f2,
} as const;

export type ColorKey = keyof typeof colors;

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

export const brand = {
  name: botConfig.name,
  // TODO: set this to your hosted community logo URL. Used as the footer
  // icon everywhere, and as the thumbnail on any embed built with
  // `useLogo: true`. Until set, both simply render without an icon.
  iconURL: undefined as string | undefined,
};

export function toHex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}