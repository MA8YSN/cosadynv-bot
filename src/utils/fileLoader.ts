/**
 * utils/fileLoader.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Generic module loader shared by every handler in `handlers/`
 * (commands, buttons, modals, select menus). Each handler used to
 * duplicate the same "recursively scan a folder, require() each file,
 * validate its shape, register it" logic — this is the single copy.
 *
 * A handler's own file becomes just: call loadRegistry() with a
 * validator and a place to put the result. Nothing about WHAT gets
 * loaded (commands vs buttons vs...) lives here — only HOW.
 */

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Collection } from 'discord.js';
import { logger } from './logger';

/** Recursively collects every .ts/.js file path under a directory. */
export function collectFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (entry.endsWith('.ts') || entry.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

export interface LoadRegistryOptions<T> {
  /** Absolute path to the folder to scan (e.g. join(__dirname, '..', 'buttons')). */
  dir: string;
  /** A short label used in log lines, e.g. "ButtonHandler". */
  label: string;
  /** Confirms a required module has the right shape before registering it. */
  isValid: (mod: unknown) => mod is T;
  /** The key this module should be registered under (customId, command name, etc). */
  getKey: (mod: T) => string;
  /** Where to store each valid module, keyed by getKey(mod). */
  registry: Collection<string, T>;
}

/**
 * Scans `dir`, requires every file, validates + registers each one into
 * `registry`. Returns the number successfully loaded. Used by every
 * loader in handlers/ — see commandHandler.ts / buttonHandler.ts / etc.
 * for the thin per-type wrappers around this.
 */
export function loadRegistry<T>(options: LoadRegistryOptions<T>): number {
  const { dir, label, isValid, getKey, registry } = options;
  const files = collectFiles(dir);
  let loaded = 0;

  for (const file of files) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const required = require(file);
      const candidate = required.default ?? required;

      if (!isValid(candidate)) {
        logger.warn(`Skipped invalid ${label} file: ${file}`, label);
        continue;
      }

      registry.set(getKey(candidate), candidate);
      loaded++;
    } catch (error) {
      logger.error(error as Error, label);
    }
  }

  return loaded;
}