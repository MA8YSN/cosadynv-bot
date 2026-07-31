import { embeds, buttons, row } from '../ui';
import { ASSETS } from '../config/assets';

export function buildCaptchaVerificationPanelEmbed(guildName: string) {
  return embeds.banner({
    title: 'Verification',
    icon: 'shield',
    image: ASSETS.banners.verification || undefined,
    description: `Welcome to **${guildName}**.\n\nClick **Verify** below, complete a quick check, and you\u2019re in.`,
  });
}

export function buildCaptchaVerificationPanelPayload(guildName: string) {
  const actionRow = row(
    buttons.success({
      customId: 'captcha_verify_button',
      label: 'Verify',
      icon: 'unlock',
    }),
  );

  return {
    embeds: [buildCaptchaVerificationPanelEmbed(guildName)],
    components: [actionRow],
  };
}