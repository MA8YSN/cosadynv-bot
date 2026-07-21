/**
 * services/captchaVerificationService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Mode 2 (Captcha Verification) business logic. Orchestrates the active
 * captcha provider (config/captchaProviders.config.ts) and the Verified
 * role grant — never talks to a specific provider by name, only through
 * the CaptchaProvider interface, so swapping providers later doesn't
 * touch this file.
 */

import { GuildMember } from 'discord.js';
import { getVerificationConfig } from './verificationModeService';
import { CAPTCHA_PROVIDERS, CaptchaChallenge, getCaptchaProviderByKey } from '../config/captchaProviders.config';
import { logger } from '../utils/logger';

interface CaptchaModeConfig {
  captchaProvider?: string;
}

function resolveProviderKey(config: CaptchaModeConfig): string | null {
  return config.captchaProvider ?? CAPTCHA_PROVIDERS[0]?.key ?? null;
}

export type CaptchaStartOutcome =
  | { status: 'ready'; challenge: CaptchaChallenge }
  | { status: 'already-verified' }
  | { status: 'wrong-mode' }
  | { status: 'not-configured' };

export async function startCaptchaChallenge(member: GuildMember): Promise<CaptchaStartOutcome> {
  const config = await getVerificationConfig(member.guild.id);
  if (!config || config.active_mode !== 'captcha') return { status: 'wrong-mode' };
  if (!config.verified_role_id) return { status: 'not-configured' };

  if (member.roles.cache.has(config.verified_role_id)) return { status: 'already-verified' };

  const provider = getCaptchaProviderByKey(resolveProviderKey(config.mode_config as CaptchaModeConfig));
  if (!provider) return { status: 'not-configured' };

  const challenge = await provider.generateChallenge();
  return { status: 'ready', challenge };
}

export type CaptchaSubmitOutcome =
  | 'verified'
  | 'incorrect'
  | 'already-verified'
  | 'wrong-mode'
  | 'not-configured'
  | 'failed';

export async function submitCaptchaResponse(
  member: GuildMember,
  challengeId: string,
  response: string,
): Promise<CaptchaSubmitOutcome> {
  const config = await getVerificationConfig(member.guild.id);
  if (!config || config.active_mode !== 'captcha') return 'wrong-mode';
  if (!config.verified_role_id) return 'not-configured';

  if (member.roles.cache.has(config.verified_role_id)) return 'already-verified';

  const provider = getCaptchaProviderByKey(resolveProviderKey(config.mode_config as CaptchaModeConfig));
  if (!provider) return 'not-configured';

  const isCorrect = await provider.verifyResponse(challengeId, response);
  if (!isCorrect) return 'incorrect';

  try {
    await member.roles.add(config.verified_role_id);
    return 'verified';
  } catch (error) {
    logger.error(error as Error, 'CaptchaVerificationService');
    return 'failed';
  }
}