/**
 * config/welcomeThemes.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Every welcome card theme is DATA here, not code. services/welcomeImageService.ts
 * has exactly one render function that interprets whatever WelcomeThemeLayout
 * it's given — adding a theme means adding a new object to WELCOME_THEMES
 * below, never touching the renderer. This is the layout-contract
 * philosophy confirmed before implementation: same idea as ui/buttons.ts's
 * five style factories, applied to card layouts instead of buttons.
 *
 * V1 ships two themes (Classic, Space) by design — Cyber/Gaming/NFT/Crypto
 * are intentionally deferred, and adding each later is exactly "one more
 * object in this array," not a rewrite.
 *
 * Colors reuse the bot's actual ui/theme.ts palette via toHex() rather
 * than hardcoding a second set of hex values — if the bot's brand color
 * changes, these cards pick it up automatically.
 */

import { colors, toHex } from '../ui';
import { WELCOME_CONFIG } from './welcome.config';

export interface WelcomeThemeLayout {
  key: string;
  label: string;
  canvas: { width: number; height: number };

  background:
    | { type: 'solid'; color: string }
    | { type: 'gradient'; from: string; to: string; angleDeg: number }
    | { type: 'serverBanner'; overlayColor: string; overlayOpacity: number };

  decorations: DecorationSpec[];

  logo?: {
    anchor: { x: number; y: number };
    size: number;
    shape: 'circle' | 'square';
    borderColor?: string;
    borderWidth?: number;
  };

  avatar: {
    anchor: { x: number; y: number };
    size: number;
    shape: 'circle' | 'square';
    borderColor: string;
    borderWidth: number;
  };

  textElements: TextElementSpec[];

  fonts: { heading: string; body: string };
}

export interface TextElementSpec {
  /** May contain {variables} — resolved via welcomeVariables.ts before rendering. Use {username}, not {user}, here — a raw <@id> mention renders as broken literal text on a canvas image. */
  content: string;
  anchor: { x: number; y: number };
  align: 'left' | 'center' | 'right';
  font: 'heading' | 'body';
  size: number;
  weight: 'normal' | 'bold';
  color: string;
  letterSpacing?: number;
}

export type DecorationSpec =
  | { type: 'radialGlow'; x: number; y: number; radius: number; color: string; opacity: number }
  | { type: 'grid'; color: string; opacity: number; spacing: number }
  | { type: 'particles'; count: number; color: string; sizeRange: [number, number] }
  | { type: 'frame'; color: string; width: number; inset: number }
  | { type: 'stripe'; y: number; height: number; color: string };

const CANVAS = { width: WELCOME_CONFIG.canvasWidth, height: WELCOME_CONFIG.canvasHeight };

export const CLASSIC_THEME: WelcomeThemeLayout = {
  key: 'classic',
  label: 'Classic',
  canvas: CANVAS,
  background: { type: 'gradient', from: '#1e1f22', to: '#2b2d31', angleDeg: 135 },
  decorations: [{ type: 'frame', color: toHex(colors.primary), width: 4, inset: 12 }],
  logo: {
    anchor: { x: 0.08, y: 0.5 },
    size: 90,
    shape: 'circle',
    borderColor: toHex(colors.primary),
    borderWidth: 3,
  },
  avatar: {
    anchor: { x: 0.5, y: 0.32 },
    size: 140,
    shape: 'circle',
    borderColor: toHex(colors.primary),
    borderWidth: 5,
  },
  textElements: [
    {
      content: 'WELCOME TO',
      anchor: { x: 0.5, y: 0.58 },
      align: 'center',
      font: 'body',
      size: 22,
      weight: 'normal',
      color: '#B5B5B5',
      letterSpacing: 4,
    },
    {
      content: '{server}',
      anchor: { x: 0.5, y: 0.68 },
      align: 'center',
      font: 'heading',
      size: 44,
      weight: 'bold',
      color: '#FFFFFF',
    },
    {
      content: '@{username}',
      anchor: { x: 0.5, y: 0.82 },
      align: 'center',
      font: 'body',
      size: 24,
      weight: 'normal',
      color: toHex(colors.primary),
    },
    {
      content: 'Member #{member_count}',
      anchor: { x: 0.5, y: 0.92 },
      align: 'center',
      font: 'body',
      size: 18,
      weight: 'normal',
      color: '#8A8A8A',
    },
  ],
  fonts: { heading: WELCOME_CONFIG.fontFamily, body: WELCOME_CONFIG.fontFamily },
};

export const SPACE_THEME: WelcomeThemeLayout = {
  key: 'space',
  label: 'Space',
  canvas: CANVAS,
  background: { type: 'gradient', from: '#05050f', to: '#141432', angleDeg: 160 },
  decorations: [
    { type: 'particles', count: 90, color: '#FFFFFF', sizeRange: [1, 2.5] },
    { type: 'radialGlow', x: 0.5, y: 0.32, radius: 220, color: toHex(colors.info), opacity: 0.35 },
  ],
  logo: {
    anchor: { x: 0.08, y: 0.5 },
    size: 90,
    shape: 'circle',
    borderColor: toHex(colors.info),
    borderWidth: 3,
  },
  avatar: {
    anchor: { x: 0.5, y: 0.32 },
    size: 150,
    shape: 'circle',
    borderColor: '#FFFFFF',
    borderWidth: 4,
  },
  textElements: [
    {
      content: 'WELCOME TO',
      anchor: { x: 0.5, y: 0.58 },
      align: 'center',
      font: 'body',
      size: 22,
      weight: 'normal',
      color: '#8FA5FF',
      letterSpacing: 6,
    },
    {
      content: '{server}',
      anchor: { x: 0.5, y: 0.68 },
      align: 'center',
      font: 'heading',
      size: 46,
      weight: 'bold',
      color: '#FFFFFF',
    },
    {
      content: '@{username}',
      anchor: { x: 0.5, y: 0.82 },
      align: 'center',
      font: 'body',
      size: 24,
      weight: 'normal',
      color: toHex(colors.info),
    },
    {
      content: 'Member #{member_count}',
      anchor: { x: 0.5, y: 0.92 },
      align: 'center',
      font: 'body',
      size: 18,
      weight: 'normal',
      color: '#6C6C8A',
    },
  ],
  fonts: { heading: WELCOME_CONFIG.fontFamily, body: WELCOME_CONFIG.fontFamily },
};

export const WELCOME_THEMES: WelcomeThemeLayout[] = [CLASSIC_THEME, SPACE_THEME];

export function getThemeByKey(key: string): WelcomeThemeLayout | undefined {
  return WELCOME_THEMES.find((theme) => theme.key === key);
}