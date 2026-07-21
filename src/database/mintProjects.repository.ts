import { SupabaseClient } from "@supabase/supabase-js";

export type MintProject = {
  id: string;
  user_id: string;
  name: string;
  mint_date: string | null;
  mint_price: number | null;
  mint_currency: string | null;
  image_url: string | null;
  notes: string | null;
  x_link: string | null;
  discord_link: string | null;
  minted: boolean;
  wallet_id: string | null;
  wallets: {
  id: string;
  name: string;
  address: string | null;
  blockchain: string | null;
} | null;
};

export type SentReminder = {
  id: string;
  project_id: string;
  interval_key: string;
  sent_at: string;
};

export class MintProjectsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Fetch all active (not minted) projects that have a mint_date set.
   * Joins wallets so we can display wallet info in the embed.
   */
  async getActiveProjectsWithMintDate(): Promise<MintProject[]> {
    const { data, error } = await this.supabase
      .from("projects")
      .select(`
        id,
        user_id,
        name,
        mint_date,
        mint_price,
        mint_currency,
        image_url,
        notes,
        x_link,
        discord_link,
        minted,
        wallet_id,
        wallets (
          id,
          name,
          address,
          blockchain
        )
      `)
      .eq("minted", false)
      .not("mint_date", "is", null)
      .order("mint_date", { ascending: true });

    if (error) {
      throw new Error(`[MintProjectsRepository] Failed to fetch projects: ${error.message}`);
    }
return (data ?? []).map((project: any) => ({
  ...project,
  wallets: project.wallets?.[0] ?? null,
}));
  }

  /**
   * Check whether a specific reminder has already been sent for a project + interval.
   */
  async hasReminderBeenSent(projectId: string, intervalKey: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("mint_reminders_sent")
      .select("id")
      .eq("project_id", projectId)
      .eq("interval_key", intervalKey)
      .maybeSingle();

    if (error) {
      throw new Error(`[MintProjectsRepository] Failed to check reminder: ${error.message}`);
    }

    return data !== null;
  }

  /**
   * Record that a reminder was sent for a project + interval.
   */
  async markReminderSent(projectId: string, intervalKey: string): Promise<void> {
    const { error } = await this.supabase
      .from("mint_reminders_sent")
      .insert({ project_id: projectId, interval_key: intervalKey });

    if (error) {
      throw new Error(`[MintProjectsRepository] Failed to mark reminder sent: ${error.message}`);
    }
  }

  /**
   * Clean up sent reminder records for projects that have been minted
   * or whose mint date has passed. Keeps the table small.
   */
  async cleanupStaleReminders(): Promise<void> {
   

    const { error } = await this.supabase
      .from("mint_reminders_sent")
      .delete()
      .lt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error(`[MintProjectsRepository] Failed to clean up stale reminders: ${error.message}`);
    }
  }
}