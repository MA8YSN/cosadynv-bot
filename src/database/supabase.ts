/**
 * database/supabase.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Single Supabase client instance, created once and imported everywhere
 * that needs database access. This is the ONLY file that should call
 * `createClient` — every service (verification, giveaways, citizen IDs,
 * etc.) imports `supabase` from here instead of creating its own client.
 *
 * Uses the service_role key because this code runs entirely server-side
 * (inside the bot process), so Row Level Security bypass is expected and
 * safe. Never ship this key to a browser/frontend context.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    // The bot doesn't need Supabase's own user-session auth — it authenticates
    // once via the service role key and stays that way for the process lifetime.
    persistSession: false,
    autoRefreshToken: false,
  },
});
