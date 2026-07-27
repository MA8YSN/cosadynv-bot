import { embeds, buttons, row } from '../ui';

export function buildCaptchaVerificationPanelEmbed(guildName: string) {
  return embeds.brand({
    title: 'Verification',
    icon: 'shield',
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