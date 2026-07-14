/**
 * services/embedStudioService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Business logic + state for the Embed Studio feature (/embed).
 *
 * Session storage now delegates to utils/sessionStore.ts — a generic,
 * reusable TTL-based store extracted from what used to live directly in
 * this file. This file just configures it (TTL, the EmbedDraft shape)
 * and re-exports create/get/update/delete under their original names, so
 * nothing else in the codebase needed to change because of that part.
 *
 * TEXT_FIELDS and STUDIO_COLORS are config, not code — this is what keeps
 * the dashboard/handlers generic. Adding a v2 field (e.g. an image URL)
 * means adding one entry to TEXT_FIELDS, not writing a new button/modal
 * pair from scratch.
 */

import {
  AnySelectMenuInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  TextInputStyle,
} from 'discord.js';
import { colors } from '../ui';
import { createSessionStore } from '../utils/sessionStore';

export interface EmbedDraft {
  id: string;
  createdBy: string;
  channelId: string | null;
  title?: string;
  description?: string;
  footer?: string;
  color: number;
  createdAt: number;
}

export interface TextFieldConfig {
  key: 'title' | 'description' | 'footer';
  label: string;
  style: TextInputStyle;
  maxLength: number;
  required: boolean;
}

/**
 * Every modal-editable text field in the Studio. Order here is the order
 * buttons appear in the dashboard.
 */
export const TEXT_FIELDS: TextFieldConfig[] = [
  { key: 'title', label: 'Title', style: TextInputStyle.Short, maxLength: 256, required: false },
  {
    key: 'description',
    label: 'Description',
    style: TextInputStyle.Paragraph,
    maxLength: 4000,
    required: false,
  },
  {
    key: 'footer',
    label: 'Footer',
    style: TextInputStyle.Short,
    maxLength: 2048,
    required: false,
  },
];

export interface StudioColorOption {
  key: string;
  label: string;
  emoji: string;
  value: number;
}

/**
 * The predefined v1 color palette (no free-form hex input yet, by design).
 * One button per entry, so keep this at 5 or fewer to fit a single row.
 */
export const STUDIO_COLORS: StudioColorOption[] = [
  { key: 'purple', label: 'Purple', emoji: '🟣', value: colors.primary },
  { key: 'blue', label: 'Blue', emoji: '🔵', value: colors.info },
  { key: 'green', label: 'Green', emoji: '🟢', value: colors.success },
  { key: 'red', label: 'Red', emoji: '🔴', value: colors.danger },
  { key: 'gold', label: 'Gold', emoji: '🟡', value: colors.warning },
];

const DEFAULT_COLOR = STUDIO_COLORS[0].value;

/** Sessions auto-expire after this long, matching Discord's own interaction token lifetime. */
const SESSION_TTL_MS = 15 * 60 * 1000;

const store = createSessionStore<EmbedDraft>(SESSION_TTL_MS);

export function createSession(userId: string): EmbedDraft {
  return store.create({
    createdBy: userId,
    channelId: null,
    color: DEFAULT_COLOR,
    createdAt: Date.now(),
  });
}

export function getSession(id: string): EmbedDraft | undefined {
  return store.get(id);
}

export function updateSession(
  id: string,
  patch: Partial<Omit<EmbedDraft, 'id' | 'createdBy' | 'createdAt'>>,
): EmbedDraft | undefined {
  return store.update(id, patch);
}

export function deleteSession(id: string): void {
  store.delete(id);
}

/** A draft is publishable once it has a channel and at least a title or description. */
export function getValidationError(draft: EmbedDraft): string | null {
  if (!draft.channelId) return 'Please select a channel before publishing.';
  if (!draft.title && !draft.description) {
    return 'Add at least a title or description before publishing.';
  }
  return null;
}

type StudioInteraction = ButtonInteraction | ModalSubmitInteraction | AnySelectMenuInteraction;

/**
 * Looks up a session and replies with a standard "expired" message if
 * it's missing — collapses the guard clause that used to be copy-pasted
 * across every Embed Studio button/modal/select-menu handler. Returns
 * the draft on success, or null after already replying.
 */
export async function getSessionOrReply(
  interaction: StudioInteraction,
  sessionId: string,
): Promise<EmbedDraft | null> {
  const draft = getSession(sessionId);
  if (draft) return draft;

  await interaction.reply({
    content: '❌ This Embed Studio session has expired. Run `/embed` again.',
    ephemeral: true,
  });
  return null;
}