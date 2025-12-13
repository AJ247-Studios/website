import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Singleton Supabase client for browser/client-side operations
 * 
 * IMPORTANT: We use a singleton to prevent "Multiple GoTrueClient instances" warning.
 * Multiple instances can cause undefined behavior when accessing the same storage key.
 * 
 * This is the ONLY place where a browser client should be created.
 * All other files should import from here or use the SupabaseProvider context.
 */
let supabaseInstance: SupabaseClient | null = null;

export function createClientBrowser(): SupabaseClient {
  // Fail fast if env vars are missing
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables"
    );
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[Supabase] Creating browser client singleton");
  }

  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return supabaseInstance;
}

/**
 * Debug helper - inspect current session from localStorage
 * Call this from browser console: (await import('@/utils/supabase-browser')).debugSession()
 */
export async function debugSession() {
  const client = createClientBrowser();
  try {
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.error("[debugSession] Error:", error);
      return null;
    }
    const session = data?.session;
    console.log("[debugSession] Current session:", {
      exists: !!session,
      userId: session?.user?.id ?? null,
      email: session?.user?.email ?? null,
      expiresAt: session?.expires_at
        ? new Date(session.expires_at * 1000).toISOString()
        : null,
      accessToken: session?.access_token ? `${session.access_token.slice(0, 20)}...` : null,
    });
    return session;
  } catch (err) {
    console.error("[debugSession] Exception:", err);
    return null;
  }
}

/**
 * Debug helper - list all Supabase-related localStorage keys
 * Call this from browser console: (await import('@/utils/supabase-browser')).debugStorage()
 */
export function debugStorage() {
  if (typeof window === "undefined") {
    console.log("[debugStorage] Not in browser environment");
    return {};
  }
  
  const keys: Record<string, string | null> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.toLowerCase().includes("supabase")) {
        const value = localStorage.getItem(key);
        // Truncate long values for readability
        keys[key] = value && value.length > 100 ? `${value.slice(0, 100)}...` : value;
      }
    }
  } catch (e) {
    console.error("[debugStorage] localStorage access error:", e);
  }
  
  console.log("[debugStorage] Supabase localStorage keys:", keys);
  return keys;
}
