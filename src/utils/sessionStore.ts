/**
 * utils/sessionStore.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Generic, in-memory, TTL-based session store. Originally built directly
 * inside embedStudioService.ts for Embed Studio's drafts, then extracted
 * here once it became clear this is infrastructure, not an Embed Studio
 * concept — every future multi-step interaction (giveaway setup,
 * verification wizard, WL flow, citizen creation, Panel Manager) will
 * need exactly this: "give me a short-lived object keyed by a generated
 * ID, auto-expiring if abandoned."
 *
 * NOT persisted to Supabase — sessions here are meant to live only as
 * long as a single Discord interaction flow (minutes). If a future
 * feature needs a draft to survive a bot restart, that's a
 * database-backed feature, not this.
 */

import { randomUUID } from 'node:crypto';

export interface SessionStore<T extends { id: string }> {
  create: (data: Omit<T, 'id'>) => T;
  get: (id: string) => T | undefined;
  update: (id: string, patch: Partial<Omit<T, 'id'>>) => T | undefined;
  delete: (id: string) => void;
}

/**
 * Creates an isolated session store for one feature. Each call gets its
 * own Map + timers — stores for different features never collide, even
 * though they're built from this same factory.
 */
export function createSessionStore<T extends { id: string }>(ttlMs: number): SessionStore<T> {
  const sessions = new Map<string, T>();
  const expiryTimers = new Map<string, NodeJS.Timeout>();

  function scheduleExpiry(id: string): void {
    const existing = expiryTimers.get(id);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      sessions.delete(id);
      expiryTimers.delete(id);
    }, ttlMs);

    expiryTimers.set(id, timer);
  }

  return {
    create(data) {
      const session = { ...data, id: randomUUID() } as T;
      sessions.set(session.id, session);
      scheduleExpiry(session.id);
      return session;
    },

    get(id) {
      return sessions.get(id);
    },

    update(id, patch) {
      const session = sessions.get(id);
      if (!session) return undefined;

      Object.assign(session, patch);
      scheduleExpiry(id);
      return session;
    },

    delete(id) {
      sessions.delete(id);
      const timer = expiryTimers.get(id);
      if (timer) clearTimeout(timer);
      expiryTimers.delete(id);
    },
  };
}