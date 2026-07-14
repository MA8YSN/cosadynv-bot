/**
 * ui/modal.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Modal (pop-up form) factory — same philosophy as ui/embed.ts,
 * ui/buttons.ts, and ui/selectMenu.ts. Implemented on-demand: Embed
 * Studio's field editors (Title/Description/Footer) are the first feature
 * that needs one.
 *
 * (Enforced by eslint.config.js: instantiating ModalBuilder directly
 * outside `src/ui/**` is a lint error, same as EmbedBuilder/ButtonBuilder.)
 */

import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

interface ModalFieldOptions {
  customId: string;
  label: string;
  style?: TextInputStyle;
  placeholder?: string;
  value?: string;
  required?: boolean;
  maxLength?: number;
}

interface ModalOptions {
  customId: string;
  title: string;
  fields: ModalFieldOptions[];
}

/** Builds a modal with up to 5 single-line/paragraph text inputs. */
export function createModal(options: ModalOptions): ModalBuilder {
  const modal = new ModalBuilder().setCustomId(options.customId).setTitle(options.title);

  const rows = options.fields.map((field) => {
    const input = new TextInputBuilder()
      .setCustomId(field.customId)
      .setLabel(field.label)
      .setStyle(field.style ?? TextInputStyle.Short)
      .setRequired(field.required ?? false);

    if (field.placeholder) input.setPlaceholder(field.placeholder);
    if (field.value) input.setValue(field.value);
    if (field.maxLength) input.setMaxLength(field.maxLength);

    return new ActionRowBuilder<TextInputBuilder>().addComponents(input);
  });

  return modal.addComponents(...rows);
}