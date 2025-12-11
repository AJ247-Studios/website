import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for browser/client-side operations (Client Components)
 * Uses ANON_KEY to respect RLS policies
 * Automatically handles cookie management for session persistence
 */
export function createClientBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
