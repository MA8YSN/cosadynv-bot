/**
 * embeds/verificationPanel.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Builds the Verification panel — embed + two buttons — deployed by
 * /verification. Built entirely through src/ui (embeds.brand + buttons.*),
 * matching Embed Studio and Self Roles' visual language.
 */

import { embeds, buttons, row } from '../ui';

export function buildVerificationPanelEmbed() {
  return embeds.brand({
    title: '🔐 Verification',
    description: [
      'Welcome! To access the rest of the server, please verify below.',
      '',
      '🔑 **Have an invite code?** Click "I Have a Code" and enter it.',
      '🕐 **No code yet?** Click "Join Waiting Area" and a team member will assist you.',
    ].join('\n'),
  });
}

/** Full message payload — embed + the two verification buttons — ready to send to a channel. */
export function buildVerificationPanelPayload() {
  const actionRow = row(
    buttons.success({
      customId: 'verify_code_button',
      label: 'I Have a Code',
      icon: 'lock',
    }),
    buttons.secondary({
      customId: 'verify_lobby_button',
      label: 'Join Waiting Area',
      icon: 'loading',
    }),
  );

  return {
    embeds: [buildVerificationPanelEmbed()],
    components: [actionRow],
  };
}           