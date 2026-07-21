/**
 * embeds/lobbyPreEntryPanel.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The Pre-Entry panel for members already in the Lobby. Reuses the SAME
 * customId ('lobby_verify_code_button') as the main panel's code button —
 * buttons/lobbyVerifyCodeButton.ts already handles it, so this needs no
 * separate button handler. Same reuse trick the original verification
 * system used between its Main and Pre-Entry panels.
 */

import { embeds, buttons, row } from '../ui';

export function buildLobbyPreEntryPanelEmbed() {
  return embeds.brand({
    title: '⚓ Pre-Entry',
    description: [
      'You\u2019re in the Lobby — welcome!',
      '',
      'Got an invite code? Enter it below to unlock full access to the community.',
    ].join('\n'),
  });
}

export function buildLobbyPreEntryPanelPayload() {
  const actionRow = row(
    buttons.success({
      customId: 'lobby_verify_code_button',
      label: 'Enter Code',
      icon: 'lock',
    }),
  );

  return {
    embeds: [buildLobbyPreEntryPanelEmbed()],
    components: [actionRow],
  };
}