import { type Guild } from "discord.js";
import { MintProjectsRepository, type MintProject } from "../database/mintProjects.repository";
import { MintReminderPresentation } from "./mintReminderPresentation";
import { MINT_REMINDER_CONFIG } from "../config/mintReminder.config";

function getDaysUntilMint(mintDateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = mintDateIso.split("-").map(Number);
  const mint = new Date(year, month - 1, day);
  const diff = Math.ceil((mint.getTime() - today.getTime()) / 86400000);
  return diff;
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
    console.log("─".repeat(60));
    console.log(`[MintReminderService] ▶ Starting reminder run`);
    console.log(`[MintReminderService] Guild: ${guild.name} (${guild.id})`);
    console.log(`[MintReminderService] Time: ${new Date().toISOString()}`);
    console.log("─".repeat(60));

    // ── Step 1: Fetch projects ───────────────────────────────────────────────
    let projects: MintProject[];
    try {
      projects = await this.repository.getActiveProjectsWithMintDate();
    } catch (err) {
      console.error("[MintReminderService] ❌ FAILED to fetch projects from Supabase:", err);
      return;
    }

    console.log(`[MintReminderService] ✅ Fetched ${projects.length} active project(s) from Supabase`);

    if (projects.length === 0) {
      console.log("[MintReminderService] ℹ️  No active projects with mint dates — nothing to do");
      console.log("─".repeat(60));
      return;
    }

    // ── Step 2: Log all fetched projects ─────────────────────────────────────
    console.log("\n[MintReminderService] 📋 Projects fetched:");
    for (const p of projects) {
      console.log(`  • [${p.id}] "${p.name}" | mint_date=${p.mint_date ?? "null"} | minted=${p.minted}`);
    }
    console.log("");

    // ── Step 3: Process each project ─────────────────────────────────────────
    for (const project of projects) {
      console.log(`[MintReminderService] ── Processing: "${project.name}" (${project.id})`);

      // Guard: minted
      if (project.minted) {
        console.log(`[MintReminderService]    ⏭ SKIP — project is already minted`);
        continue;
      }

      // Guard: no mint_date
      if (!project.mint_date) {
        console.log(`[MintReminderService]    ⏭ SKIP — mint_date is null`);
        continue;
      }

      const daysLeft = getDaysUntilMint(project.mint_date);
      const hoursLeft = getHoursUntilMint(project.mint_date);

      console.log(`[MintReminderService]    📅 mint_date=${project.mint_date} | daysLeft=${daysLeft} | hoursLeft=${hoursLeft.toFixed(2)}`);

      // Guard: past mint date
      if (daysLeft < -1) {
        console.log(`[MintReminderService]    ⏭ SKIP — mint date has passed (daysLeft=${daysLeft})`);
        continue;
      }

      // ── Step 4: Check each interval ────────────────────────────────────────
      for (const interval of MINT_REMINDER_CONFIG.intervals) {
        const shouldSend = this.shouldSendReminder(interval, daysLeft, hoursLeft);

        console.log(
          `[MintReminderService]    🔍 Interval "${interval.key}": shouldSend=${shouldSend} (daysLeft=${daysLeft}, hoursLeft=${hoursLeft.toFixed(2)})`
        );

        if (!shouldSend) continue;

        console.log(`[MintReminderService]    ✅ Interval "${interval.key}" matches — checking if already sent...`);

        // ── Step 5: Check if reminder already sent ──────────────────────────
        let alreadySent: boolean;
        try {
          alreadySent = await this.repository.hasReminderBeenSent(project.id, interval.key);
        } catch (err) {
          console.error(
            `[MintReminderService]    ❌ FAILED to check sent status for "${project.name}" / "${interval.key}":`,
            err
          );
          continue;
        }

        if (alreadySent) {
          console.log(
            `[MintReminderService]    ⏭ SKIP — "${interval.key}" reminder already sent for "${project.name}"`
          );
          continue;
        }

        console.log(
          `[MintReminderService]    📤 Sending "${interval.key}" reminder for "${project.name}"...`
        );

        // ── Step 6: Send the reminder ───────────────────────────────────────
        let sent: boolean;
        try {
          sent = await this.presentation.sendReminder(guild, project, interval);
        } catch (err) {
          console.error(
            `[MintReminderService]    ❌ FAILED to send reminder for "${project.name}" / "${interval.key}":`,
            err
          );
          continue;
        }

        if (!sent) {
          console.warn(
            `[MintReminderService]    ⚠️  sendReminder returned false for "${project.name}" / "${interval.key}" — channel likely missing`
          );
          continue;
        }

        // ── Step 7: Mark as sent ────────────────────────────────────────────
        try {
          await this.repository.markReminderSent(project.id, interval.key);
          console.log(
            `[MintReminderService]    ✅ Marked "${interval.key}" as sent for "${project.name}"`
          );
        } catch (err) {
          console.error(
            `[MintReminderService]    ❌ FAILED to mark reminder sent for "${project.name}" / "${interval.key}":`,
            err
          );
        }
      }

      console.log(`[MintReminderService]    Done with "${project.name}"`);
    }

    // ── Step 8: Cleanup ──────────────────────────────────────────────────────
    console.log("\n[MintReminderService] 🧹 Running stale reminder cleanup...");
    try {
      await this.repository.cleanupStaleReminders();
      console.log("[MintReminderService] ✅ Cleanup done");
    } catch (err) {
      console.error("[MintReminderService] ❌ Cleanup failed:", err);
    }

    console.log("─".repeat(60));
    console.log("[MintReminderService] ▶ Reminder run complete");
    console.log("─".repeat(60));
  }

 private shouldSendReminder(
  interval: (typeof MINT_REMINDER_CONFIG.intervals)[number],
  daysLeft: number,
  _hoursLeft: number
): boolean {
  return interval.key === "today" && daysLeft === 0;
}
}