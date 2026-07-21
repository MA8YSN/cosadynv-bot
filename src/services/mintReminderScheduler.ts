import { type Client } from "discord.js";
import { MintReminderService } from "./mintReminderService";
import { MintProjectsRepository } from "../database/mintProjects.repository";
import { MINT_REMINDER_CONFIG } from "../config/mintReminder.config";
import { type SupabaseClient } from "@supabase/supabase-js";

export class MintReminderScheduler {
  private interval: NodeJS.Timeout | null = null;
  private readonly service: MintReminderService;

  constructor(
    supabase: SupabaseClient,
    private readonly client: Client,
    private readonly guildId: string
  ) {
    const repository = new MintProjectsRepository(supabase);
    this.service = new MintReminderService(repository);
  }

  start(): void {
    if (this.interval) {
      console.warn("[MintReminderScheduler] ⚠️  Already running — skipping start");
      return;
    }

    const intervalMinutes = MINT_REMINDER_CONFIG.schedulerIntervalMs / 1000 / 60;
    console.log(`[MintReminderScheduler] ▶ Starting — interval=${intervalMinutes}min | guildId=${this.guildId}`);

    this.run();

    this.interval = setInterval(() => {
      console.log(`[MintReminderScheduler] ⏰ Interval tick at ${new Date().toISOString()}`);
      this.run();
    }, MINT_REMINDER_CONFIG.schedulerIntervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log("[MintReminderScheduler] ⏹ Stopped");
    }
  }

  private async run(): Promise<void> {
    console.log(`\n[MintReminderScheduler] ⏰ Run triggered at ${new Date().toISOString()}`);

    let guild;
    try {
      guild = await this.client.guilds.fetch(this.guildId);
      console.log(`[MintReminderScheduler] ✅ Guild fetched: ${guild.name} (${guild.id})`);
    } catch (err) {
      console.error(`[MintReminderScheduler] ❌ Failed to fetch guild ${this.guildId}:`, err);
      return;
    }

    if (!guild) {
      console.error(`[MintReminderScheduler] ❌ Guild ${this.guildId} returned null`);
      return;
    }

    try {
      await this.service.processReminders(guild);
    } catch (err) {
      console.error("[MintReminderScheduler] ❌ Unhandled error during processReminders:", err);
    }
  }
}