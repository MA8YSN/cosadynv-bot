/**
 * embeds/embedStudioDashboard.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Renders the Embed Studio workspace: a live checklist of the current
 * draft's status (embed) plus every control needed to edit it
 * (components). This is rebuilt from scratch and re-sent via
 * `interaction.update()` after EVERY action — channel pick, color pick,
 * field edit — so it behaves like a persistent workspace rather than a
 * chain of separate replies.
 *
 * Row layout (must stay within Discord's 5-row cap):
 *   1. Channel select menu (select menus always take a full row alone)
 *   2. Color preset buttons
 *   3. Field-editor buttons (Title / Description / Footer)
 *   4. Action buttons (Preview / Publish / Cancel)
 * One row of headroom remains for v2 fields (image, thumbnail, author).
 */

import { ActionRowBuilder, ButtonBuilder, MessageActionRowComponentBuilder } from 'discord.js';
import { embeds, buttons, row, selectMenus } from '../ui';
import {
  EmbedDraft,
  TEXT_FIELDS,
  STUDIO_COLORS,
  getValidationError,
} from '../services/embedStudioService';

/** One aligned row of the checklist code block, e.g. "📝 Title       ✅ Set". */
function checklistLine(icon: string, label: string, status: string): string {
  return `${icon} ${label.padEnd(11, ' ')}${status}`;
}

export function buildStudioSummaryEmbed(draft: EmbedDraft) {
  const activeColor = STUDIO_COLORS.find((c) => c.value === draft.color) ?? STUDIO_COLORS[0];
  const validationError = getValidationError(draft);

  // Channel needs an actual mention when set, so it stays OUTSIDE the code
  // block below — Discord doesn't render mentions inside code blocks.
  const channelLine = draft.channelId
    ? `📡 **Channel:** <#${draft.channelId}>`
    : '📡 **Channel:** ❌ Not Selected';

  const checklist = [
    checklistLine('📝', 'Title', draft.title ? '✅ Set' : '❌ Not Set'),
    checklistLine('📄', 'Description', draft.description ? '✅ Set' : '❌ Not Set'),
    checklistLine('🏷️', 'Footer', draft.footer ? '✅ Set' : '❌ Not Set'),
    checklistLine('🎨', 'Color', `${activeColor.emoji} ${activeColor.label}`),
  ].join('\n');

  const readiness = validationError ? `🟡 ${validationError}` : '🟢 Ready to Publish';

  return embeds.brand({
    title: 'Embed Studio',
    icon: 'megaphone',
    description: [
      'Build your embed below, then Preview and Publish when ready.',
      '',
      channelLine,
      '```',
      checklist,
      '```',
      readiness,
    ].join('\n'),
    color: draft.color,
  });
}

function channelRow(draft: EmbedDraft): ActionRowBuilder<MessageActionRowComponentBuilder> {
  const select = selectMenus.channel({
    customId: `embed_studio_channel:${draft.id}`,
    placeholder: 'Select a channel to publish to',
  });

  return row(select);
}

function colorRow(draft: EmbedDraft): ActionRowBuilder<MessageActionRowComponentBuilder> {
  const colorButtons: ButtonBuilder[] = STUDIO_COLORS.map((option) => {
    const isActive = draft.color === option.value;
    const factory = isActive ? buttons.success : buttons.secondary;
    return factory({
      customId: `embed_studio_color:${draft.id}:${option.key}`,
      label: `${option.emoji} ${option.label}`,
      disabled: isActive,
    });
  });

  return row(...colorButtons);
}

function fieldRow(draft: EmbedDraft): ActionRowBuilder<MessageActionRowComponentBuilder> {
  const fieldButtons: ButtonBuilder[] = TEXT_FIELDS.map((field) => {
    const filled = Boolean(draft[field.key]);
    return buttons.secondary({
      customId: `embed_studio_field:${draft.id}:${field.key}`,
      label: `${filled ? '✅' : '▫️'} ${field.label}`,
    });
  });

  return row(...fieldButtons);
}

function actionRow(draft: EmbedDraft): ActionRowBuilder<MessageActionRowComponentBuilder> {
  return row(
    buttons.secondary({
      customId: `embed_studio_action:${draft.id}:preview`,
      label: 'Preview',
      icon: 'chart',
    }),
    buttons.success({
      customId: `embed_studio_action:${draft.id}:publish`,
      label: 'Publish',
      icon: 'success',
    }),
    buttons.danger({
      customId: `embed_studio_action:${draft.id}:cancel`,
      label: 'Cancel',
      icon: 'error',
    }),
  );
}

/** Full message payload for the Studio dashboard — pass straight to reply/update/editReply. */
export function buildStudioPayload(draft: EmbedDraft) {
  return {
    embeds: [buildStudioSummaryEmbed(draft)],
    components: [channelRow(draft), colorRow(draft), fieldRow(draft), actionRow(draft)],
  };
}

/**
 * The screen shown right after a successful publish. Includes a "Publish
 * Another" button (handled by buttons/embedStudioRestart.ts) that starts a
 * fresh session in place, so publishing several embeds in a row never
 * requires re-running `/embed`.
 */
export function buildPublishSuccessPayload(channelId: string) {
  const publishedAtSeconds = Math.floor(Date.now() / 1000);

  const embed = embeds.success({
    title: 'Successfully Published!',
    description: [
      `**Channel**\n<#${channelId}>`,
      '',
      // Discord's native timestamp tag — renders in each viewer's own
      // local time/format automatically, no manual formatting needed.
      `**Published At**\n<t:${publishedAtSeconds}:t>`,
    ].join('\n'),
  });

  const publishAnotherRow = row(
    buttons.primary({
      customId: 'embed_studio_restart',
      label: 'Publish Another',
      icon: 'megaphone',
    }),
  );

  return { embeds: [embed], components: [publishAnotherRow] };
}