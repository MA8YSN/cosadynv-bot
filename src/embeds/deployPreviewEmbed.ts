/**
 * embeds/deployPreviewEmbed.ts
 * ─────────────────────────────────────────────────────────────────────────
 * The first real embed template in the bot. `/deploy` uses this to prove
 * the full pipeline works end to end: command -> embed template -> ui
 * design system -> Discord.
 *
 * Note the pattern: this file does NOT touch EmbedBuilder or colors/icons
 * directly — it composes the ui/ design system (`embeds.brand`) with its
 * own content. That's the pattern every future embed template should
 * follow (rules.ts, verificationPanel.ts, giveawayAnnouncement.ts, ...).
 *
 * This stays simple for now. In later versions, `/deploy` will grow
 * subcommands (e.g. `/deploy rules`, `/deploy verification`) and each will
 * get its own template file in this folder — this one remains the
 * generic/default template.
 */

import { EmbedBuilder, User } from 'discord.js';
import { embeds } from '../ui';

export function buildDeployPreviewEmbed(deployedBy: User): EmbedBuilder {
  return embeds.brand({
    title: 'Embed System Online',
    icon: 'bolt',
    description:
      'This embed was generated through the bot\u2019s design system (`src/ui`). ' +
      'Future versions of `/deploy` will let you publish rules, verification ' +
      'panels, giveaway announcements, and more — all through this same pipeline, ' +
      'all automatically sharing the same visual language.',
    footerText: `Deployed by ${deployedBy.username}`,
  });
}
