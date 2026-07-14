/**
 * selectMenus/selfRolesSelect.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Handles a member's selection on the Self Roles panel. customId format:
 * `self_roles_select:<categoryKey>` — the category is looked up generically
 * from config/selfRoles.config.ts, nothing here assumes "notifications"
 * specifically, so this same handler serves every future category too.
 *
 * Fully stateless — no session, no draft. The panel is permanent
 * infrastructure, not a wizard.
 */

import { SelectMenuHandler } from '../types';
import { SELF_ROLE_CATEGORIES } from '../config/selfRoles.config';
import { syncMemberSelfRoles } from '../services/selfRolesService';
import { embeds } from '../ui';
import { logger } from '../utils/logger';

const selectMenu: SelectMenuHandler = {
  customId: 'self_roles_select',

  async execute(interaction): Promise<void> {
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.inCachedGuild()) return;

    const [, categoryKey] = interaction.customId.split(':');
    const category = SELF_ROLE_CATEGORIES.find((c) => c.key === categoryKey);

    if (!category) {
      logger.warn(`Unknown Self Roles category: ${categoryKey}`, 'SelfRolesSelect');
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const { added, removed } = await syncMemberSelfRoles(
      interaction.member,
      category,
      interaction.values,
    );

    const summaryLines = [
      added.length ? `**Added:** ${added.join(', ')}` : null,
      removed.length ? `**Removed:** ${removed.join(', ')}` : null,
    ].filter((line): line is string => line !== null);

    await interaction.editReply({
      embeds: [
        embeds.success({
          title: 'Roles Updated',
          description: summaryLines.length ? summaryLines.join('\n') : 'No changes made.',
        }),
      ],
    });
  },
};

export default selectMenu;