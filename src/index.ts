/**
 * index.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Bot entry point. Responsible ONLY for orchestration:
 *   1. Validate environment (import side-effect of config/env.ts)
 *   2. Build the client
 *   3. Load commands, buttons, modals, select menus, and events from disk
 *   4. Log in to Discord
 *
 * No business logic belongs here — that's what commands/services/events
 * are for. This file should stay short and readable forever, even as the
 * bot grows to 50+ features.
 */

import { env } from './config/env';
import { createClient } from './client';
import { loadCommands } from './handlers/commandHandler';
import { loadButtons } from './handlers/buttonHandler';
import { loadModals } from './handlers/modalHandler';
import { loadSelectMenus } from './handlers/selectMenuHandler';
import { loadEvents } from './handlers/eventHandler';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  const client = createClient();

  await loadCommands(client);
  await loadButtons(client);
  await loadModals(client);
  await loadSelectMenus(client);
  await loadEvents(client);

  await client.login(env.DISCORD_TOKEN);
}

main().catch((error) => {
  logger.error(error as Error, 'Bootstrap');
  process.exit(1);
});

// Guard rails: an uncaught error or rejected promise anywhere in the bot
// should be logged, not silently crash the process with no trace.
process.on('unhandledRejection', (error) => {
  logger.error(error as Error, 'UnhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error(error, 'UncaughtException');
});