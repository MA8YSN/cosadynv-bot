import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import { verifySimple } from '../services/simpleVerificationService';
import {
  buildVerificationSuccessEmbed,
  buildAlreadyVerifiedEmbed,
  buildVerificationUnavailableEmbed,
  buildVerificationFailedEmbed,
} from '../embeds/verificationStatusEmbeds';

const button: Button = {
  customId: 'simple_verify_button',

  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ ephemeral: true });

    const outcome = await verifySimple(interaction.member);

    if (outcome === 'already-verified') {
      await interaction.editReply({ embeds: [buildAlreadyVerifiedEmbed()] });
      return;
    }

    if (outcome === 'wrong-mode' || outcome === 'not-configured') {
      await interaction.editReply({ embeds: [buildVerificationUnavailableEmbed()] });
      return;
    }

    if (outcome === 'failed') {
      await interaction.editReply({ embeds: [buildVerificationFailedEmbed()] });
      return;
    }

    await interaction.editReply({
      embeds: [buildVerificationSuccessEmbed(interaction.guild.name)],
    });
  },
};

export default button;