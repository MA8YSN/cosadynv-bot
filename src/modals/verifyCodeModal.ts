/**
 * modals/verifyCodeModal.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Handles the invite-code submission from buttons/verifyCodeButton.ts.
 * Validation is entirely delegated to
 * services/verificationService.ts's validateInviteCode() — this file
 * never reads config/verification.config.ts directly, by design.
 */

import { ModalSubmitInteraction } from 'discord.js';
import { ModalHandler } from '../types';
import { validateInviteCode, grantVerifiedRole } from '../services/verificationService';
import { embeds, createEmbed, colors } from '../ui';

const modal: ModalHandler = {
  customId: 'verify_code_modal',

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    if (!interaction.inCachedGuild()) return;

    const code = interaction.fields.getTextInputValue('code');

    await interaction.deferReply({ ephemeral: true });

    const isValid = await validateInviteCode(code);

    if (!isValid) {
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

    const outcome = await grantVerifiedRole(interaction.member);

    if (outcome === 'already-had') {
      await interaction.editReply({
        embeds: [
          embeds.info({
            title: 'Already Verified',
            description: 'You\u2019re already verified!',
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

    await interaction.editReply({
      embeds: [
        // Using createEmbed() directly rather than embeds.success() here —
        // that preset always force-prefixes the title with icons.success
        // (✅), and this specific message wants 🎉 instead. Deliberate,
        // documented exception, same pattern as embeds/draftEmbedRenderer.ts.
        createEmbed({
          title: '🎉 Verification Complete',
          description: [
            'Welcome to Cosadynv.',
            '',
            'You now have access to the full community.',
            'Enjoy your stay! 🚀',
          ].join('\n'),
          color: colors.success,
        }),
      ],
    });
  },
};

export default modal;