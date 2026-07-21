/**
 * embeds/captchaVerificationPanel.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The Captcha Verification panel — one embed, one button. The captcha
 * itself appears in a modal after the button is clicked, not here.
 */

import { embeds, buttons, row } from '../ui';

export function buildCaptchaVerificationPanelEmbed() {
  return embeds.brand({
    title: '🔐 Verification',
    description: 'Welcome! Click the button below, solve the quick challenge, and you\u2019re in.',
  });
}

export function buildCaptchaVerificationPanelPayload() {
  const actionRow = row(
    buttons.success({
      customId: 'captcha_verify_button',
      label: 'Verify',
      icon: 'unlock',
    }),
  );

  return {
    embeds: [buildCaptchaVerificationPanelEmbed()],
    components: [actionRow],
  };
}