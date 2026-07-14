/**
 * handlers/buttonHandler.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Populates `client.buttons` from every file in `buttons/`. Thin wrapper
 * around utils/fileLoader.ts.
 */

import { join } from 'node:path';
import { Client } from 'discord.js';
import { Button } from '../types';
import { loadRegistry } from '../utils/fileLoader';
import { logger } from '../utils/logger';

const BUTTONS_DIR = join(__dirname, '..', 'buttons');

function isButton(mod: unknown): mod is Button {
  const candidate = mod as Partial<Button> | undefined;
  return Boolean(candidate?.customId && typeof candidate.execute === 'function');
}

export async function loadButtons(client: Client): Promise<void> {
  const loaded = loadRegistry<Button>({
    dir: BUTTONS_DIR,
    label: 'ButtonHandler',
    isValid: isButton,
    getKey: (button) => button.customId,
    registry: client.buttons,
  });

  logger.success(`Loaded ${loaded} button(s)`, 'ButtonHandler');
}