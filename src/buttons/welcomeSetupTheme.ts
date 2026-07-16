/**
 * buttons/welcomeSetupTheme.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Theme picker buttons. customId format: `welcome_setup_theme:<sessionId>:<themeKey>`.
 */

import { ButtonInteraction } from 'discord.js';
import { Button } from '../types';
import { getDraftOrReply, updateDraft } from '../services/welcomeSetupService';
import { buildWelcomeSetupPayload } from '../embeds/welcomeSetupDashboard';
import { WELCOME_THEMES } from '../config/welcomeThemes.config';

const button: Button = {
  customId: 'welcome_setup_theme',

  async execute(interaction: ButtonInteraction): Promise<void> {
    const [, sessionId, themeKey] = interaction.customId.split(':');
    const draft = await getDraftOrReply(interaction, sessionId);
    if (!draft) return;

    const theme = WELCOME_THEMES.find((t) => t.key === themeKey);
    if (!theme) return;

    const updated = updateDraft(sessionId, { theme: theme.key })!;
    await interaction.update(buildWelcomeSetupPayload(updated));
  },
};

export default button;