/**
 * services/lobbyVerificationService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Mode 3 (Code Verification + Lobby) business logic. Two paths:
 *   - Valid code: grant Verified, remove Lobby if present. This is a
 *     deliberate V2 behavior change from the original verification
 *     system, which kept Lobby after verifying — the V2 spec explicitly
 *     calls for removal this time.
 *   - No code: grant Lobby only, additive, no removal.
 *
 * Codes live in verification_config.mode_config.validCodes (managed via
 * /verification code add|remove|list) rather than a static config file —
 * the V2 upgrade over the original system, which required editing a .ts
 * file to change codes.
 */

import { GuildMember } from 'discord.js';
import { getVerificationConfig, updateVerificationConfig } from './verificationModeService';
import { logger } from '../utils/logger';

interface LobbyModeConfig {
  validCodes?: string[];
}

export async function validateInviteCode(guildId: string, code: string): Promise<boolean> {
  const config = await getVerificationConfig(guildId);
  if (!config || config.active_mode !== 'code_lobby') return false;

  const modeConfig = (config.mode_config as LobbyModeConfig) ?? {};
  const validCodes = modeConfig.validCodes ?? [];
  const normalized = code.trim().toLowerCase();

  return validCodes.some((validCode) => validCode.trim().toLowerCase() === normalized);
}

export type CodeVerifyOutcome =
  | 'verified'
  | 'invalid-code'
  | 'already-verified'
  | 'wrong-mode'
  | 'not-configured'
  | 'failed';

export async function verifyWithCode(member: GuildMember, code: string): Promise<CodeVerifyOutcome> {
  const config = await getVerificationConfig(member.guild.id);
  if (!config || config.active_mode !== 'code_lobby') return 'wrong-mode';
  if (!config.verified_role_id) return 'not-configured';

  if (member.roles.cache.has(config.verified_role_id)) return 'already-verified';

  const isValid = await validateInviteCode(member.guild.id, code);
  if (!isValid) return 'invalid-code';

  try {
    await member.roles.add(config.verified_role_id);

    if (config.lobby_role_id && member.roles.cache.has(config.lobby_role_id)) {
      await member.roles.remove(config.lobby_role_id);
    }

    return 'verified';
  } catch (error) {
    logger.error(error as Error, 'LobbyVerificationService');
    return 'failed';
  }
}

export type LobbyOutcome =
  | 'joined'
  | 'already-in-lobby'
  | 'already-verified'
  | 'wrong-mode'
  | 'not-configured'
  | 'failed';

export async function joinLobby(member: GuildMember): Promise<LobbyOutcome> {
  const config = await getVerificationConfig(member.guild.id);
  if (!config || config.active_mode !== 'code_lobby') return 'wrong-mode';
  if (!config.lobby_role_id) return 'not-configured';

  if (config.verified_role_id && member.roles.cache.has(config.verified_role_id)) {
    return 'already-verified';
  }
  if (member.roles.cache.has(config.lobby_role_id)) return 'already-in-lobby';

  try {
    await member.roles.add(config.lobby_role_id);
    return 'joined';
  } catch (error) {
    logger.error(error as Error, 'LobbyVerificationService');
    return 'failed';
  }
}

/** Code management — used by /verification code add|remove|list. */
export async function addValidCode(guildId: string, code: string, updatedBy: string): Promise<string[]> {
  const config = await getVerificationConfig(guildId);
  const modeConfig = (config?.mode_config as LobbyModeConfig) ?? {};
  const validCodes = new Set((modeConfig.validCodes ?? []).map((c) => c.trim()));
  validCodes.add(code.trim());

  const updated = await updateVerificationConfig(
    guildId,
    { mode_config: { ...modeConfig, validCodes: [...validCodes] } },
    updatedBy,
  );

  return (updated.mode_config as LobbyModeConfig).validCodes ?? [];
}

export async function removeValidCode(
  guildId: string,
  code: string,
  updatedBy: string,
): Promise<string[]> {
  const config = await getVerificationConfig(guildId);
  const modeConfig = (config?.mode_config as LobbyModeConfig) ?? {};
  const normalized = code.trim().toLowerCase();
  const validCodes = (modeConfig.validCodes ?? []).filter(
    (c) => c.trim().toLowerCase() !== normalized,
  );

  const updated = await updateVerificationConfig(
    guildId,
    { mode_config: { ...modeConfig, validCodes } },
    updatedBy,
  );

  return (updated.mode_config as LobbyModeConfig).validCodes ?? [];
}

export async function listValidCodes(guildId: string): Promise<string[]> {
  const config = await getVerificationConfig(guildId);
  const modeConfig = (config?.mode_config as LobbyModeConfig) ?? {};
  return modeConfig.validCodes ?? [];
}