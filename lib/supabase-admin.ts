import { createClient } from "@supabase/supabase-js";

/**
 * ⚠️ ADMIN CLIENT - SERVER-SIDE ONLY ⚠️
 * 
 * This client uses SERVICE_ROLE_KEY which:
 * - Bypasses all Row Level Security (RLS) policies
 * - Has full database access
 * - Should NEVER be exposed to the client/browser
 * 
 * Use only in:
 * - Middleware (for admin role checks)
 * - Server Components (for admin operations)
 * - API Route Handlers (for privileged actions)
 * 
 * DO NOT import in Client Components!
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
