/**
 * client.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Constructs the Discord.js client with the intents/partials from
 * `bot.config.ts` and attaches the four registries (`commands`, `buttons`,
 * `modals`, `selectMenus`) that the handlers populate at startup.
 *
 * Kept separate from `index.ts` so the client can be imported elsewhere
 * (e.g. a future dashboard process, or a test file) without re-running the
 * bot's full startup sequence.
 */

import { Client, Collection } from 'discord.js';
import { botConfig } from './config/bot.config';
import { Command, Button, ModalHandler, SelectMenuHandler } from './types';

export function createClient(): Client {
  const client = new Client({
    intents: botConfig.intents,
    partials: botConfig.partials,
  });

  // These start empty and are filled by the handlers in handlers/ during
  // startup (see index.ts).
  client.commands = new Collection<string, Command>();
  client.buttons = new Collection<string, Button>();
  client.modals = new Collection<string, ModalHandler>();
  client.selectMenus = new Collection<string, SelectMenuHandler>();

  return client;
}