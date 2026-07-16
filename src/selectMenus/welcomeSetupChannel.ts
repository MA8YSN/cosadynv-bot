/**
 * selectMenus/welcomeSetupChannel.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Channel select for /welcome setup. customId format: `welcome_setup_channel:<sessionId>`.
 */

import { SelectMenuHandler } from '../types';
import { getDraftOrReply, updateDraft } from '../services/welcomeSetupService';
import { buildWelcomeSetupPayload } from '../embeds/welcomeSetupDashboard';

const selectMenu: SelectMenuHandler = {
  customId: 'welcome_setup_channel',

  async execute(interaction): Promise<void> {
    if (!interaction.isChannelSelectMenu()) return;

    const [, sessionId] = interaction.customId.split(':');
    const draft = await getDraftOrReply(interaction, sessionId);
    if (!draft) return;

    const selectedChannelId = interaction.values[0];
    const updated = updateDraft(sessionId, { channelId: selectedChannelId })!;

    await interaction.update(buildWelcomeSetupPayload(updated));
  },
};

export default selectMenu;