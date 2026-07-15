/**
 * commands/giveaway.ts
 * ─────────────────────────────────────────────────────────────────────────
 * /giveaway create|end|reroll|list
 *
 * Admin-facing giveaway management. Talks only to giveawayService.ts —
 * never to database/giveaways.repository.ts or services/giveawayPresentation.ts
 * directly, keeping the repository -> service -> presentation layering
 * consistent even at the command boundary.
 */

import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../types';
import {
  createGiveaway,
  endGiveaway,
  rerollGiveaway,
  listActiveGiveaways,
} from '../services/giveawayService';
import { resolveTargetChannel } from '../utils/resolveTargetChannel';
import { parseDuration } from '../utils/parseDuration';
import { embeds } from '../ui';
import { logger } from '../utils/logger';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Manage giveaways.')
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription('Create and post a new giveaway.')
        .addStringOption((opt) =>
          opt.setName('prize').setDescription('What is being given away').setRequired(true),
        )
        .addIntegerOption((opt) =>
          opt
            .setName('winners')
            .setDescription('Number of winners')
            .setRequired(true)
            .setMinValue(1),
        )
        .addStringOption((opt) =>
          opt
            .setName('duration')
            .setDescription('e.g. 3d, 1h30m, 45m')
            .setRequired(true),
        )
        .addChannelOption((opt) =>
          opt
            .setName('channel')
            .setDescription('Channel to post the giveaway in (defaults to this channel)')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('end')
        .setDescription('End a giveaway immediately and pick winners.')
        .addStringOption((opt) =>
          opt.setName('id').setDescription('Giveaway ID (see /giveaway list)').setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('reroll')
        .setDescription('Redraw winners for an already-ended giveaway.')
        .addStringOption((opt) =>
          opt.setName('id').setDescription('Giveaway ID').setRequired(true),
        ),
    )
    .addSubcommand((sub) => sub.setName('list').setDescription('List currently active giveaways.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') return handleCreate(interaction);
    if (subcommand === 'end') return handleEnd(interaction);
    if (subcommand === 'reroll') return handleReroll(interaction);
    if (subcommand === 'list') return handleList(interaction);
  },
};

async function handleCreate(interaction: ChatInputCommandInteraction): Promise<void> {
  const prize = interaction.options.getString('prize', true);
  const winnerCount = interaction.options.getInteger('winners', true);
  const durationInput = interaction.options.getString('duration', true);
  const targetChannel = resolveTargetChannel(interaction);

  if (!targetChannel) {
    await interaction.reply({ content: '❌ Please choose a valid text channel.', ephemeral: true });
    return;
  }

  if (!interaction.guildId) return;

  const durationMs = parseDuration(durationInput);
  if (!durationMs) {
    await interaction.reply({
      content: '❌ Invalid duration. Use a format like `3d`, `1h30m`, or `45m`.',
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const giveaway = await createGiveaway({
      channel: targetChannel,
      guildId: interaction.guildId,
      prize,
      winnerCount,
      createdBy: interaction.user.id,
      endsAt: new Date(Date.now() + durationMs),
    });

    await interaction.editReply({
      content: `✅ Giveaway created in ${targetChannel}. ID: \`${giveaway.id}\``,
    });

    logger.info(`${interaction.user.tag} created giveaway ${giveaway.id}`, 'GiveawayCommand');
  } catch (error) {
    logger.error(error as Error, 'GiveawayCommand');
    await interaction.editReply({
      content: '❌ Failed to create the giveaway. Please try again.',
    });
  }
}

async function handleEnd(interaction: ChatInputCommandInteraction): Promise<void> {
  const id = interaction.options.getString('id', true);
  await interaction.deferReply({ ephemeral: true });

  const ended = await endGiveaway(interaction.client, id);

  await interaction.editReply({
    content: ended
      ? '✅ Giveaway ended and winners announced.'
      : '❌ Could not end that giveaway — check the ID, or it may have already ended.',
  });
}

async function handleReroll(interaction: ChatInputCommandInteraction): Promise<void> {
  const id = interaction.options.getString('id', true);
  await interaction.deferReply({ ephemeral: true });

  const rerolled = await rerollGiveaway(interaction.client, id);

  await interaction.editReply({
    content: rerolled
      ? '✅ Winners rerolled and announced.'
      : '❌ Could not reroll that giveaway — check the ID, or it may not have ended yet.',
  });
}

async function handleList(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) return;
  await interaction.deferReply({ ephemeral: true });

  const active = await listActiveGiveaways(interaction.guildId);

  if (active.length === 0) {
    await interaction.editReply({
      embeds: [
        embeds.info({
          title: 'No Active Giveaways',
          description: 'There are no giveaways running right now.',
        }),
      ],
    });
    return;
  }

  const description = active
    .map((g) => {
      const endsAtSeconds = Math.floor(new Date(g.ends_at).getTime() / 1000);
      return `**${g.prize}** — \`${g.id}\`\nEnds <t:${endsAtSeconds}:R>`;
    })
    .join('\n\n');

  await interaction.editReply({
    embeds: [embeds.brand({ title: '🎉 Active Giveaways', description })],
  });
}

export default command; 