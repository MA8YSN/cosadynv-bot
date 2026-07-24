/**
 * ui/embed.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The ONLY module in the codebase that should call `new EmbedBuilder()`.
 * Enforced by eslint.config.js.
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
  icon?: IconKey;
  fields?: EmbedField[];
  thumbnail?: string;
  /** Uses the community logo (theme.brand.iconURL) as the thumbnail. Ignored if `thumbnail` is also set. */
  useLogo?: boolean;
  image?: string;
  url?: string;
  author?: { name: string; iconURL?: string; url?: string };
  footerText?: string | null;
  footerIconURL?: string;
  timestamp?: boolean;
}

export function createEmbed(options: EmbedOptions = {}): EmbedBuilder {
  const embed = new EmbedBuilder().setColor(options.color ?? colors.primary);

  const title = options.icon
    ? `${icons[options.icon]} ${options.title ?? ''}`.trim()
    : options.title;
  if (title) embed.setTitle(title);

  if (options.description) embed.setDescription(options.description);
  if (options.url) embed.setURL(options.url);

  const thumbnail = options.thumbnail ?? (options.useLogo ? brand.iconURL : undefined);
  if (thumbnail) embed.setThumbnail(thumbnail);

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

export const embeds = {
  success: (options: Omit<EmbedOptions, 'color' | 'icon'>) =>
    createEmbed({ ...options, color: colors.success, icon: 'success' }),

  error: (options: Omit<EmbedOptions, 'color' | 'icon'>) =>
    createEmbed({ ...options, color: colors.danger, icon: 'error' }),

  warning: (options: Omit<EmbedOptions, 'color' | 'icon'>) =>
    createEmbed({ ...options, color: colors.warning, icon: 'warning' }),

  info: (options: Omit<EmbedOptions, 'color' | 'icon'>) =>
    createEmbed({ ...options, color: colors.info, icon: 'info' }),

  brand: (options: EmbedOptions) =>
    createEmbed({ ...options, color: options.color ?? colors.primary }),

  /** Announcement-style: full-width banner is the visual focus (mint reminders, raid announcements, holder alerts). Omits useLogo — thumbnail and banner compete for the same corner, so this picks the banner. */
  banner: (options: EmbedOptions) =>
    createEmbed({ ...options, color: options.color ?? colors.primary, useLogo: false }),
};