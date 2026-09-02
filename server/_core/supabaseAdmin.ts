import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "./env.js";

let _admin: SupabaseClient | null = null;

/**
 * Service-role Supabase client for privileged server operations (currently just
 * minting signed Storage upload URLs). Lazily constructed like `getJwks()` in
 * `supabaseAuth.ts` so a missing key only fails the request that needs it.
 */
export function supabaseAdmin(): SupabaseClient {
  if (!_admin) {
    if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured for admin storage operations"
      );
    }
    _admin = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _admin;
}
