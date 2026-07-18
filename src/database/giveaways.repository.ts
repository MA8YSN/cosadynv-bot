/**
 * database/giveaways.repository.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Pure data access for the Giveaway System — every Supabase query for
 * giveaways/entries/winners lives here and only here. Only files inside
 * services/ (giveawayService.ts, giveawayScheduler.ts) import this —
 * commands and buttons always go through the service layer, never here
 * directly.
 *
 * This is the first repository in the project — the pattern it
 * establishes (repository = raw queries, service = business logic) is
 * meant to be reused by every future DB-backed feature (Citizen IDs,
 * Contribution Tracking, Leaderboards), not just giveaways.
 *
 * Row types here are hand-written against supabase/schema.sql. Once that
 * schema is applied in your Supabase project, you can regenerate
 * database/database.types.ts via the Supabase CLI and swap these for
 * generated types — not done yet since this schema doesn't exist in
 * Supabase until you run supabase/schema.sql.
 */

import { supabase } from './supabase';

export type GiveawayStatus = 'active' | 'ended' | 'cancelled';

export interface GiveawayRow {
  id: string;
  guild_id: string;
  channel_id: string;
  message_id: string;
  prize: string;
  winner_count: number;
  status: GiveawayStatus;
  created_by: string;
  created_at: string;
  ends_at: string;
  ended_at: string | null;
  collection_type: string | null;
  collection_config: Record<string, unknown> | null;
  collection_channel_id: string | null;
  collection_message_id: string | null;
}

export interface CreateGiveawayInput {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string;
  prize: string;
  winnerCount: number;
  createdBy: string;
  endsAt: Date;
  /** Undefined means no winner collection for this giveaway — behaves exactly as before. */
  collectionType?: string;
  collectionConfig?: Record<string, unknown>;
}

export async function insertGiveaway(input: CreateGiveawayInput): Promise<GiveawayRow> {
  const { data, error } = await supabase
    .from('giveaways')
    .insert({
      id: input.id,
      guild_id: input.guildId,
      channel_id: input.channelId,
      message_id: input.messageId,
      prize: input.prize,
      winner_count: input.winnerCount,
      created_by: input.createdBy,
      ends_at: input.endsAt.toISOString(),
      collection_type: input.collectionType ?? null,
      collection_config: input.collectionConfig ?? null,
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to insert giveaway: ${error?.message}`);
  return data as GiveawayRow;
}

/** Records where the winner-collection panel was posted, so it can be edited on later submissions. */
export async function setCollectionPanelMessage(
  id: string,
  channelId: string,
  messageId: string,
): Promise<void> {
  const { error } = await supabase
    .from('giveaways')
    .update({ collection_channel_id: channelId, collection_message_id: messageId })
    .eq('id', id);

  if (error) throw new Error(`Failed to save collection panel message: ${error.message}`);
}

export async function getGiveaway(id: string): Promise<GiveawayRow | null> {
  const { data, error } = await supabase.from('giveaways').select().eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to fetch giveaway: ${error.message}`);
  return (data as GiveawayRow) ?? null;
}

export async function listActiveGiveaways(guildId: string): Promise<GiveawayRow[]> {
  const { data, error } = await supabase
    .from('giveaways')
    .select()
    .eq('guild_id', guildId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to list active giveaways: ${error.message}`);
  return (data as GiveawayRow[]) ?? [];
}

export async function listExpiredActiveGiveaways(): Promise<GiveawayRow[]> {
  const { data, error } = await supabase
    .from('giveaways')
    .select()
    .eq('status', 'active')
    .lte('ends_at', new Date().toISOString());

  if (error) throw new Error(`Failed to list expired giveaways: ${error.message}`);
  return (data as GiveawayRow[]) ?? [];
}

/**
 * Every active giveaway, bot-wide — no guild filter, same as
 * listExpiredActiveGiveaways above. Used by the scheduler's entry-count
 * refresh pass, which (like the expiry check) operates across every
 * server the bot is in, not one at a time.
 */
export async function listAllActiveGiveaways(): Promise<GiveawayRow[]> {
  const { data, error } = await supabase.from('giveaways').select().eq('status', 'active');
  if (error) throw new Error(`Failed to list active giveaways: ${error.message}`);
  return (data as GiveawayRow[]) ?? [];
}

export async function markGiveawayEnded(id: string): Promise<void> {
  const { error } = await supabase
    .from('giveaways')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(`Failed to mark giveaway ended: ${error.message}`);
}

/** Best-effort rollback for a failed creation — deletes the giveaway row if it exists. */
export async function deleteGiveaway(id: string): Promise<void> {
  const { error } = await supabase.from('giveaways').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete giveaway: ${error.message}`);
}

export async function insertEntry(giveawayId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('giveaway_entries')
    .insert({ giveaway_id: giveawayId, user_id: userId });

  if (error) {
    // Postgres unique_violation — this user already entered this giveaway.
    if (error.code === '23505') return false;
    throw new Error(`Failed to insert entry: ${error.message}`);
  }

  return true;
}

export async function countEntries(giveawayId: string): Promise<number> {
  const { count, error } = await supabase
    .from('giveaway_entries')
    .select('id', { count: 'exact', head: true })
    .eq('giveaway_id', giveawayId);

  if (error) throw new Error(`Failed to count entries: ${error.message}`);
  return count ?? 0;
}

/**
 * Picks up to `count` random distinct entrants for a giveaway, optionally
 * excluding specific user IDs (used by reroll to avoid re-picking prior
 * winners).
 *
 * Fetches eligible entrant IDs (just user_id strings, not full rows) and
 * shuffles in-memory — acceptable at V1's scale. Revisit with a Postgres
 * RPC function (`ORDER BY random() LIMIT n` server-side) if entry counts
 * grow very large; Supabase's JS query builder has no native "order by
 * random" today.
 */
export async function getRandomEntrants(
  giveawayId: string,
  count: number,
  excludeUserIds: string[] = [],
): Promise<string[]> {
  let query = supabase.from('giveaway_entries').select('user_id').eq('giveaway_id', giveawayId);

  if (excludeUserIds.length > 0) {
    query = query.not('user_id', 'in', `(${excludeUserIds.join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch entrants: ${error.message}`);

  const userIds = (data ?? []).map((row) => row.user_id as string);
  const shuffled = userIds.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Replaces a giveaway's entire winner set (used by both initial ending and reroll). */
export async function replaceWinners(giveawayId: string, userIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('giveaway_winners')
    .delete()
    .eq('giveaway_id', giveawayId);

  if (deleteError) throw new Error(`Failed to clear previous winners: ${deleteError.message}`);

  if (userIds.length === 0) return;

  const { error: insertError } = await supabase
    .from('giveaway_winners')
    .insert(userIds.map((userId) => ({ giveaway_id: giveawayId, user_id: userId })));

  if (insertError) throw new Error(`Failed to insert winners: ${insertError.message}`);
}

export async function getWinners(giveawayId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('giveaway_winners')
    .select('user_id')
    .eq('giveaway_id', giveawayId);

  if (error) throw new Error(`Failed to fetch winners: ${error.message}`);
  return (data ?? []).map((row) => row.user_id as string);
}