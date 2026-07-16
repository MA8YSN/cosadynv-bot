/**
 * database/welcomeConfig.repository.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Pure data access for the Welcome System's per-guild configuration.
 * Only welcomeService.ts and welcomeSetupService.ts import this — never
 * commands/buttons/modals directly, same layering rule established for
 * giveaways.repository.ts.
 *
 * Unlike selfRoles.config.ts / verification.config.ts, welcome settings
 * are admin-editable at runtime through /welcome setup — there's nowhere
 * for a running process to durably persist that back into a source file,
 * and it wouldn't survive Railway's next rebuild anyway. Supabase is the
 * only correct place for this data, one row per guild.
 */

import { supabase } from './supabase';

export interface WelcomeConfigRow {
  guild_id: string;
  channel_id: string;
  theme: string;
  message_template: string;
  dm_enabled: boolean;
  updated_by: string;
  updated_at: string;
}

export interface UpsertWelcomeConfigInput {
  channelId: string;
  theme: string;
  messageTemplate: string;
  dmEnabled: boolean;
  updatedBy: string;
}

export async function getWelcomeConfig(guildId: string): Promise<WelcomeConfigRow | null> {
  const { data, error } = await supabase
    .from('welcome_config')
    .select()
    .eq('guild_id', guildId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch welcome config: ${error.message}`);
  return (data as WelcomeConfigRow) ?? null;
}

/** Creates or replaces the single config row for a guild (one row per guild_id). */
export async function upsertWelcomeConfig(
  guildId: string,
  input: UpsertWelcomeConfigInput,
): Promise<WelcomeConfigRow> {
  const { data, error } = await supabase
    .from('welcome_config')
    .upsert(
      {
        guild_id: guildId,
        channel_id: input.channelId,
        theme: input.theme,
        message_template: input.messageTemplate,
        dm_enabled: input.dmEnabled,
        updated_by: input.updatedBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'guild_id' },
    )
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to save welcome config: ${error?.message}`);
  return data as WelcomeConfigRow;
}