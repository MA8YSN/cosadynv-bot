import { type Client,  } from "discord.js";
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
      console.warn("[MintReminderScheduler] Already running — skipping start");
      return;
    }

    console.log(
      `[MintReminderScheduler] Starting — checking every ${MINT_REMINDER_CONFIG.schedulerIntervalMs / 1000 / 60} minutes`
    );

    // Run immediately on start
    this.run();

    // Then run on interval
    this.interval = setInterval(() => {
      this.run();
    }, MINT_REMINDER_CONFIG.schedulerIntervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log("[MintReminderScheduler] Stopped");
    }
  }

  private async run(): Promise<void> {
    try {
      const guild = await this.client.guilds.fetch(this.guildId);

      if (!guild) {
        console.error(`[MintReminderScheduler] Guild ${this.guildId} not found`);
        return;
      }

      await this.service.processReminders(guild);
    } catch (err) {
      console.error("[MintReminderScheduler] Unhandled error during run:", err);
    }
  }
}