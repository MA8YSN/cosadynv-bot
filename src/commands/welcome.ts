    /**
 * commands/welcome.ts
 * ─────────────────────────────────────────────────────────────────────────
 * /welcome setup|test
 *
 * setup: opens the wizard (prefilled from any existing saved config).
 * test: sends a real welcome, using the admin as the simulated new
 * member, through the exact same sendWelcome() a real join uses — so
 * this validates the entire pipeline (channel post + DM attempt), not
 * just a preview. The wizard's own Preview button is the safe,
 * ephemeral-only alternative for checking a draft before saving.
 */

import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types';
import { createDraft, getSavedWelcomeConfig } from '../services/welcomeSetupService';
import { buildWelcomeSetupPayload } from '../embeds/welcomeSetupDashboard';
import { sendWelcome } from '../services/welcomeService';
import { logger } from '../utils/logger';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure and test the Welcome System.')
    .addSubcommand((sub) => sub.setName('setup').setDescription('Open the Welcome Setup wizard.'))
    .addSubcommand((sub) =>
      sub.setName('test').setDescription('Send a real test welcome using the saved configuration.'),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'setup') return handleSetup(interaction);
    if (subcommand === 'test') return handleTest(interaction);
  },
};

async function handleSetup(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) return;

  const existing = await getSavedWelcomeConfig(interaction.guildId);
  const draft = createDraft(interaction.guildId, interaction.user.id, existing);

  await interaction.reply({ ...buildWelcomeSetupPayload(draft), ephemeral: true });
}

async function handleTest(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.inCachedGuild()) return;
  await interaction.deferReply({ ephemeral: true });

  const config = await getSavedWelcomeConfig(interaction.guildId);
  if (!config) {
    await interaction.editReply({
      content: '❌ Welcome isn\u2019t configured yet. Run `/welcome setup` first.',
    });
    return;
  }

  try {
    await sendWelcome(interaction.client, interaction.member);
    await interaction.editReply({
      content: '✅ Test welcome sent — check the configured channel (and your DMs, if enabled).',
    });
  } catch (error) {
    logger.error(error as Error, 'WelcomeCommand');
    await interaction.editReply({ content: '❌ Failed to send the test welcome.' });
  }
}

export default command;