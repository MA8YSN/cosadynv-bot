/**
 * selectMenus/embedStudioChannel.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Handles the channel select menu in Embed Studio. customId format:
 * `embed_studio_channel:<sessionId>`.
 */

import { SelectMenuHandler } from '../types';
import { getSessionOrReply, updateSession } from '../services/embedStudioService';
import { buildStudioPayload } from '../embeds/embedStudioDashboard';

const selectMenu: SelectMenuHandler = {
  customId: 'embed_studio_channel',

  async execute(interaction): Promise<void> {
    if (!interaction.isChannelSelectMenu()) return;

    const [, sessionId] = interaction.customId.split(':');
    const draft = await getSessionOrReply(interaction, sessionId);
    if (!draft) return;

    const selectedChannelId = interaction.values[0];
    const updated = updateSession(sessionId, { channelId: selectedChannelId })!;

    await interaction.update(buildStudioPayload(updated));
  },
};

export default selectMenu;