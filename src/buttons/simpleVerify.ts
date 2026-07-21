/**
 * buttons/simpleVerify.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The Simple Verification panel's single button. customId:
 * 'simple_verify_button' — no session/id suffix needed, this is a
 * permanent, mode-gated panel, same shape as the old verify_lobby_button.
 *
 * Re-checks the active mode server-side on every click — if an admin
 * switched away from Simple mode after this panel was deployed, clicking
 * a stale button should not silently grant a role under the wrong mode.
 */

import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import { verifySimple } from '../services/simpleVerificationService';
import { embeds } from '../ui';

const button: Button = {
  customId: 'simple_verify_button',

  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ ephemeral: true });

    const outcome = await verifySimple(interaction.member);

    if (outcome === 'already-verified') {
      await interaction.editReply({
        embeds: [
          embeds.info({ title: 'Already Verified', description: 'You\u2019re already verified!' }),
        ],
      });
      return;
    }

    if (outcome === 'wrong-mode' || outcome === 'not-configured') {
      await interaction.editReply({
        embeds: [
          embeds.error({
            title: 'Verification Unavailable',
            description: 'Verification settings have changed. Please contact a staff member.',
          }),
        ],
      });
      return;
    }

    if (outcome === 'failed') {
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

export default button;