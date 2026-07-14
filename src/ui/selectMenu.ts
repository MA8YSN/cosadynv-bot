/**
 * ui/selectMenu.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Select menu factory — same philosophy as ui/embed.ts and ui/buttons.ts.
 * Implemented on-demand: Embed Studio needed `selectMenus.channel` first;
 * Self Roles is the first feature that needs `selectMenus.string` (a
 * multi-select with custom labels/emojis/descriptions). Role/user select
 * factories can be added the same way the moment a feature needs one.
 *
 * (Enforced by eslint.config.js: instantiating select menu builders
 * directly outside `src/ui/**` is a lint error, same as EmbedBuilder/ButtonBuilder.)
 */

import {
  ChannelSelectMenuBuilder,
  ChannelType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

interface ChannelSelectOptions {
  customId: string;
  placeholder?: string;
  channelTypes?: ChannelType[];
  minValues?: number;
  maxValues?: number;
}

interface StringSelectOptionConfig {
  label: string;
  value: string;
  description?: string;
  emoji?: string;
}

interface StringSelectOptions {
  customId: string;
  placeholder?: string;
  options: StringSelectOptionConfig[];
  minValues?: number;
  maxValues?: number;
}

export const selectMenus = {
  channel: (options: ChannelSelectOptions) =>
    new ChannelSelectMenuBuilder()
      .setCustomId(options.customId)
      .setPlaceholder(options.placeholder ?? 'Select a channel')
      .addChannelTypes(...(options.channelTypes ?? [ChannelType.GuildText]))
      .setMinValues(options.minValues ?? 1)
      .setMaxValues(options.maxValues ?? 1),

  string: (options: StringSelectOptions) =>
    new StringSelectMenuBuilder()
      .setCustomId(options.customId)
      .setPlaceholder(options.placeholder ?? 'Select an option')
      .setMinValues(options.minValues ?? 1)
      .setMaxValues(options.maxValues ?? options.options.length)
      .addOptions(
        options.options.map((opt) => {
          const built = new StringSelectMenuOptionBuilder()
            .setLabel(opt.label)
            .setValue(opt.value);

          if (opt.description) built.setDescription(opt.description);
          if (opt.emoji) built.setEmoji(opt.emoji);

          return built;
        }),
      ),
};