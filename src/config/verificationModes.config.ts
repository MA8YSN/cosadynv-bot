/**
 * config/verificationModes.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Metadata for each verification mode — data, not behavior. This
 * describes what a mode IS (label, description, which channels/roles it
 * needs configured) for admin UI and setup validation. It does NOT drive
 * interaction behavior the way welcomeThemes.config.ts or
 * giveawayCollectionTypes.config.ts do for their features — the three
 * modes have genuinely different interaction shapes (one button vs.
 * button->captcha vs. two-buttons-with-a-modal), so each gets its own
 * button/modal/service files in Phases 2-4. This registry is the
 * "which mode is active and what does it need" layer, not the
 * "how does it behave" layer.
 */

import { VerificationMode } from '../database/verificationConfig.repository';

export interface VerificationModeDefinition {
  key: VerificationMode;
  label: string;
  description: string;
  requiresLobbyRole: boolean;
  /** Which verification_config channel columns must be set for this mode to function. */
  requiredChannelKeys: string[];
}

export const VERIFICATION_MODES: VerificationModeDefinition[] = [
  {
    key: 'simple',
    label: 'Simple Verification',
    description: 'One button. Click it, get verified, see the whole server.',
    requiresLobbyRole: false,
    requiredChannelKeys: ['welcome_channel_id', 'verify_channel_id'],
  },
  {
    key: 'captcha',
    label: 'Captcha Verification',
    description: 'Click the button, solve a captcha, get verified.',
    requiresLobbyRole: false,
    requiredChannelKeys: ['welcome_channel_id', 'verify_channel_id'],
  },
  {
    key: 'code_lobby',
    label: 'Code Verification + Lobby',
    description:
      'Members with a code verify immediately; members without one join a limited-access ' +
      'Lobby and can verify later from #pre-entry.',
    requiresLobbyRole: true,
    requiredChannelKeys: [
      'welcome_channel_id',
      'verify_channel_id',
      'pre_entry_channel_id',
      'lobby_chat_channel_id',
      'lobby_giveaways_channel_id',
    ],
  },
];

export function getVerificationModeByKey(
  key: VerificationMode | null,
): VerificationModeDefinition | undefined {
  if (!key) return undefined;
  return VERIFICATION_MODES.find((mode) => mode.key === key);
}