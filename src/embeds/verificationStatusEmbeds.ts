import { createEmbed, colors, embeds } from '../ui';

export function buildVerificationSuccessEmbed(guildName: string) {
  return createEmbed({
    title: '🎉 Verification Complete',
    description: [`Welcome to **${guildName}** — you now have full access.`, 'Enjoy your stay! 🚀'].join(
      '\n',
    ),
    color: colors.success,
  });
}

export function buildAlreadyVerifiedEmbed() {
  return embeds.info({
    title: 'Already Verified',
    description: 'You\u2019re already verified — welcome back!',
  });
}

export function buildVerificationUnavailableEmbed() {
  return embeds.error({
    title: 'Verification Unavailable',
    description: 'Verification settings have changed. Please contact a staff member.',
  });
}

export function buildVerificationFailedEmbed() {
  return embeds.error({
    title: 'Something Went Wrong',
    description: 'We couldn\u2019t complete that. Please contact a staff member for help.',
  });
}

export function buildIncorrectCaptchaEmbed() {
  return embeds.error({
    title: 'Incorrect',
    description: 'That wasn\u2019t right. Click Verify again to try a new challenge.',
  });
}

export function buildInvalidCodeEmbed() {
  return embeds.error({
    title: 'Invalid Code',
    description: 'That code isn\u2019t valid. Please double-check and try again.',
  });
}

export function buildAlreadyInLobbyEmbed() {
  return embeds.info({
    title: 'Already in the Waiting Area',
    description: 'You\u2019ve already joined the waiting area.',
  });
}

export function buildJoinedLobbyEmbed() {
  return embeds.success({
    title: 'You\u2019re in the Lobby',
    description: [
      'While you wait, you now have access to:',
      '',
      '**Lobby Chat**',
      '**Lobby Giveaways**',
      '**Pre-Entry** — enter a code here anytime to unlock full access',
    ].join('\n'),
  });
}