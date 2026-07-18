/**
 * database/verificationConfig.repository.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Pure data access for the Verification System V2's per-guild
 * configuration. Only services/verificationModeService.ts imports this —
 * never commands/buttons/modals directly, same layering rule as every
 * other repository in the project (giveaways.repository.ts,
 * welcomeConfig.repository.ts, etc.).
 *
 * One row per guild. active_mode determines which mode is currently
 * live; mode_config (jsonb) holds settings specific to that mode (e.g.
 * valid codes for code_lobby) without needing a schema change per mode —
 * same hybrid pattern giveaways/giveaway_collections already established.
 */

import { supabase } from './supabase';

export type VerificationMode = 'simple' | 'captcha' | 'code_lobby';

export interface VerificationConfigRow {
  guild_id: string;
  active_mode: VerificationMode | null;
  verified_role_id: string | null;
  lobby_role_id: string | null;
  welcome_channel_id: string | null;
  verify_channel_id: string | null;
  pre_entry_channel_id: string | null;
  lobby_chat_channel_id: string | null;
  lobby_giveaways_channel_id: string | null;
  mode_config: Record<string, unknown>;
  updated_by: string;
  updated_at: string;
}

/** Partial by design — callers only ever patch the fields relevant to what they're doing (e.g. just active_mode, or just channel IDs during setup). */
export type UpsertVerificationConfigInput = Partial<Omit<VerificationConfigRow, 'guild_id' | 'updated_at'>> & { updatedBy: string };

export async function getVerificationConfig(guildId: string): Promise<VerificationConfigRow | null> {
  const { data, error } = await supabase
    .from('verification_config')
    .select()
    .eq('guild_id', guildId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch verification config: ${error.message}`);
  return (data as VerificationConfigRow) ?? null;
}

/** Merges into any existing row for this guild — callers pass only the fields they're changing. */
export async function upsertVerificationConfig(
  guildId: string,
  input: UpsertVerificationConfigInput,
): Promise<VerificationConfigRow> {
  const existing = await getVerificationConfig(guildId);

  const { updatedBy, ...patch } = input;

  const { data, error } = await supabase
    .from('verification_config')
    .upsert(
      {
        ...existing,
        ...patch,
        guild_id: guildId,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'guild_id' },
    )
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to save verification config: ${error?.message}`);
  return data as VerificationConfigRow;
}