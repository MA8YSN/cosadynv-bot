/**
 * services/verificationService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Verification business logic. Two responsibilities, deliberately kept
 * separate:
 *
 *   1. Role granting (grantVerifiedRole / grantLobbyRole) — additive
 *      only, never removes a role. Both take a plain GuildMember, not an
 *      interaction, so they're reusable from anywhere later (a future
 *      welcome flow, a re-verify admin command, etc.).
 *
 *   2. Code validation (validateInviteCode) — abstracted behind this one
 *      function on purpose. V1 checks a static config list; nothing
 *      calling this function needs to know that. Swapping to a Supabase
 *      lookup (with single-use tracking, etc.) later means changing the
 *      body of this function only — the modal, buttons, and command
 *      never touch config/verification.config.ts directly for code data.
 *
 * validateInviteCode is async even though V1's implementation is
 * synchronous — so the signature is already correct for a future DB
 * query, and no call site will need to change when that happens.
 */

import { GuildMember } from 'discord.js';
import { VERIFICATION_CONFIG } from '../config/verification.config';
import { logger } from '../utils/logger';

export type GrantOutcome = 'already-had' | 'granted' | 'failed';

async function grantRole(member: GuildMember, roleId: string): Promise<GrantOutcome> {
  if (member.roles.cache.has(roleId)) return 'already-had';

  try {
    await member.roles.add(roleId);
    return 'granted';
  } catch (error) {
    logger.error(error as Error, 'VerificationService');
    return 'failed';
  }
}

/** Grants the configured Verified role. Never removes any role. */
export function grantVerifiedRole(member: GuildMember): Promise<GrantOutcome> {
  return grantRole(member, VERIFICATION_CONFIG.verifiedRoleId);
}

/** Grants the configured Lobby role. Never removes any role. */
export function grantLobbyRole(member: GuildMember): Promise<GrantOutcome> {
  return grantRole(member, VERIFICATION_CONFIG.lobbyRoleId);
}

/**
 * The single abstraction point for "is this invite code valid". V1 checks
 * a static list in config/verification.config.ts, case-insensitively and
 * trimmed. This is the only function that needs to change when codes move
 * to a database (or gain single-use tracking) later.
 */
export async function validateInviteCode(code: string): Promise<boolean> {
  const normalized = code.trim().toLowerCase();
  return VERIFICATION_CONFIG.validCodes.some(
    (validCode) => validCode.trim().toLowerCase() === normalized,
  );
}