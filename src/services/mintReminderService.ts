import {  type Guild } from "discord.js";
import { MintProjectsRepository, type MintProject } from "../database/mintProjects.repository";
import { MintReminderPresentation } from "./mintReminderPresentation";
import { MINT_REMINDER_CONFIG } from "../config/mintReminder.config";

function getDaysUntilMint(mintDateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = mintDateIso.split("-").map(Number);
  const mint = new Date(year, month - 1, day);
  return Math.ceil((mint.getTime() - today.getTime()) / 86400000);
}

function getHoursUntilMint(mintDateIso: string): number {
  const now = Date.now();
  const [year, month, day] = mintDateIso.split("-").map(Number);
  const mint = new Date(year, month - 1, day).getTime();
  return (mint - now) / (1000 * 60 * 60);
}

export class MintReminderService {
  private readonly presentation: MintReminderPresentation;

  constructor(
  private readonly repository: MintProjectsRepository
) {
  this.presentation = new MintReminderPresentation();
}

  async processReminders(guild: Guild): Promise<void> {
    console.log(`[MintReminderService] Processing reminders for guild: ${guild.name}`);

    let projects: MintProject[];
    try {
      projects = await this.repository.getActiveProjectsWithMintDate();
    } catch (err) {
      console.error("[MintReminderService] Failed to fetch projects:", err);
      return;
    }

    console.log(`[MintReminderService] Found ${projects.length} active projects with mint dates`);

for (const project of projects) {
  if (!project.mint_date) {
    console.log(`[MintReminderService] Skipping ${project.name} -> no mint date`);
    continue;
  }

  const daysLeft = getDaysUntilMint(project.mint_date);
  const hoursLeft = getHoursUntilMint(project.mint_date);

  console.log("=================================");
  console.log(`Project: ${project.name}`);
  console.log(`Mint Date: ${project.mint_date}`);
  console.log(`Days Left: ${daysLeft}`);
  console.log(`Hours Left: ${hoursLeft}`);
  console.log("=================================");

  // Skip projects that have already minted (past mint date by more than 1 day)
  if (daysLeft < -1) {
    console.log(`[MintReminderService] Skipping ${project.name} -> already in the past`);
    continue;
  }

      for (const interval of MINT_REMINDER_CONFIG.intervals) {
       const shouldSend = this.shouldSendReminder(interval, daysLeft, hoursLeft);

console.log(
  `[MintReminderService] ${project.name} | ${interval.key} -> ${shouldSend}`
);

if (!shouldSend) continue;

        try {
          const alreadySent = await this.repository.hasReminderBeenSent(
            project.id,
            interval.key
          );

          if (alreadySent) {
            console.log(
              `[MintReminderService] Skipping ${interval.key} for "${project.name}" — already sent`
            );
            continue;
          }

          const sent = await this.presentation.sendReminder(guild, project, interval);

          if (sent) {
            await this.repository.markReminderSent(project.id, interval.key);
          }
        } catch (err) {
          console.error(
            `[MintReminderService] Error processing ${interval.key} reminder for "${project.name}":`,
            err
          );
        }
      }
    }

    // Cleanup old records periodically
    await this.repository.cleanupStaleReminders();
  }

  private shouldSendReminder(
    interval: (typeof MINT_REMINDER_CONFIG.intervals)[number],
    daysLeft: number,
    hoursLeft: number
  ): boolean {
    switch (interval.key) {
      case "7d":
        return daysLeft === 7;
      case "3d":
        return daysLeft === 3;
      case "24h":
        return daysLeft === 1;
      case "today":
        return daysLeft === 0;
      case "1h":
        return hoursLeft > 0 && hoursLeft <= 1;
      default:
        return false;
    }
  }
}