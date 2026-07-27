import { embeds, buttons, row } from '../ui';

export function buildLobbyVerificationPanelEmbed(guildName: string) {
  return embeds.brand({
    title: 'Verification',
    icon: 'shield',
    description: [
      `Welcome to **${guildName}**.`,
      '',
      '**Have an invite code?** Select **I Have a Code** and enter it.',
      '**No code yet?** Select **Join Waiting Area** — a team member will assist you shortly.',
    ].join('\n'),
  });
}

export function buildLobbyVerificationPanelPayload(guildName: string) {
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
    embeds: [buildLobbyVerificationPanelEmbed(guildName)],
    components: [actionRow],
  };
}