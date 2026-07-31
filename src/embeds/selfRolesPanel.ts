import { embeds, row, selectMenus } from '../ui';
import { SelfRoleCategory } from '../config/selfRoles.config';
import { ASSETS } from '../config/assets';

const MAX_OPTION_DESCRIPTION = 100;

export function buildSelfRolesPanelEmbed(category: SelfRoleCategory) {
  return embeds.banner({
    title: category.title,
    image: ASSETS.banners.selfRoles || undefined,
    description: [category.description, '', category.instructions].join('\n'),
    fields: category.options.map((option) => ({
      name: `${option.emoji} ${option.label}`,
      value: option.description,
      inline: false,
    })),
  });
}

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