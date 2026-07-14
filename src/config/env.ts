/**
 * config/env.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Loads and validates environment variables ONCE, at startup.
 *
 * Why validate with zod instead of just reading process.env directly?
 * Because a missing/misspelled env var should crash the bot immediately
 * with a clear message ("DISCORD_TOKEN is required") — not three minutes
 * later with a cryptic "Cannot read property 'login' of undefined" buried
 * in a Discord API error. Fail fast, fail loud, fail clear.
 *
 * Every other file in the project imports `env` from here rather than
 * touching `process.env` directly, so there is exactly one source of truth.
 */

import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, 'DISCORD_TOKEN is required'),
  DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID is required'),
  // Optional: only needed while deploying commands to a single guild for
  // fast iteration during development. Omit in production for global commands.
  DISCORD_GUILD_ID: z.string().optional(),

  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid or missing environment variables:');
  for (const issue of parsed.error.issues) {
    // eslint-disable-next-line no-console
    console.error(`   • ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

/** Fully validated, fully typed environment config. Import this, not process.env. */
export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
