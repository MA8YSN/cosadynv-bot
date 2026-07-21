/**
 * services/simpleVerificationService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Mode 1 (Simple Verification) business logic. One action: grant the
 * configured Verified role. No lobby, no code, no captcha.
 *
 * Reads verified_role_id from verification_config (via
 * verificationModeService.ts) rather than a static config file — this
 * value is admin-set at runtime (/verification set-role, or auto-created
 * by /verification setup in Phase 5).
 */

import { GuildMember } from 'discord.js';
import { getVerificationConfig } from './verificationModeService';
import { logger } from '../utils/logger';

export type SimpleVerifyOutcome =
  | 'already-verified'
  | 'verified'
  | 'not-configured'
  | 'wrong-mode'
  | 'failed';

export async function verifySimple(member: GuildMember): Promise<SimpleVerifyOutcome> {
  const config = await getVerificationConfig(member.guild.id);

  if (!config || config.active_mode !== 'simple') return 'wrong-mode';
  if (!config.verified_role_id) return 'not-configured';

  if (member.roles.cache.has(config.verified_role_id)) return 'already-verified';

  try {
    await member.roles.add(config.verified_role_id);
    return 'verified';
  } catch (error) {
    logger.error(error as Error, 'SimpleVerificationService');
    return 'failed';
  }
}