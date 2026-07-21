import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

export const mintkeeperSupabase = createClient(
  env.MINTKEEPER_SUPABASE_URL,
  env.MINTKEEPER_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);