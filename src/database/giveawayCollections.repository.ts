/**
 * database/giveawayCollections.repository.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Pure data access for winner-collection submissions. Only
 * giveawayCollectionService.ts imports this — never commands/buttons/modals
 * directly, same layering rule as every other repository in the project.
 */

import { supabase } from './supabase';

export interface GiveawayCollectionRow {
  id: string;
  giveaway_id: string;
  user_id: string;
  value: string;
  submitted_at: string;
}

/** Upsert on (giveaway_id, user_id) — resubmitting overwrites the previous value, per approved UX. */
export async function upsertCollectionEntry(
  giveawayId: string,
  userId: string,
  value: string,
): Promise<GiveawayCollectionRow> {
  const { data, error } = await supabase
    .from('giveaway_collections')
    .upsert(
      { giveaway_id: giveawayId, user_id: userId, value, submitted_at: new Date().toISOString() },
      { onConflict: 'giveaway_id,user_id' },
    )
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to save collection entry: ${error?.message}`);
  return data as GiveawayCollectionRow;
}

export async function getCollectionEntries(giveawayId: string): Promise<GiveawayCollectionRow[]> {
  const { data, error } = await supabase
    .from('giveaway_collections')
    .select()
    .eq('giveaway_id', giveawayId);

  if (error) throw new Error(`Failed to fetch collection entries: ${error.message}`);
  return (data as GiveawayCollectionRow[]) ?? [];
}