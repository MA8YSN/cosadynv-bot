/**
 * ui/buttons.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Button + action row factory. Same philosophy as ui/embed.ts: every
 * button in the bot should be created through these helpers instead of
 * `new ButtonBuilder()` inline (also enforced by eslint.config.js), so
 * button styling stays consistent as self-roles, verification, giveaways,
 * etc. get built on top of this.
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
} from 'discord.js';
import { icons, IconKey } from './theme';

interface ButtonOptions {
  customId: string;
  label: string;
  icon?: IconKey;
  disabled?: boolean;
}

interface LinkButtonOptions {
  url: string;
  label: string;
  icon?: IconKey;
}

function withIcon(label: string, icon?: IconKey): string {
  return icon ? `${icons[icon]} ${label}` : label;
}

/**
 * One factory function per Discord button style. Using named styles
 * (`buttons.success`, `buttons.danger`) instead of a raw `.setStyle(...)`
 * call means a feature file never has to think about which `ButtonStyle`
 * enum value means what — the semantics live here, once.
 */
export const buttons = {
  primary: (options: ButtonOptions) =>
    new ButtonBuilder()
      .setCustomId(options.customId)
      .setLabel(withIcon(options.label, options.icon))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(options.disabled ?? false),

  secondary: (options: ButtonOptions) =>
    new ButtonBuilder()
      .setCustomId(options.customId)
      .setLabel(withIcon(options.label, options.icon))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(options.disabled ?? false),

  success: (options: ButtonOptions) =>
    new ButtonBuilder()
      .setCustomId(options.customId)
      .setLabel(withIcon(options.label, options.icon))
      .setStyle(ButtonStyle.Success)
      .setDisabled(options.disabled ?? false),

  danger: (options: ButtonOptions) =>
    new ButtonBuilder()
      .setCustomId(options.customId)
      .setLabel(withIcon(options.label, options.icon))
      .setStyle(ButtonStyle.Danger)
      .setDisabled(options.disabled ?? false),

  /** Link buttons open a URL and carry no customId/interaction at all. */
  link: (options: LinkButtonOptions) =>
    new ButtonBuilder()
      .setURL(options.url)
      .setLabel(withIcon(options.label, options.icon))
      .setStyle(ButtonStyle.Link),
};

/**
 * Wraps up to 5 components into a Discord action row. Centralizing this
 * (rather than every command importing ActionRowBuilder itself) means
 * commands only ever import from `ui/`, never touch discord.js's raw
 * builders directly.
 */
export function row(
  ...components: MessageActionRowComponentBuilder[]
): ActionRowBuilder<MessageActionRowComponentBuilder> {
  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(...components);
}
