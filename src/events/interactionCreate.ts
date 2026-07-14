/**
 * events/interactionCreate.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Discord sends exactly ONE gateway event — `interactionCreate` — for every
 * kind of interaction: slash commands, button clicks, select menus, modal
 * submissions, autocomplete, etc. This file is the single router that
 * inspects the interaction type and dispatches to the right registry
 * (`client.commands`, `client.buttons`, `client.selectMenus`, `client.modals`).
 *
 * Individual command/button/select-menu/modal files never need to touch
 * this file — they just get looked up here by their `name` / `customId`.
 * This keeps the routing logic in exactly one place as the bot grows.
 */

import { BaseInteraction, Events } from 'discord.js';
import { BotEvent } from '../types';
import { logger } from '../utils/logger';

/**
 * A generic error reply that works whether or not the interaction has
 * already been deferred/replied to — avoids the classic
 * "InteractionAlreadyReplied" crash.
 */
async function safeErrorReply(interaction: BaseInteraction): Promise<void> {
  if (!interaction.isRepliable()) return;

  const payload = {
    content: '❌ Something went wrong while processing that. Please try again.',
    ephemeral: true,
  };

  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(payload);
    } else {
      await interaction.reply(payload);
    }
  } catch (error) {
    logger.error(error as Error, 'InteractionCreate');
  }
}

const event: BotEvent<Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  async execute(interaction: BaseInteraction) {
    // ── Slash commands ────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        logger.warn(`Unknown command received: ${interaction.commandName}`, 'InteractionCreate');
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        logger.error(error as Error, `Command:${interaction.commandName}`);
        await safeErrorReply(interaction);
      }
      return;
    }

    // ── Buttons ──────────────────────────────────────────────────────
    if (interaction.isButton()) {
      const handler =
        interaction.client.buttons.get(interaction.customId) ??
        [...interaction.client.buttons.values()].find((b) =>
          interaction.customId.startsWith(`${b.customId}:`),
        );

      if (!handler) {
        logger.warn(`Unknown button interaction: ${interaction.customId}`, 'InteractionCreate');
        return;
      }

      try {
        await handler.execute(interaction);
      } catch (error) {
        logger.error(error as Error, `Button:${interaction.customId}`);
        await safeErrorReply(interaction);
      }
      return;
    }

    // ── Select menus (string, channel, role, user, mentionable) ───────
    if (interaction.isAnySelectMenu()) {
      const handler =
        interaction.client.selectMenus.get(interaction.customId) ??
        [...interaction.client.selectMenus.values()].find((s) =>
          interaction.customId.startsWith(`${s.customId}:`),
        );

      if (!handler) {
        logger.warn(
          `Unknown select menu interaction: ${interaction.customId}`,
          'InteractionCreate',
        );
        return;
      }

      try {
        await handler.execute(interaction);
      } catch (error) {
        logger.error(error as Error, `SelectMenu:${interaction.customId}`);
        await safeErrorReply(interaction);
      }
      return;
    }

    // ── Modals ───────────────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      const handler =
        interaction.client.modals.get(interaction.customId) ??
        [...interaction.client.modals.values()].find((m) =>
          interaction.customId.startsWith(`${m.customId}:`),
        );

      if (!handler) {
        logger.warn(`Unknown modal submission: ${interaction.customId}`, 'InteractionCreate');
        return;
      }

      try {
        await handler.execute(interaction);
      } catch (error) {
        logger.error(error as Error, `Modal:${interaction.customId}`);
        await safeErrorReply(interaction);
      }
      return;
    }

    // Autocomplete, etc. will be routed here as those features are built.
  },
};

export default event;