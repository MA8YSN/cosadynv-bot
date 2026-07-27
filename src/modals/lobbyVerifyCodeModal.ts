import { ModalSubmitInteraction } from 'discord.js';
import { ModalHandler } from '../types';
import { verifyWithCode } from '../services/lobbyVerificationService';
import {
  buildVerificationSuccessEmbed,
  buildAlreadyVerifiedEmbed,
  buildVerificationFailedEmbed,
  buildInvalidCodeEmbed,
} from '../embeds/verificationStatusEmbeds';

const modal: ModalHandler = {
  customId: 'lobby_verify_code_modal',

  async execute(interaction: ModalSubmitInteraction): Promise<void> {
    if (!interaction.inCachedGuild()) return;

    const code = interaction.fields.getTextInputValue('code');
    await interaction.deferReply({ ephemeral: true });

    const outcome = await verifyWithCode(interaction.member, code);

    if (outcome === 'invalid-code') {
      await interaction.editReply({ embeds: [buildInvalidCodeEmbed()] });
      return;
    }

    if (outcome === 'already-verified') {
      await interaction.editReply({ embeds: [buildAlreadyVerifiedEmbed()] });
      return;
    }

    if (outcome === 'wrong-mode' || outcome === 'not-configured' || outcome === 'failed') {
      await interaction.editReply({ embeds: [buildVerificationFailedEmbed()] });
      return;
    }

    await interaction.editReply({
      embeds: [buildVerificationSuccessEmbed(interaction.guild.name)],
    });
  },
};

export default modal;