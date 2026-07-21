/**
 * modals/lobbyVerifyCodeModal.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Handles the code submission from buttons/lobbyVerifyCodeButton.ts —
 * triggered from either the main panel or the pre-entry panel, since
 * both use the same button/customId chain.
 */

import { ModalSubmitInteraction } from 'discord.js';
import { ModalHandler } from '../types';
import { verifyWithCode } from '../services/lobbyVerificationService';
import { createEmbed, colors, embeds } from '../ui';

const modal: ModalHandler = {
  customId: 'lobby_verify_code_modal',

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    if (!interaction.inCachedGuild()) return;

    const code = interaction.fields.getTextInputValue('code');
    await interaction.deferReply({ ephemeral: true });

    const outcome = await verifyWithCode(interaction.member, code);

    if (outcome === 'invalid-code') {
      await interaction.editReply({
        embeds: [
          embeds.error({
            title: 'Invalid Code',
            description: 'That code isn\u2019t valid. Please double-check and try again.',
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

    // outcome === 'verified'. createEmbed used directly (not embeds.success)
    // since this celebratory message wants its own emoji, not the forced
    // checkmark icon — same documented exception used elsewhere in the bot.
    await interaction.editReply({
      embeds: [
        createEmbed({
          title: '🎉 Verification Complete',
          description: ['You now have access to the full community.', 'Enjoy your stay! 🚀'].join(
            '\n',
          ),
          color: colors.success,
        }),
      ],
    });
  },
};

export default modal;