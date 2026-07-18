/**
 * services/verificationModeService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The only file Phase 2-5's commands/buttons/modals should import for
 * verification config access — never database/verificationConfig.repository.ts
 * directly, same layering rule as giveawayService.ts and
 * welcomeSetupService.ts before it.
 *
 * Owns: reading the active mode/config, switching modes, and patching
 * config fields (channels, roles, mode-specific settings). Does NOT own
 * any interaction behavior — that's each mode's own button/modal/service
 * files, built in their respective phases.
 */

import {
  getVerificationConfig as repoGetVerificationConfig,
  upsertVerificationConfig,
  VerificationConfigRow,
  VerificationMode,
} from '../database/verificationConfig.repository';
import { getVerificationModeByKey, VerificationModeDefinition } from '../config/verificationModes.config';

export function getVerificationConfig(guildId: string): Promise<VerificationConfigRow | null> {
  return repoGetVerificationConfig(guildId);
}

export async function getActiveModeDefinition(
  guildId: string,
): Promise<VerificationModeDefinition | undefined> {
  const config = await repoGetVerificationConfig(guildId);
  return getVerificationModeByKey(config?.active_mode ?? null);
}

/** Switches the active mode. Does not validate that required channels/roles are set — that's Phase 5's setup command's job. */
export function setVerificationMode(
  guildId: string,
  mode: VerificationMode,
  updatedBy: string,
): Promise<VerificationConfigRow> {
  return upsertVerificationConfig(guildId, { active_mode: mode, updatedBy });
}

/** Generic patch for any subset of config fields — used by future setup/config commands in later phases. */
export function updateVerificationConfig(
  guildId: string,
  patch: Partial<Omit<VerificationConfigRow, 'guild_id' | 'updated_at' | 'updated_by'>>,
  updatedBy: string,
): Promise<VerificationConfigRow> {
  return upsertVerificationConfig(guildId, { ...patch, updatedBy });
}