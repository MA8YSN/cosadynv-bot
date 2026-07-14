/**
 * handlers/commandHandler.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Populates `client.commands` from every file in `commands/`, and exposes
 * the raw command JSON payloads for deploy-commands.ts. Thin wrapper
 * around utils/fileLoader.ts — see that file for the actual scanning logic.
 */

import { join } from 'node:path';
import { Client } from 'discord.js';
import { Command } from '../types';
import { collectFiles, loadRegistry } from '../utils/fileLoader';
import { logger } from '../utils/logger';

const COMMANDS_DIR = join(__dirname, '..', 'commands');

function isCommand(mod: unknown): mod is Command {
  const candidate = mod as Partial<Command> | undefined;
  return Boolean(candidate?.data?.name && typeof candidate.execute === 'function');
}

/** Populates `client.commands` at bot startup. */
export async function loadCommands(client: Client): Promise<void> {
  const loaded = loadRegistry<Command>({
    dir: COMMANDS_DIR,
    label: 'CommandHandler',
    isValid: isCommand,
    getKey: (command) => command.data.name,
    registry: client.commands,
  });

  logger.success(`Loaded ${loaded} command(s)`, 'CommandHandler');
}

/** Returns the raw JSON payloads used to register commands with Discord's API (deploy-commands.ts). */
export function collectCommandData() {
  const files = collectFiles(COMMANDS_DIR);
  const commands: Command[] = [];

  for (const file of files) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const required = require(file);
    const candidate = required.default ?? required;
    if (isCommand(candidate)) commands.push(candidate);
  }

  return commands.map((command) => command.data.toJSON());
}