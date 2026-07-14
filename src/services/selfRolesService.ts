/**
 * services/selfRolesService.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Business logic for Self Roles: given a member's new selection for a
 * category, adds newly-checked roles and removes newly-unchecked ones.
 *
 * Deliberately takes a plain `GuildMember` + string array rather than a
 * Discord `interaction` — same principle as embedStudioService.ts. Keeps
 * this reusable from anywhere in the future (a dashboard, a slash command,
 * whatever) without rewriting the logic.
 *
 * Only ever touches roleIds that belong to the given category's options —
 * this is what guarantees it never modifies unrelated server roles.
 */

import { GuildMember } from 'discord.js';
import { SelfRoleCategory } from '../config/selfRoles.config';
import { logger } from '../utils/logger';

export interface SyncResult {
  added: string[];
  removed: string[];
}

export async function syncMemberSelfRoles(
  member: GuildMember,
  category: SelfRoleCategory,
  selectedKeys: string[],
): Promise<SyncResult> {
  const selected = new Set(selectedKeys);
  const added: string[] = [];
  const removed: string[] = [];

  for (const option of category.options) {
    const hasRole = member.roles.cache.has(option.roleId);
    const wantsRole = selected.has(option.key);

    if (wantsRole && !hasRole) {
      try {
        await member.roles.add(option.roleId);
        added.push(option.label);
      } catch (error) {
        logger.error(error as Error, 'SelfRolesService');
      }
    } else if (!wantsRole && hasRole) {
      try {
        await member.roles.remove(option.roleId);
        removed.push(option.label);
      } catch (error) {
        logger.error(error as Error, 'SelfRolesService');
      }
    }
  }

  return { added, removed };
}