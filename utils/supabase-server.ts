import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for server-side operations (Server Components, Route Handlers)
 * Uses ANON_KEY to respect RLS policies and properly handle user sessions
 * Includes full cookie management for session refresh
 */
export async function createClientServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server Components cannot set cookies - that's okay
            // The session will be refreshed on next middleware run or client-side
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Server Components cannot remove cookies - that's okay
          }
        },
      },
    }
  );
}
