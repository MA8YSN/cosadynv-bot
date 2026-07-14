/**
 * types/index.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Central type definitions shared across the whole bot.
 *
 * Every module (commands, buttons, modals, events) implements one of the
 * interfaces below. This is what makes the architecture "modular": the
 * handlers in `handlers/` don't know or care what a command *does* — they
 * only care that it satisfies the `Command` shape. That means adding a new
 * feature later is just "drop a new file in the folder", nothing else.
 */

import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  AnySelectMenuInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
  Client,
  Collection,
  ClientEvents,
} from 'discord.js';

/**
 * A slash command module.
 * `data` is the command's structure/schema (name, description, options).
 * `execute` is what runs when a user invokes it.
 *
 * The union type on `data` covers the different builder return types
 * discord.js produces depending on whether you add subcommands/options.
 */
export interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * A button interaction handler.
 * `customId` must match (or prefix-match, see handler) the button's customId.
 */
export interface Button {
  customId: string;
  execute: (interaction: ButtonInteraction) => Promise<void>;
}

/**
 * A modal (pop-up form) submission handler.
 */
export interface ModalHandler {
  customId: string;
  execute: (interaction: ModalSubmitInteraction) => Promise<void>;
}

/**
 * A select menu handler (string select, channel select, role select, etc).
 * `AnySelectMenuInteraction` covers all select menu subtypes so one handler
 * shape works regardless of which kind of select menu it is.
 */
export interface SelectMenuHandler {
  customId: string;
  execute: (interaction: AnySelectMenuInteraction) => Promise<void>;
}

/**
 * A Discord.js client event listener (ready, interactionCreate, guildMemberAdd, etc).
 * `once` determines whether it's bound with `client.once` or `client.on`.
 */
export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void> | void;
}

/**
 * The bot's Discord client, extended with the runtime registries our
 * handlers populate at startup. Declared as a module augmentation so that
 * `client.commands` is fully typed everywhere in the codebase without
 * casting.
 */
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
    buttons: Collection<string, Button>;
    modals: Collection<string, ModalHandler>;
    selectMenus: Collection<string, SelectMenuHandler>;
  }
}

// Re-exported for convenience so other modules can `import { ExtendedClient }`
// instead of reaching into discord.js directly.
export type ExtendedClient = Client;