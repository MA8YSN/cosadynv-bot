/**
 * embeds/simpleVerificationPanel.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The Simple Verification panel — one embed, one button. Built through
 * src/ui, matching every other panel in the bot.
 */

import { embeds, buttons, row } from '../ui';

export function buildSimpleVerificationPanelEmbed() {
  return embeds.brand({
    title: '🔐 Verification',
    description: 'Welcome! Click the button below to verify and unlock the rest of the server.',
  });
}

export function buildSimpleVerificationPanelPayload() {
  const actionRow = row(
    buttons.success({
      customId: 'simple_verify_button',
      label: 'Verify',
      icon: 'unlock',
    }),
  );

  return {
    embeds: [buildSimpleVerificationPanelEmbed()],
    components: [actionRow],
  };
}