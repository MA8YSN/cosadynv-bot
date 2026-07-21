/**
 * embeds/lobbyVerificationPanel.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The Mode 3 main panel — two buttons: "I Have a Code" / "Join Waiting
 * Area". Same content/shape as the original verification system's main
 * panel, rebuilt on the V2 architecture.
 */

import { embeds, buttons, row } from '../ui';

export function buildLobbyVerificationPanelEmbed() {
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

export function buildLobbyVerificationPanelPayload() {
  const actionRow = row(
    buttons.success({
      customId: 'lobby_verify_code_button',
      label: 'I Have a Code',
      icon: 'lock',
    }),
    buttons.secondary({
      customId: 'lobby_verify_lobby_button',
      label: 'Join Waiting Area',
      icon: 'loading',
    }),
  );

  return {
    embeds: [buildLobbyVerificationPanelEmbed()],
    components: [actionRow],
  };
}