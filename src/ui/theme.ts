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
  secondary: 0x2b2d31,
  success: 0x2ecc71,
  warning: 0xf1c40f,
  danger: 0xe74c3c,
  info: 0x3498db,
  neutral: 0x2b2d31,
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