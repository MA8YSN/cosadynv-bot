/**
 * buttons/embedStudioRestart.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Handles "Publish Another" on the post-publish success screen. Starts a
 * brand new Embed Studio session and re-renders the dashboard in place,
 * so an admin publishing several embeds in a row never has to re-run
 * `/embed`.
 *
 * No sessionId in this button's customId — unlike the other Embed Studio
 * buttons, there's no existing draft to look up; it always creates one.
 */

import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import { createSession } from '../services/embedStudioService';
import { buildStudioPayload } from '../embeds/embedStudioDashboard';

const button: Button = {
  customId: 'embed_studio_restart',

  async execute(interaction: ButtonInteraction): Promise<void> {
    const draft = createSession(interaction.user.id);
    await interaction.update(buildStudioPayload(draft));
  },
};

export default button;