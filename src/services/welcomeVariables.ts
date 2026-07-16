/**
 * services/welcomeVariables.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Resolves {variables} in welcome message templates and theme text
 * elements against a real GuildMember.
 *
 * Deliberately produces plain, human-readable strings only — no Discord
 * markup like <t:...:D> timestamp tags. This same resolved data is used
 * both in the text message content (where markup would be fine) AND
 * drawn directly onto the canvas card image (where markup would render
 * as broken literal text, since canvas has no concept of Discord
 * formatting). One data shape, safe in both contexts, was chosen over
 * two separate resolvers for a small readability gain.
 */

import { GuildMember } from 'discord.js';

export interface ResolvedWelcomeData {
  /** Real @mention — use in message content. Never use in image text elements (see {username} instead). */
  mention: string;
  username: string;
  serverName: string;
  memberCountFormatted: string;
  createdAtFormatted: string;
  joinedAtFormatted: string;
  avatarURL: string;
  serverIconURL: string | null;
  serverBannerURL: string | null;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function buildResolvedWelcomeData(member: GuildMember): ResolvedWelcomeData {
  const guild = member.guild;

  return {
    mention: `<@${member.id}>`,
    username: member.user.username,
    serverName: guild.name,
    memberCountFormatted: guild.memberCount.toLocaleString('en-US'),
    createdAtFormatted: formatDate(new Date(member.user.createdTimestamp)),
    joinedAtFormatted: formatDate(new Date(member.joinedTimestamp ?? Date.now())),
    avatarURL: member.user.displayAvatarURL({ size: 256, extension: 'png' }),
    serverIconURL: guild.iconURL({ size: 256, extension: 'png' }),
    serverBannerURL: guild.bannerURL({ size: 1024, extension: 'png' }),
  };
}

/**
 * Replaces every supported {variable} in a template string. Used for both
 * the text message content and theme text elements — see the note above
 * on why {user} (a real mention) should only ever be used in message
 * content, never inside a theme's textElements.
 */
export function resolveWelcomeVariables(template: string, data: ResolvedWelcomeData): string {
  return template
    .replaceAll('{user}', data.mention)
    .replaceAll('{username}', data.username)
    .replaceAll('{server}', data.serverName)
    .replaceAll('{member_count}', data.memberCountFormatted)
    .replaceAll('{created_at}', data.createdAtFormatted)
    .replaceAll('{joined_at}', data.joinedAtFormatted);
}