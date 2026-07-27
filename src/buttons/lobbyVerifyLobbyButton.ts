import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import { joinLobby } from '../services/lobbyVerificationService';
import {
  buildAlreadyInLobbyEmbed,
  buildAlreadyVerifiedEmbed,
  buildVerificationFailedEmbed,
  buildJoinedLobbyEmbed,
} from '../embeds/verificationStatusEmbeds';

const button: Button = {
  customId: 'lobby_verify_lobby_button',

  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ ephemeral: true });

    const outcome = await joinLobby(interaction.member);

    if (outcome === 'already-in-lobby') {
      await interaction.editReply({ embeds: [buildAlreadyInLobbyEmbed()] });
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

    await interaction.editReply({ embeds: [buildJoinedLobbyEmbed()] });
  },
};

export default button;