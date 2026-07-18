/**
 * config/captchaProviders.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The captcha abstraction Mode 2 requires: buttons/modals built in
 * Phase 3 call generateChallenge()/verifyResponse() against whichever
 * provider is registered, never against a specific implementation
 * directly. Swapping providers later means adding an entry to
 * CAPTCHA_PROVIDERS and changing which key is active in
 * verification_config.mode_config — not touching the button/modal code
 * that uses it.
 *
 * Empty in Phase 1 by design — this file exists now so the interface is
 * locked in before Phase 3 builds against it, but no concrete provider
 * is implemented until that phase actually needs one.
 */

export interface CaptchaChallenge {
  challengeId: string;
  /** What gets shown to the user — an image URL, a text puzzle, whatever the provider produces. */
  prompt: string;
}

export interface CaptchaProvider {
  key: string;
  label: string;
  generateChallenge: () => Promise<CaptchaChallenge>;
  verifyResponse: (challengeId: string, userResponse: string) => Promise<boolean>;
}

/** Populated in Phase 3. */
export const CAPTCHA_PROVIDERS: CaptchaProvider[] = [];

export function getCaptchaProviderByKey(key: string | null): CaptchaProvider | undefined {
  if (!key) return undefined;
  return CAPTCHA_PROVIDERS.find((provider) => provider.key === key);
}