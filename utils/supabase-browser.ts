import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Singleton Supabase client for browser/client-side operations
 * 
 * IMPORTANT: We use a singleton to prevent "Multiple GoTrueClient instances" warning.
 * Multiple instances can cause undefined behavior when accessing the same storage key.
 */
let supabaseInstance: SupabaseClient | null = null;

export function createClientBrowser(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseInstance;
}
