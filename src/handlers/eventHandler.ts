/**
 * handlers/eventHandler.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Scans `events/` at startup and binds every file to the client via
 * `client.on` / `client.once`, same philosophy as the command handler:
 * drop a new file in `events/`, it gets wired up automatically.
 */

import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'discord.js';
import { BotEvent } from '../types';
import { logger } from '../utils/logger';

const EVENTS_DIR = join(__dirname, '..', 'events');

export async function loadEvents(client: Client): Promise<void> {
  const files = readdirSync(EVENTS_DIR).filter(
    (file) => file.endsWith('.ts') || file.endsWith('.js'),
  );

  let loaded = 0;

  for (const file of files) {
    try {
      const fullPath = join(EVENTS_DIR, file);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const eventModule = require(fullPath);
      const event: BotEvent = eventModule.default ?? eventModule;

      if (!event?.name || typeof event.execute !== 'function') {
        logger.warn(`Skipped invalid event file: ${file}`, 'EventHandler');
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }

      loaded++;
    } catch (error) {
      logger.error(error as Error, 'EventHandler');
    }
  }

  logger.success(`Loaded ${loaded} event(s)`, 'EventHandler');
}
