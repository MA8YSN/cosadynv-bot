import { embeds, buttons, row } from '../ui';
import { ASSETS } from '../config/assets';

export function buildSimpleVerificationPanelEmbed(guildName: string) {
  return embeds.banner({
    title: 'Verification',
    icon: 'shield',
    image: ASSETS.banners.verification || undefined,
    description: `Welcome to **${guildName}**.\n\nClick **Verify** below to confirm you\u2019re human and unlock full access to the server.`,
  });
}

export function buildSimpleVerificationPanelPayload(guildName: string) {
  const actionRow = row(
    buttons.success({
      customId: 'simple_verify_button',
      label: 'Verify',
      icon: 'unlock',
    }),
  );

  return {
    embeds: [buildSimpleVerificationPanelEmbed(guildName)],
    components: [actionRow],
  };
}