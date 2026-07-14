/**
 * embeds/draftEmbedRenderer.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Renders the ACTUAL embed an admin is building in Embed Studio — used for
 * both the Preview step and the final Publish. This intentionally calls
 * `createEmbed()` directly rather than the `embeds.success/error/...`
 * presets from `ui/`: those presets force the bot's own icon/branding onto
 * the embed, which would fight the admin's own content. The admin's embed
 * should look like whatever THEY typed, not like a bot status message.
 *
 * This is the one deliberate exception to "always use the semantic
 * presets" — createEmbed() itself is still the design system's base
 * factory, so ui/ remains the only place EmbedBuilder is touched.
 */

import { EmbedBuilder } from 'discord.js';
import { createEmbed } from '../ui';
import { EmbedDraft } from '../services/embedStudioService';

export function renderDraftEmbed(draft: EmbedDraft): EmbedBuilder {
  return createEmbed({
    title: draft.title,
    description: draft.description || undefined,
    color: draft.color,
    footerText: draft.footer ?? null,
    timestamp: false,
  });
}