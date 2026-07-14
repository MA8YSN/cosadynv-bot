/**
 * handlers/selectMenuHandler.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Populates `client.selectMenus` from every file in `selectMenus/`. Thin
 * wrapper around utils/fileLoader.ts.
 */

import { join } from 'node:path';
import { Client } from 'discord.js';
import { SelectMenuHandler } from '../types';
import { loadRegistry } from '../utils/fileLoader';
import { logger } from '../utils/logger';

const SELECT_MENUS_DIR = join(__dirname, '..', 'selectMenus');

function isSelectMenuHandler(mod: unknown): mod is SelectMenuHandler {
  const candidate = mod as Partial<SelectMenuHandler> | undefined;
  return Boolean(candidate?.customId && typeof candidate.execute === 'function');
}

export async function loadSelectMenus(client: Client): Promise<void> {
  const loaded = loadRegistry<SelectMenuHandler>({
    dir: SELECT_MENUS_DIR,
    label: 'SelectMenuHandler',
    isValid: isSelectMenuHandler,
    getKey: (selectMenu) => selectMenu.customId,
    registry: client.selectMenus,
  });

  logger.success(`Loaded ${loaded} select menu(s)`, 'SelectMenuHandler');
}