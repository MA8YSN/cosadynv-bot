/**
 * ui/index.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Barrel export for the bot's design system. Every feature imports from
 * here, and here only:
 *
 *   import { embeds, createEmbed, buttons, row, colors, icons } from '../ui';
 *
 * This module (and only this module's files) is allowed to instantiate
 * discord.js builders directly — enforced by eslint.config.js. Everywhere
 * else in the bot, embeds/buttons/(future) select menus and modals must
 * be built through what's exported here, so the whole bot automatically
 * shares one visual language as new features are added.
 */

export * from './theme';
export * from './embed';
export * from './buttons';

// Reserved — exported now so feature code can `import { ... } from '../ui'`
// without needing to know these live in separate files, once implemented.
export * from './selectMenu';
export * from './modal';
