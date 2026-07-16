/**
 * events/guildMemberAdd.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Fires when a member joins the server. Only responsible for saying "a
 * member joined" — all actual logic (loading config, resolving
 * variables, rendering the card, sending) lives in welcomeService.ts.
 *
 * This event didn't exist until now — it was removed during the
 * Verification redesign when the Unverified-role approach was dropped in
 * favor of a purely interaction-driven flow. The Welcome System is what
 * legitimately brings it back.
 *
 * Requires GatewayIntentBits.GuildMembers (see config/bot.config.ts) —
 * this event will not fire at all without it, and that intent must also
 * be manually enabled in the Discord Developer Portal (Bot tab -> Server
 * Members Intent).
 */

import { Events, GuildMember } from 'discord.js';
import { BotEvent } from '../types';
import { sendWelcome } from '../services/welcomeService';
import { logger } from '../utils/logger';

const event: BotEvent<Events.GuildMemberAdd> = {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember) {
    try {
      await sendWelcome(member.client, member);
    } catch (error) {
      logger.error(error as Error, 'GuildMemberAdd');
    }
  },
};

export default event;