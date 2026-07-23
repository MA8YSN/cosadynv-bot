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

function formatMintPrice(
  price: number | null,
  currency: string | null
): string {
  if (!price || !currency) return "Free Mint";
  return `${price} ${currency}`;
}

function truncateNotes(notes: string, maxLength = 220): string {
  if (notes.length <= maxLength) return notes;
  const truncated = notes.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

export function buildMintReminderEmbed(
  project: MintProject,
  interval: ReminderInterval
): { embed: EmbedBuilder; row: ActionRowBuilder<ButtonBuilder> } {
  // Project name is the title (primary heading). The urgency label
  // (interval.label — "MINT TODAY" etc.) plus WL status become the bold
  // first line of the description: most prominent text in the body,
  // without competing with the name for the title slot. WL status is
  // bold inline text here instead of a colored badge, since Discord
  // embeds only offer one accent-color slot and that's spent on urgency.
  const headline = `**${interval.label}**`;

  const embed = new EmbedBuilder()
    .setColor(interval.color)
    .setTitle(project.name)
    .setDescription(headline)
    .setTimestamp();

  // Mint date — the countdown itself is already communicated by the bold
  // headline above, so this field shows only the calendar date rather
  // than repeating "Today" / "3 days" a second time.
  if (project.mint_date) {
    embed.addFields({
      name: "Mint Date",
      value: formatMintDate(project.mint_date),
      inline: true,
    });
  }

  // Mint price — always shown, "Free Mint" when price/currency are absent.
  embed.addFields({
    name: "Mint Price",
    value: formatMintPrice(project.mint_price, project.mint_currency),
    inline: true,
  });

  // Wallet
  if (project.wallets) {
    const walletValue = project.wallets.address
      ? `${project.wallets.name}\n\`${project.wallets.address.slice(0, 6)}...${project.wallets.address.slice(-4)}\``
      : project.wallets.name;

    embed.addFields({
      name: "Wallet",
      value: walletValue,
      inline: true,
    });
  }

  // Notes → Bio, truncated cleanly at a word boundary.
  if (project.notes) {
    embed.addFields({
      name: "Bio",
      value: truncateNotes(project.notes),
      inline: false,
    });
  }

  // Social links — only rendered if present, no placeholders. 𝕏 kept as
  // the brand glyph (not a decorative emoji); other labels are plain
  // text per "remove unnecessary emojis."
  const links: string[] = [];
  if (project.x_link) links.push(`[𝕏 Twitter](${project.x_link})`);
  if (project.discord_link) links.push(`[Discord](${project.discord_link})`);
  if (links.length > 0) {
    embed.addFields({
      name: "Links",
      value: links.join("  ·  "),
      inline: false,
    });
  }

  if (project.image_url) {
    embed.setImage(project.image_url);
  }

  embed.setFooter({ text: "Powered by MintKeeper · Cosadyn" });

  const row = new ActionRowBuilder<ButtonBuilder>();

  row.addComponents(
    new ButtonBuilder()
      .setLabel("Open Project")
      .setStyle(ButtonStyle.Link)
      .setURL(`${MINT_REMINDER_CONFIG.mintKeeperBaseUrl}/project/${project.id}`)
  );

  return { embed, row };
}