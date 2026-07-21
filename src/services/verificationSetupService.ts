/**
 * services/verificationSetupService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Automatic Server Setup: creates whatever roles/channels the active
 * mode needs (if missing), configures permission overwrites on THOSE
 * channels only, and saves the resulting IDs to verification_config.
 * Idempotent by design — checks saved IDs first, then matches by exact
 * name, and only creates as a last resort, so running this repeatedly
 * never duplicates anything.
 *
 * Scope boundary, worth being explicit about: this only touches the
 * roles/channels this system owns (Verified, Lobby, welcome, verify,
 * pre-entry, lobby-chat, lobby-giveaways). It does NOT modify permissions
 * on any other existing channel in the server — gating "the rest of the
 * server" behind the Verified role is left to the admin's own
 * category-level permission sync, since automating that risks touching
 * channels/permissions this system has no business touching.
 */

import { ChannelType, Guild, Role, TextChannel } from 'discord.js';
import { getVerificationConfig, updateVerificationConfig } from './verificationModeService';
import { getVerificationModeByKey, VerificationModeDefinition } from '../config/verificationModes.config';
import { logger } from '../utils/logger';

/** Finds an existing role by saved ID (if still valid) or by exact name, else creates it. */
async function ensureRole(guild: Guild, existingId: string | null, name: string): Promise<Role> {
  if (existingId) {
    const existing =
      guild.roles.cache.get(existingId) ?? (await guild.roles.fetch(existingId).catch(() => null));
    if (existing) return existing;
  }

  const byName = guild.roles.cache.find((role) => role.name === name);
  if (byName) return byName;

  return guild.roles.create({ name, mentionable: false });
}

/** Finds an existing text channel by saved ID (if still valid) or by exact name, else creates it. */
async function ensureChannel(guild: Guild, existingId: string | null, name: string): Promise<TextChannel> {
  if (existingId) {
    const existing = guild.channels.cache.get(existingId);
    if (existing instanceof TextChannel) return existing;
  }

  const byName = guild.channels.cache.find(
    (channel): channel is TextChannel => channel.type === ChannelType.GuildText && channel.name === name,
  );
  if (byName) return byName;

  return guild.channels.create({ name, type: ChannelType.GuildText });
}

export interface SetupResult {
  mode: VerificationModeDefinition;
  verifiedRole: Role;
  lobbyRole: Role | null;
  channels: Record<string, TextChannel>;
}

export type SetupOutcome =
  | { status: 'done'; result: SetupResult }
  | { status: 'no-mode' }
  | { status: 'failed' };

export async function runAutomaticSetup(guild: Guild, updatedBy: string): Promise<SetupOutcome> {
  const config = await getVerificationConfig(guild.id);
  const mode = getVerificationModeByKey(config?.active_mode ?? null);
  if (!config || !mode) return { status: 'no-mode' };

  try {
    const verifiedRole = await ensureRole(guild, config.verified_role_id, 'Verified');
    const lobbyRole = mode.requiresLobbyRole
      ? await ensureRole(guild, config.lobby_role_id, 'Lobby')
      : null;

    const welcomeChannel = await ensureChannel(guild, config.welcome_channel_id, 'welcome');
    const verifyChannel = await ensureChannel(guild, config.verify_channel_id, 'verify');

    const channels: Record<string, TextChannel> = { welcome: welcomeChannel, verify: verifyChannel };

    let preEntryChannel: TextChannel | null = null;
    let lobbyChatChannel: TextChannel | null = null;
    let lobbyGiveawaysChannel: TextChannel | null = null;

    if (mode.requiresLobbyRole) {
      preEntryChannel = await ensureChannel(guild, config.pre_entry_channel_id, 'pre-entry');
      lobbyChatChannel = await ensureChannel(guild, config.lobby_chat_channel_id, 'lobby-chat');
      lobbyGiveawaysChannel = await ensureChannel(
        guild,
        config.lobby_giveaways_channel_id,
        'lobby-giveaways',
      );

      channels['pre-entry'] = preEntryChannel;
      channels['lobby-chat'] = lobbyChatChannel;
      channels['lobby-giveaways'] = lobbyGiveawaysChannel;
    }

    // Onboarding channels: visible to everyone by default, hidden once
    // verified (and hidden from Lobby too, once that role exists — no
    // reason to keep seeing #welcome/#verify after joining the Lobby).
    for (const channel of [welcomeChannel, verifyChannel]) {
      await channel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: true });
      await channel.permissionOverwrites.edit(verifiedRole, { ViewChannel: false });
      if (lobbyRole) await channel.permissionOverwrites.edit(lobbyRole, { ViewChannel: false });
    }

    // Lobby-only channels: hidden by default, visible only to Lobby role.
    if (lobbyRole && preEntryChannel && lobbyChatChannel && lobbyGiveawaysChannel) {
      for (const channel of [preEntryChannel, lobbyChatChannel, lobbyGiveawaysChannel]) {
        await channel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: false });
        await channel.permissionOverwrites.edit(lobbyRole, { ViewChannel: true });
        await channel.permissionOverwrites.edit(verifiedRole, { ViewChannel: false });
      }
    }

    await updateVerificationConfig(
      guild.id,
      {
        verified_role_id: verifiedRole.id,
        lobby_role_id: lobbyRole?.id ?? null,
        welcome_channel_id: welcomeChannel.id,
        verify_channel_id: verifyChannel.id,
        pre_entry_channel_id: preEntryChannel?.id ?? null,
        lobby_chat_channel_id: lobbyChatChannel?.id ?? null,
        lobby_giveaways_channel_id: lobbyGiveawaysChannel?.id ?? null,
      },
      updatedBy,
    );

    return { status: 'done', result: { mode, verifiedRole, lobbyRole, channels } };
  } catch (error) {
    logger.error(error as Error, 'VerificationSetupService');
    return { status: 'failed' };
  }
}