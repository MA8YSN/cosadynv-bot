import { ModalSubmitInteraction } from 'discord.js';
import { ModalHandler } from '../types';
import { submitCaptchaResponse } from '../services/captchaVerificationService';
import {
  buildVerificationSuccessEmbed,
  buildAlreadyVerifiedEmbed,
  buildVerificationUnavailableEmbed,
  buildIncorrectCaptchaEmbed,
} from '../embeds/verificationStatusEmbeds';

const modal: ModalHandler = {
  customId: 'captcha_verify_modal',

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    if (!interaction.inCachedGuild()) return;

    const [, challengeId] = interaction.customId.split(':');
    const response = interaction.fields.getTextInputValue('answer');

    await interaction.deferReply({ ephemeral: true });

    const outcome = await submitCaptchaResponse(interaction.member, challengeId, response);

    if (outcome === 'incorrect') {
      await interaction.editReply({ embeds: [buildIncorrectCaptchaEmbed()] });
      return;
    }

    if (outcome === 'already-verified') {
      await interaction.editReply({ embeds: [buildAlreadyVerifiedEmbed()] });
      return;
    }

    if (outcome === 'wrong-mode' || outcome === 'not-configured' || outcome === 'failed') {
      await interaction.editReply({ embeds: [buildVerificationUnavailableEmbed()] });
      return;
    }

    await interaction.editReply({
      embeds: [buildVerificationSuccessEmbed(interaction.guild.name)],
    });
  },
};

export default modal;