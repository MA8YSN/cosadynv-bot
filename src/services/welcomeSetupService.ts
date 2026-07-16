/**
 * services/welcomeSetupService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The /welcome setup wizard's in-memory draft session — built on
 * utils/sessionStore.ts, the same generic store Embed Studio uses. Only
 * "Save" (buttons/welcomeSetupAction.ts) commits a draft to Supabase via
 * welcomeConfig.repository.ts; everything before that lives here,
 * transiently, exactly like an Embed Studio draft.
 *
 * This is the first feature combining both established patterns at
 * once: an Embed-Studio-style in-memory wizard session for the editing
 * UI, whose final output is persisted the way Self Roles/Verification's
 * config already is — just in Supabase instead of a static file, since
 * this data is admin-edited at runtime.
 *
 * getSavedWelcomeConfig / saveDraftAsConfig are the only path
 * commands/buttons should use to reach welcomeConfig.repository.ts —
 * never the repository directly, same layering rule as Giveaways.
 */

import {
  AnySelectMenuInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import { createSessionStore } from '../utils/sessionStore';
import {
  getWelcomeConfig,
  upsertWelcomeConfig,
  WelcomeConfigRow,
} from '../database/welcomeConfig.repository';
import { WELCOME_CONFIG } from '../config/welcome.config';

export interface WelcomeSetupDraft {
  id: string;
  guildId: string;
  createdBy: string;
  channelId: string | null;
  theme: string;
  messageTemplate: string;
  dmEnabled: boolean;
}

const store = createSessionStore<WelcomeSetupDraft>(WELCOME_CONFIG.sessionTtlMs);

/** Prefills from an existing saved config, if any, so re-running setup doesn't reset everything. */
export function createDraft(
  guildId: string,
  userId: string,
  existing: WelcomeConfigRow | null,
): WelcomeSetupDraft {
  return store.create({
    guildId,
    createdBy: userId,
    channelId: existing?.channel_id ?? null,
    theme: existing?.theme ?? WELCOME_CONFIG.defaultTheme,
    messageTemplate: existing?.message_template ?? WELCOME_CONFIG.defaultMessageTemplate,
    dmEnabled: existing?.dm_enabled ?? false,
  });
}

export function getDraft(id: string): WelcomeSetupDraft | undefined {
  return store.get(id);
}

export function updateDraft(
  id: string,
  patch: Partial<Omit<WelcomeSetupDraft, 'id' | 'guildId' | 'createdBy'>>,
): WelcomeSetupDraft | undefined {
  return store.update(id, patch);
}

export function deleteDraft(id: string): void {
  store.delete(id);
}

/** The only path commands/buttons should use to read saved config — never the repository directly. */
export function getSavedWelcomeConfig(guildId: string): Promise<WelcomeConfigRow | null> {
  return getWelcomeConfig(guildId);
}

/** Commits a draft to Supabase as the guild's saved config. Throws if no channel was selected. */
export function saveDraftAsConfig(
  draft: WelcomeSetupDraft,
  updatedBy: string,
): Promise<WelcomeConfigRow> {
  if (!draft.channelId) {
    throw new Error('Cannot save a Welcome Setup draft without a channel selected.');
  }

  return upsertWelcomeConfig(draft.guildId, {
    channelId: draft.channelId,
    theme: draft.theme,
    messageTemplate: draft.messageTemplate,
    dmEnabled: draft.dmEnabled,
    updatedBy,
  });
}

type SetupInteraction = ButtonInteraction | ModalSubmitInteraction | AnySelectMenuInteraction;

/** Same "look up or reply expired" pattern as Embed Studio's getSessionOrReply. */
export async function getDraftOrReply(
  interaction: SetupInteraction,
  sessionId: string,
): Promise<WelcomeSetupDraft | null> {
  const draft = getDraft(sessionId);
  if (draft) return draft;

  await interaction.reply({
    content: '❌ This Welcome Setup session has expired. Run `/welcome setup` again.',
    ephemeral: true,
  });
  return null;
}