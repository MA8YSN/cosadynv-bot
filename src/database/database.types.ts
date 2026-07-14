/**
 * database/database.types.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Placeholder for Supabase's auto-generated database types.
 *
 * Once your schema exists (members, citizen_ids, contributions, giveaways,
 * etc.), generate real types with the Supabase CLI:
 *
 *   npx supabase gen types typescript --project-id <your-project-id> > src/database/database.types.ts
 *
 * Then wire them into the client for full query autocompletion + type safety:
 *
 *   import { Database } from './database.types';
 *   createClient<Database>(url, key)
 *
 * Left as an empty scaffold for now since no tables exist yet — this file
 * is here so the intended workflow is documented in the codebase itself.
 */

export type Database = Record<string, unknown>;
