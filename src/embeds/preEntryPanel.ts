/**
 * embeds/preEntryPanel.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The Pre-Entry panel — deployed to the Lobby's pre-entry channel so
 * members who joined the waiting area can verify later without going
 * back to the original Verification panel.
 *
 * This is ONLY a different embed + a button pointing at the SAME
 * verification flow. The button below reuses customId 'verify_code_button'
 * — the exact same ID buttons/verifyCodeButton.ts already listens for —
 * so this panel needs no new button handler, no new modal, no service
 * changes. One verification system, two entry points.
 */

import { embeds, buttons, row } from '../ui';

export function buildPreEntryPanelEmbed() {
  return embeds.brand({
    title: '⚓ Pre-Entry',
    description: [
      'You\u2019re in the Lobby — welcome!',
      '',
      'Got an invite code? Enter it below to unlock full access to the community.',
    ].join('\n'),
  });
}

/** Full message payload — embed + the single "Enter Code" button — ready to send to a channel. */
export function buildPreEntryPanelPayload() {
  const actionRow = row(
    buttons.success({
      // Deliberately the SAME customId as the Main Verification panel's
      // code button — buttons/verifyCodeButton.ts already handles this,
      // so this panel is just a second entry point into the identical flow.
      customId: 'verify_code_button',
      label: 'Enter Code',
      icon: 'lock',
    }),
  );

  return {
    embeds: [buildPreEntryPanelEmbed()],
    components: [actionRow],
  };
}