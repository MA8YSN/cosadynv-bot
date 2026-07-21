/**
 * modals/captchaVerifySubmit.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Handles the captcha answer submitted from buttons/captchaVerifyStart.ts.
 * customId format: `captcha_verify_modal:<challengeId>`.
 */

import { ModalSubmitInteraction } from 'discord.js';
import { ModalHandler } from '../types';
import { submitCaptchaResponse } from '../services/captchaVerificationService';
import { embeds } from '../ui';

const modal: ModalHandler = {
  customId: 'captcha_verify_modal',

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    if (!interaction.inCachedGuild()) return;

    const [, challengeId] = interaction.customId.split(':');
    const response = interaction.fields.getTextInputValue('answer');

    await interaction.deferReply({ ephemeral: true });

    const outcome = await submitCaptchaResponse(interaction.member, challengeId, response);

    if (outcome === 'incorrect') {
      await interaction.editReply({
        embeds: [
          embeds.error({
            title: 'Incorrect',
            description: 'That wasn\u2019t right. Click Verify again to try a new challenge.',
          }),
        ],
      });
      return;
    }

    if (outcome === 'already-verified') {
      await interaction.editReply({
        embeds: [
          embeds.info({ title: 'Already Verified', description: 'You\u2019re already verified!' }),
        ],
      });
      return;
    }

    if (outcome === 'wrong-mode' || outcome === 'not-configured' || outcome === 'failed') {
      await interaction.editReply({
        embeds: [
          embeds.error({
            title: 'Something Went Wrong',
            description: 'Please contact a staff member for help.',
          }),
        ],
      });
      return;
    }

    // outcome === 'verified'
    await interaction.editReply({
      embeds: [
        embeds.success({
          title: 'Verified!',
          description: 'Welcome to the server \u2014 you now have full access.',
        }),
      ],
    });
  },
};

export default modal;