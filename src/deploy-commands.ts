/**
 * deploy-commands.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Standalone script — run with `npm run deploy-commands` — that pushes the
 * bot's slash command definitions to Discord's API.
 *
 * This is DELIBERATELY separate from the bot's runtime (index.ts). Command
 * registration is a config-push operation, not something that should
 * happen every time the bot restarts (that would hit rate limits and slow
 * down every deploy for no reason). Run this script only when a command's
 * name/description/options actually change.
 *
 * Registers to a single guild (instant propagation, ideal for development)
 * when DISCORD_GUILD_ID is set, otherwise registers globally (takes up to
 * ~1 hour to propagate, appropriate for production).
 */

import { REST, Routes } from 'discord.js';
import { env } from './config/env';
import { collectCommandData } from './handlers/commandHandler';
import { logger } from './utils/logger';

async function deployCommands(): Promise<void> {
  const commandData = collectCommandData();
  const rest = new REST().setToken(env.DISCORD_TOKEN);

  const route = env.DISCORD_GUILD_ID
    ? Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID)
    : Routes.applicationCommands(env.DISCORD_CLIENT_ID);

  const scope = env.DISCORD_GUILD_ID ? `guild ${env.DISCORD_GUILD_ID}` : 'globally';
  logger.info(`Deploying ${commandData.length} command(s) to ${scope}...`, 'DeployCommands');

  try {
    await rest.put(route, { body: commandData });
    logger.success(`Successfully deployed ${commandData.length} command(s).`, 'DeployCommands');
  } catch (error) {
    logger.error(error as Error, 'DeployCommands');
    process.exit(1);
  }
}

deployCommands();
