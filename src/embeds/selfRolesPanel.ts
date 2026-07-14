/**
 * embeds/selfRolesPanel.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Builds the Self Roles panel — embed + select menu — for a given
 * category. Generic over SelfRoleCategory: nothing here is hardcoded to
 * "notifications" specifically, so a future category (added to
 * config/selfRoles.config.ts) renders through this exact same function
 * with zero changes.
 *
 * Built entirely through src/ui (embeds.brand + selectMenus.string), so
 * this panel shares the same visual language as Embed Studio and every
 * other feature in the bot.
 */

import { embeds, row, selectMenus } from '../ui';
import { SelfRoleCategory } from '../config/selfRoles.config';

const DIVIDER = '━━━━━━━━━━━━━━━━━━';

/** Discord caps select-menu option descriptions at 100 characters. */
const MAX_OPTION_DESCRIPTION = 100;

export function buildSelfRolesPanelEmbed(category: SelfRoleCategory) {
  const roleList = category.options
    .map((option) => `${option.emoji} **${option.label}**\n${option.description}`)
    .join('\n\n');

  return embeds.brand({
    title: category.title,
    description: [
      category.description,
      '',
      DIVIDER,
      '',
      roleList,
      '',
      DIVIDER,
      '',
      category.instructions,
    ].join('\n'),
  });
}

/** Full message payload — embed + the multi-select menu — ready to send to a channel. */
export function buildSelfRolesPanelPayload(category: SelfRoleCategory) {
  const select = selectMenus.string({
    customId: `self_roles_select:${category.key}`,
    placeholder: 'Choose your roles...',
    minValues: 0,
    maxValues: category.options.length,
    options: category.options.map((option) => ({
      label: option.label,
      value: option.key,
      description: option.description.slice(0, MAX_OPTION_DESCRIPTION),
      emoji: option.emoji,
    })),
  });

  return {
    embeds: [buildSelfRolesPanelEmbed(category)],
    components: [row(select)],
  };
}