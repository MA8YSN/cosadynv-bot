/**
 * utils/resolveTargetChannel.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Shared "channel option, falling back to the current channel" resolution
 * used by any admin command that posts something to a channel (/deploy,
 * /self-roles, and future ones). Returns null if neither the option nor
 * the current channel is a valid text channel — the caller is
 * responsible for replying with its own error message, since wording
 * differs slightly per command today.
 */

import { ChatInputCommandInteraction, TextChannel } from 'discord.js';

export function resolveTargetChannel(
  interaction: ChatInputCommandInteraction,
): TextChannel | null {
  const targetChannel =
    (interaction.options.getChannel('channel') as TextChannel | null) ??
    (interaction.channel as TextChannel);

  if (!targetChannel || !targetChannel.isTextBased()) return null;

  return targetChannel;
}