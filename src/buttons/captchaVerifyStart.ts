/**
 * buttons/captchaVerifyStart.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The Captcha panel's Verify button. Generates a challenge via the active
 * provider and opens a modal showing its prompt. customId of the modal
 * encodes the challengeId so the submit handler can verify against it
 * without needing to look anything else up.
 */

import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import { startCaptchaChallenge } from '../services/captchaVerificationService';
import { createModal, embeds } from '../ui';

const button: Button = {
  customId: 'captcha_verify_button',

  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.inCachedGuild()) return;

    const outcome = await startCaptchaChallenge(interaction.member);

    if (outcome.status === 'already-verified') {
      await interaction.reply({
        embeds: [
          embeds.info({ title: 'Already Verified', description: 'You\u2019re already verified!' }),
        ],
        ephemeral: true,
      });
      return;
    }

    if (outcome.status === 'wrong-mode' || outcome.status === 'not-configured') {
      await interaction.reply({
        embeds: [
          embeds.error({
            title: 'Verification Unavailable',
            description: 'Verification settings have changed. Please contact a staff member.',
          }),
        ],
        ephemeral: true,
      });
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