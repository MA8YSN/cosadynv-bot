/**
 * events/ready.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Fires once, when the client successfully logs in and Discord's gateway
 * confirms the connection. This is the definitive "the bot is online and
 * working" signal — good place for a startup log and, later, any one-time
 * initialization (e.g. warming caches, starting scheduled jobs).
 */

import { Client, Events } from 'discord.js';
import { BotEvent } from '../types';
import { logger } from '../utils/logger';

const event: BotEvent<Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client<true>) {
    logger.success(`Logged in as ${client.user.tag}`, 'Ready');
    logger.info(`Serving ${client.guilds.cache.size} guild(s)`, 'Ready');
    logger.info(`${client.commands.size} command(s) active`, 'Ready');
  },
};

export default event;
