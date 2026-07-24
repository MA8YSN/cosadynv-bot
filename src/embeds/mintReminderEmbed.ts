
import { ActionRowBuilder, ButtonBuilder,ButtonStyle } from 'discord.js';
import { embeds, buttons,  TERMS } from '../ui';
import { type MintProject } from '../database/mintProjects.repository';
import { MINT_REMINDER_CONFIG } from '../config/mintReminder.config';

export type ReminderInterval = (typeof MINT_REMINDER_CONFIG.intervals)[number];

function formatMintDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatMintPrice(price: number | null, currency: string | null): string {
  if (!price || !currency) return TERMS.FREE_MINT;
  return `${price} ${currency}`;
}

function truncateNotes(notes: string, maxLength = 220): string {
  if (notes.length <= maxLength) return notes;
  const truncated = notes.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

export function buildMintReminderEmbed(
  project: MintProject,
  interval: ReminderInterval,
): { embed: ReturnType<typeof embeds.banner>; row: ActionRowBuilder<ButtonBuilder> } {
  const headline = `**${interval.label}**`;

  const embed = embeds.banner({
    title: project.name,
    description: headline,
    color: interval.color,
    image: project.image_url ?? undefined,
    footerText: 'Powered by MintKeeper · Cosadyn',
  });

  if (project.mint_date) {
    embed.addFields({
      name: 'Mint Date',
      value: formatMintDate(project.mint_date),
      inline: true,
    });
  }

  embed.addFields({
    name: 'Mint Price',
    value: formatMintPrice(project.mint_price, project.mint_currency),
    inline: true,
  });

  if (project.wallets) {
    const walletValue = project.wallets.address
      ? `${project.wallets.name}\n\`${project.wallets.address.slice(0, 6)}...${project.wallets.address.slice(-4)}\``
      : project.wallets.name;

    embed.addFields({
      name: 'Wallet',
      value: walletValue,
      inline: true,
    });
  }

  if (project.notes) {
    embed.addFields({
      name: 'Bio',
      value: truncateNotes(project.notes),
      inline: false,
    });
  }

  const links: string[] = [];
  if (project.x_link) links.push(`[𝕏 Twitter](${project.x_link})`);
  if (project.discord_link) links.push(`[Discord](${project.discord_link})`);
  if (links.length > 0) {
    embed.addFields({
      name: 'Links',
      value: links.join('  ·  '),
      inline: false,
    });
  }

  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setLabel("Open Project")
    .setStyle(ButtonStyle.Link)
    .setURL(`${MINT_REMINDER_CONFIG.mintKeeperBaseUrl}/project/${project.id}`)
);

return {
  embed,
  row: actionRow,
};
}