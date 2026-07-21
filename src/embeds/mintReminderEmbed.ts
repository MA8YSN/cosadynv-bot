import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,

} from "discord.js";
import { type MintProject } from "../database/mintProjects.repository";
import { MINT_REMINDER_CONFIG } from "../config/mintReminder.config";

export type ReminderInterval = (typeof MINT_REMINDER_CONFIG.intervals)[number];

function formatMintDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysRemainingLabel(isoDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = isoDate.split("-").map(Number);
  const mint = new Date(year, month - 1, day);
  const diff = Math.ceil((mint.getTime() - today.getTime()) / 86400000);

  if (diff <= 0) return "Today 🚨";
  if (diff === 1) return "Tomorrow ⚠️";
  return `${diff} days`;
}

function formatMintPrice(
  price: number | null,
  currency: string | null
): string | null {
  if (!price || !currency) return null;
  return `${price} ${currency}`;
}

export function buildMintReminderEmbed(
  project: MintProject,
  interval: ReminderInterval
): { embed: EmbedBuilder; row: ActionRowBuilder<ButtonBuilder> } {
  const embed = new EmbedBuilder()
    .setColor(interval.color)
    .setTitle(`${interval.label}`)
    .setDescription(`**${project.name}**`)
    .setTimestamp();

  // Mint date
  if (project.mint_date) {
    embed.addFields({
      name: "📅 Mint Date",
      value: formatMintDate(project.mint_date),
      inline: true,
    });

    embed.addFields({
      name: "⏳ Time Remaining",
      value: getDaysRemainingLabel(project.mint_date),
      inline: true,
    });
  }

  // Mint price
  const priceStr = formatMintPrice(project.mint_price, project.mint_currency);
  if (priceStr) {
    embed.addFields({
      name: "💰 Mint Price",
      value: priceStr,
      inline: true,
    });
  }

  // Wallet
  if (project.wallets) {
    const walletValue = project.wallets.address
      ? `${project.wallets.name}\n\`${project.wallets.address.slice(0, 6)}...${project.wallets.address.slice(-4)}\``
      : project.wallets.name;

    embed.addFields({
      name: "👛 Wallet",
      value: walletValue,
      inline: true,
    });
  }

  // Notes
  if (project.notes) {
    embed.addFields({
      name: "📝 Notes",
      value: project.notes.slice(0, 1024),
      inline: false,
    });
  }

  // Social links
  const links: string[] = [];
  if (project.x_link) links.push(`[𝕏 Twitter](${project.x_link})`);
  if (project.discord_link) links.push(`[Discord](${project.discord_link})`);
  if (links.length > 0) {
    embed.addFields({
      name: "🔗 Links",
      value: links.join("  ·  "),
      inline: false,
    });
  }

  // Banner image
  if (project.image_url) {
    embed.setImage(project.image_url);
  }

  embed.setFooter({ text: "MintKeeper" });

  // Buttons
  const row = new ActionRowBuilder<ButtonBuilder>();

  row.addComponents(
    new ButtonBuilder()
      .setLabel("Open Project")
      .setEmoji("🟢")
      .setStyle(ButtonStyle.Link)
      .setURL(`${MINT_REMINDER_CONFIG.mintKeeperBaseUrl}/project/${project.id}`)
  );

  return { embed, row };
}