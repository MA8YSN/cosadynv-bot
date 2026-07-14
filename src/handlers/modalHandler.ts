/**
 * handlers/modalHandler.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Populates `client.modals` from every file in `modals/`. Thin wrapper
 * around utils/fileLoader.ts.
 */

import { join } from 'node:path';
import { Client } from 'discord.js';
import { ModalHandler } from '../types';
import { loadRegistry } from '../utils/fileLoader';
import { logger } from '../utils/logger';

const MODALS_DIR = join(__dirname, '..', 'modals');

function isModalHandler(mod: unknown): mod is ModalHandler {
  const candidate = mod as Partial<ModalHandler> | undefined;
  return Boolean(candidate?.customId && typeof candidate.execute === 'function');
}

export async function loadModals(client: Client): Promise<void> {
  const loaded = loadRegistry<ModalHandler>({
    dir: MODALS_DIR,
    label: 'ModalHandler',
    isValid: isModalHandler,
    getKey: (modal) => modal.customId,
    registry: client.modals,
  });

  logger.success(`Loaded ${loaded} modal(s)`, 'ModalHandler');
}