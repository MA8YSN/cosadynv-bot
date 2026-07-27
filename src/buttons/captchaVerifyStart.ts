import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import { startCaptchaChallenge } from '../services/captchaVerificationService';
import { createModal } from '../ui';
import {
  buildAlreadyVerifiedEmbed,
  buildVerificationUnavailableEmbed,
} from '../embeds/verificationStatusEmbeds';

const button: Button = {
  customId: 'captcha_verify_button',

  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.inCachedGuild()) return;

    const outcome = await startCaptchaChallenge(interaction.member);

    if (outcome.status === 'already-verified') {
      await interaction.reply({ embeds: [buildAlreadyVerifiedEmbed()], ephemeral: true });
      return;
    }

    if (outcome.status === 'wrong-mode' || outcome.status === 'not-configured') {
      await interaction.reply({ embeds: [buildVerificationUnavailableEmbed()], ephemeral: true });
      return;
    }

    const modal = createModal({
      customId: `captcha_verify_modal:${outcome.challenge.challengeId}`,
      title: 'Verification Challenge',
      fields: [
        {
          customId: 'answer',
          label: outcome.challenge.prompt,
          required: true,
          maxLength: 50,
        },
      ],
    });

    await interaction.showModal(modal);
  },
};

export default button;