/**
 * ui/embed.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The ONLY module in the codebase that should call `new EmbedBuilder()`.
 * Every embed anywhere else — rules, verification, giveaways, citizen
 * profiles, leaderboards — must be created via `createEmbed()` or one of
 * the semantic presets in `embeds.*` below, so the whole bot shares one
 * visual language and can be restyled from this single file.
 *
 * This is enforced, not just documented: `eslint.config.js` errors on
 * `new EmbedBuilder()` anywhere outside `src/ui/**`.
 */

import { EmbedBuilder } from 'discord.js';
import { brand, colors, icons, IconKey } from './theme';

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedOptions {
  title?: string;
  description?: string;
  color?: number;
  /** Prefixes the title with a theme icon, e.g. `icon: 'success'` → "✅ Title". */
  icon?: IconKey;
  fields?: EmbedField[];
  thumbnail?: string;
  image?: string;
  url?: string;
  author?: { name: string; iconURL?: string; url?: string };
  /** Overrides the default brand footer text. Pass `null` to omit the footer entirely. */
  footerText?: string | null;
  footerIconURL?: string;
  /** Every embed is timestamped by default — pass `false` to opt out. */
  timestamp?: boolean;
}

/**
 * The base factory. Every embed in the bot — including the semantic
 * presets below — funnels through this function, which is what guarantees
 * consistent branding (footer, timestamp, color palette) everywhere.
 */
export function createEmbed(options: EmbedOptions = {}): EmbedBuilder {
  const embed = new EmbedBuilder().setColor(options.color ?? colors.primary);

  const title = options.icon
    ? `${icons[options.icon]} ${options.title ?? ''}`.trim()
    : options.title;
  if (title) embed.setTitle(title);

  if (options.description) embed.setDescription(options.description);
  if (options.url) embed.setURL(options.url);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);
  if (options.fields?.length) embed.addFields(options.fields);

  if (options.author) {
    embed.setAuthor({
      name: options.author.name,
      iconURL: options.author.iconURL,
      url: options.author.url,
    });
  }

  if (options.footerText !== null) {
    embed.setFooter({
      text: options.footerText ?? brand.name,
      iconURL: options.footerIconURL ?? brand.iconURL,
    });
  }

  if (options.timestamp !== false) embed.setTimestamp();

  return embed;
}

/**
 * Semantic presets covering the common cases — a status reply, an error,
 * a warning, or a neutral branded panel (rules, verification, profiles).
 * Prefer these over `createEmbed` directly whenever the embed is
 * communicating one of these states; it keeps color/icon choices
 * consistent across every feature instead of each command re-deciding
 * "what color is an error embed".
 */
export const embeds = {
  success: (options: Omit<EmbedOptions, 'color' | 'icon'>) =>
    createEmbed({ ...options, color: colors.success, icon: 'success' }),

  error: (options: Omit<EmbedOptions, 'color' | 'icon'>) =>
    createEmbed({ ...options, color: colors.danger, icon: 'error' }),

  warning: (options: Omit<EmbedOptions, 'color' | 'icon'>) =>
    createEmbed({ ...options, color: colors.warning, icon: 'warning' }),

  info: (options: Omit<EmbedOptions, 'color' | 'icon'>) =>
    createEmbed({ ...options, color: colors.info, icon: 'info' }),

  /** Neutral/branded default — for feature panels that aren't a status message. */
  brand: (options: EmbedOptions) =>
    createEmbed({ ...options, color: options.color ?? colors.primary }),
};
