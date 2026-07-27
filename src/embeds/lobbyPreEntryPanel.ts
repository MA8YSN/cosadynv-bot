import { embeds, buttons, row } from '../ui';

export function buildLobbyPreEntryPanelEmbed(guildName: string) {
  return embeds.brand({
    title: 'Pre-Entry',
    icon: 'unlock',
    description: `You\u2019re currently in the **Lobby** for **${guildName}**.\n\nGot an invite code? Select **Enter Code** below to unlock full access.`,
  });
}

export function buildLobbyPreEntryPanelPayload(guildName: string) {
  const actionRow = row(
    buttons.success({
      customId: 'lobby_verify_code_button',
      label: 'Enter Code',
      icon: 'lock',
    }),
  );

  return {
    embeds: [buildLobbyPreEntryPanelEmbed(guildName)],
    components: [actionRow],
  };
}