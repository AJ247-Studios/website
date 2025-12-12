import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth Callback Route
 * 
 * Handles:
 * - OAuth provider callbacks (Google)
 * - Magic link sign-ins
 * - Email verification confirmations
 * - Password reset flows
 */

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const redirect = requestUrl.searchParams.get("redirect") || "/profile";
  const type = requestUrl.searchParams.get("type");

  // Handle OAuth/Magic Link errors
  if (error) {
    const errorMsg = errorDescription || error;
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMsg)}`, requestUrl.origin)
    );
  }

  // Exchange the code for a session
  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Route handlers can set cookies
            }
          },
          remove(name: string, options: Record<string, unknown>) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch {
              // Route handlers can remove cookies
            }
          },
        },
      }
    );

    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Auth callback error:", exchangeError);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        );
      }

      // Handle password recovery flow
      if (type === "recovery") {
        // Redirect to password reset page
        return NextResponse.redirect(
          new URL("/profile?reset=true", requestUrl.origin)
        );
      }

      // Successful authentication - redirect to intended destination
      return NextResponse.redirect(new URL(redirect, requestUrl.origin));
    } catch (err) {
      console.error("Auth callback exception:", err);
      return NextResponse.redirect(
        new URL("/login?error=Authentication%20failed", requestUrl.origin)
      );
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
