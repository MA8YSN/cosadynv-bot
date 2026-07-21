/**
 * config/captchaProviders.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The captcha abstraction Mode 2 requires: buttons/modals call
 * generateChallenge()/verifyResponse() against whichever provider is
 * registered, never against a specific implementation directly. Swapping
 * providers later means adding an entry to CAPTCHA_PROVIDERS and
 * changing which key is active in verification_config.mode_config — not
 * touching the button/modal code that uses it.
 *
 * V1's concrete provider: a simple arithmetic challenge, no external
 * API/dependency. Reuses utils/sessionStore.ts — the same generic TTL
 * store built for Embed Studio's wizard — to hold the expected answer
 * between generateChallenge() and verifyResponse(), exactly the kind of
 * second consumer that store was built to support.
 */

import { createSessionStore } from '../utils/sessionStore';

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

interface MathChallengeSession {
  id: string;
  answer: number;
}

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const mathChallengeStore = createSessionStore<MathChallengeSession>(CHALLENGE_TTL_MS);

export const MATH_CAPTCHA_PROVIDER: CaptchaProvider = {
  key: 'math',
  label: 'Math Captcha',

  async generateChallenge() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const session = mathChallengeStore.create({ answer: a + b });

    return {
      challengeId: session.id,
      prompt: `What is ${a} + ${b}?`,
    };
  },

  async verifyResponse(challengeId, userResponse) {
    const session = mathChallengeStore.get(challengeId);
    if (!session) return false;

    const isCorrect = Number(userResponse.trim()) === session.answer;
    mathChallengeStore.delete(challengeId); // One attempt per challenge — wrong answer requires a fresh one.
    return isCorrect;
  },
};

export const CAPTCHA_PROVIDERS: CaptchaProvider[] = [MATH_CAPTCHA_PROVIDER];

export function getCaptchaProviderByKey(key: string | null): CaptchaProvider | undefined {
  if (!key) return undefined;
  return CAPTCHA_PROVIDERS.find((provider) => provider.key === key);
}