/**
 * buttons/embedStudioColor.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Handles the 5 preset color buttons in Embed Studio. customId format:
 * `embed_studio_color:<sessionId>:<colorKey>`. Sets the draft's color and
 * re-renders the dashboard in place via interaction.update().
 */

import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import { getSessionOrReply, updateSession, STUDIO_COLORS } from '../services/embedStudioService';
import { buildStudioPayload } from '../embeds/embedStudioDashboard';

const button: Button = {
  customId: 'embed_studio_color',

  async execute(interaction: ButtonInteraction): Promise<void> {
    const [, sessionId, colorKey] = interaction.customId.split(':');
    const draft = await getSessionOrReply(interaction, sessionId);
    if (!draft) return;

    const colorOption = STUDIO_COLORS.find((c) => c.key === colorKey);
    if (!colorOption) return;

    const updated = updateSession(sessionId, { color: colorOption.value })!;
    await interaction.update(buildStudioPayload(updated));
  },
};

export default button;