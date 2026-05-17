import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Singleton Supabase client for browser/client-side operations
 *
 * IMPORTANT: We use a singleton to prevent "Multiple GoTrueClient instances" warning.
 *
 * Cookie-based auth is REQUIRED for SSR session persistence.
 * Without cookie handlers, Supabase falls back to localStorage which does NOT
 * sync with the server. This causes "logged out on refresh" issues.
 */
let supabaseInstance: SupabaseClient | null = null;

export function createClientBrowser(): SupabaseClient {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          if (typeof document === "undefined") return [];
          return document.cookie.split("; ").map((c) => {
            const [name, ...rest] = c.split("=");
            return { name, value: rest.join("=") };
          });
        },
        setAll(cookiesToSet) {
          if (typeof document === "undefined") return;
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieString = `${name}=${value}`;
            if (options) {
              if (options.maxAge) cookieString += `; Max-Age=${options.maxAge}`;
              if (options.expires) cookieString += `; Expires=${options.expires.toUTCString()}`;
              if (options.path) cookieString += `; Path=${options.path}`;
              if (options.domain) cookieString += `; Domain=${options.domain}`;
              if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;
              if (options.secure) cookieString += `; Secure`;
              if (options.httpOnly) cookieString += `; HttpOnly`;
            }
            document.cookie = cookieString;
          });
        },
      },
    }
  );

  return supabaseInstance;
}

export async function debugSession() {
  const client = createClientBrowser();
  try {
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.error("[debugSession] Error:", error);
      return null;
    }
    const session = data?.session;
    console.log("[debugSession] Session:", {
      exists: !!session,
      userId: session?.user?.id ?? null,
      email: session?.user?.email ?? null,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    });
    return session;
  } catch (err) {
    console.error("[debugSession] Exception:", err);
    return null;
  }
}

export function debugStorage() {
  if (typeof window === "undefined") return {};
  const keys: Record<string, string | null> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.toLowerCase().includes("supabase")) {
        const value = localStorage.getItem(key);
        keys[key] = value && value.length > 100 ? `${value.slice(0, 100)}...` : value;
      }
    }
  } catch (e) {
    console.error("[debugStorage] Error:", e);
  }
  console.log("[debugStorage] Keys:", keys);
  return keys;
}
