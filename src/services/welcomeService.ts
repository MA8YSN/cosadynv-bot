/**
 * services/welcomeService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Builds and sends the actual welcome message. buildWelcomeMessage() is
 * shared by three callers that all need "what would this member's
 * welcome look like": the real guildMemberAdd event, /welcome test, and
 * the setup wizard's Preview button — one implementation, not three.
 *
 * sendWelcome() is the real-delivery path: posts to the configured
 * channel, and DMs the member too if enabled. DM failures are expected
 * and common (many users block DMs from server members) — logged at
 * debug level, never treated as a real error, never blocks anything else.
 */

import { AttachmentBuilder, Client, GuildMember, TextChannel } from 'discord.js';
import { getWelcomeConfig, WelcomeConfigRow } from '../database/welcomeConfig.repository';
import { buildResolvedWelcomeData, resolveWelcomeVariables } from './welcomeVariables';
import { renderWelcomeCard } from './welcomeImageService';
import { getThemeByKey, WELCOME_THEMES } from '../config/welcomeThemes.config';
import { logger } from '../utils/logger';

export interface WelcomeMessagePayload {
  content: string;
  files: AttachmentBuilder[];
}

export async function buildWelcomeMessage(
  member: GuildMember,
  config: Pick<WelcomeConfigRow, 'theme' | 'message_template'>,
): Promise<WelcomeMessagePayload> {
  const data = buildResolvedWelcomeData(member);
  const content = resolveWelcomeVariables(config.message_template, data);

  const theme = getThemeByKey(config.theme) ?? WELCOME_THEMES[0];
  const imageBuffer = await renderWelcomeCard(theme, data);
  const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome.png' });

  return { content, files: [attachment] };
}

export async function sendWelcome(client: Client, member: GuildMember): Promise<void> {
  const config = await getWelcomeConfig(member.guild.id);
  if (!config) return; // Not configured yet for this guild — nothing to do.

  const payload = await buildWelcomeMessage(member, config);

  try {
    const channel = await client.channels.fetch(config.channel_id);
    if (channel instanceof TextChannel) {
      await channel.send(payload);
    }
  } catch (error) {
    logger.error(error as Error, 'WelcomeService');
  }

  if (config.dm_enabled) {
    try {
      await member.send(payload);
    } catch {
      logger.debug(
        `Could not DM welcome to ${member.user.tag} (DMs likely closed)`,
        'WelcomeService',
      );
    }
  }
}