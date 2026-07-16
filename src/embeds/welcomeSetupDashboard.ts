/**
 * embeds/welcomeSetupDashboard.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The /welcome setup workspace — checklist summary + every control,
 * re-rendered via interaction.update() after every action. Same shape as
 * embedStudioDashboard.ts: one summary embed, rows of buttons/select
 * menus below it.
 *
 * Row layout (4 of Discord's 5-row cap, 1 spare for future fields):
 *   1. Channel select menu
 *   2. Theme buttons (Classic / Space)
 *   3. Message field button + DM toggle button
 *   4. Preview / Save / Cancel
 */

import { ActionRowBuilder, MessageActionRowComponentBuilder } from 'discord.js';
import { embeds, buttons, row, selectMenus } from '../ui';
import { WelcomeSetupDraft } from '../services/welcomeSetupService';
import { WELCOME_THEMES } from '../config/welcomeThemes.config';

function checklistLine(icon: string, label: string, status: string): string {
  return `${icon} ${label.padEnd(11, ' ')}${status}`;
}

export function buildWelcomeSetupSummaryEmbed(draft: WelcomeSetupDraft) {
  const theme = WELCOME_THEMES.find((t) => t.key === draft.theme);

  const channelLine = draft.channelId
    ? `📍 **Channel:** <#${draft.channelId}>`
    : '📍 **Channel:** ❌ Not Selected';

  const checklist = [
    checklistLine('🎨', 'Theme', theme ? theme.label : 'Unknown'),
    checklistLine('💬', 'Message', draft.messageTemplate ? '✅ Set' : '❌ Not Set'),
    checklistLine('👋', 'DM Welcome', draft.dmEnabled ? '✅ Enabled' : '➖ Disabled'),
  ].join('\n');

  const readiness = draft.channelId ? '🟢 Ready to Save' : '🟡 Select a channel before saving.';

  return embeds.brand({
    title: 'Welcome Setup',
    icon: 'megaphone',
    description: [
      'Configure the welcome experience below, then Preview and Save when ready.',
      '',
      channelLine,
      '```',
      checklist,
      '```',
      readiness,
    ].join('\n'),
  });
}

function channelRow(draft: WelcomeSetupDraft): ActionRowBuilder<MessageActionRowComponentBuilder> {
  const select = selectMenus.channel({
    customId: `welcome_setup_channel:${draft.id}`,
    placeholder: 'Select the welcome channel',
  });
  return row(select);
}

function themeRow(draft: WelcomeSetupDraft): ActionRowBuilder<MessageActionRowComponentBuilder> {
  const themeButtons = WELCOME_THEMES.map((theme) => {
    const isActive = draft.theme === theme.key;
    const factory = isActive ? buttons.success : buttons.secondary;
    return factory({
      customId: `welcome_setup_theme:${draft.id}:${theme.key}`,
      label: theme.label,
      disabled: isActive,
    });
  });
  return row(...themeButtons);
}

function fieldRow(draft: WelcomeSetupDraft): ActionRowBuilder<MessageActionRowComponentBuilder> {
  return row(
    buttons.secondary({
      customId: `welcome_setup_field:${draft.id}`,
      label: draft.messageTemplate ? '✅ Edit Message' : '▫️ Set Message',
    }),
    buttons.secondary({
      customId: `welcome_setup_action:${draft.id}:toggle_dm`,
      label: `👋 DM Welcome: ${draft.dmEnabled ? 'On' : 'Off'}`,
    }),
  );
}

function actionRow(draft: WelcomeSetupDraft): ActionRowBuilder<MessageActionRowComponentBuilder> {
  return row(
    buttons.secondary({
      customId: `welcome_setup_action:${draft.id}:preview`,
      label: 'Preview',
      icon: 'chart',
    }),
    buttons.success({
      customId: `welcome_setup_action:${draft.id}:save`,
      label: 'Save',
      icon: 'success',
    }),
    buttons.danger({
      customId: `welcome_setup_action:${draft.id}:cancel`,
      label: 'Cancel',
      icon: 'error',
    }),
  );
}

export function buildWelcomeSetupPayload(draft: WelcomeSetupDraft) {
  return {
    embeds: [buildWelcomeSetupSummaryEmbed(draft)],
    components: [channelRow(draft), themeRow(draft), fieldRow(draft), actionRow(draft)],
  };
}