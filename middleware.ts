import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Middleware for auth-protected routes
 * 
 * Key principles:
 * 1. Use ANON_KEY to read session from cookies (SERVICE_ROLE_KEY doesn't parse cookies)
 * 2. Use SERVICE_ROLE_KEY (via supabaseAdmin) to check admin role (bypasses RLS)
 * 3. Handle cookie refresh for session token updates
 */
export async function middleware(req: NextRequest) {
  // Create a new NextResponse to modify - this allows us to update cookies
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  /**
   * CRITICAL: Use ANON_KEY to read session from cookies
   * 
   * The SERVICE_ROLE_KEY bypasses auth completely and doesn't read
   * session cookies properly. We MUST use ANON_KEY to:
   * 1. Parse session tokens from browser cookies
   * 2. Properly refresh expired access tokens
   * 3. Update cookies when tokens are refreshed
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          // Update both request and response cookies for consistency
          req.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          // Remove from both request and response
          req.cookies.delete({ name, ...options });
          response.cookies.delete({ name, ...options });
        },
      },
    }
  );

  // Get session - this will also refresh the session if the access token is expired
  // The refresh happens automatically and cookies are updated via the handlers above
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  // Log session errors for debugging (but don't block the request)
  if (sessionError) {
    console.error("[Middleware] Session error:", sessionError.message);
  }

  const pathname = req.nextUrl.pathname;

  // Protect /client and /admin routes - require valid session
  if (pathname.startsWith("/client") || pathname.startsWith("/admin")) {
    if (!session) {
      console.log("[Middleware] No session, redirecting to login from:", pathname);
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  /**
   * Admin-only route protection
   * 
   * Use SERVICE_ROLE_KEY (supabaseAdmin) to bypass RLS and fetch the user's role.
   * This is safe because:
   * 1. We've already verified the session exists
   * 2. We're only reading the role for the authenticated user
   * 3. SERVICE_ROLE_KEY is server-side only and never exposed to client
   */
  if (pathname.startsWith("/admin") && session) {
    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      // If profile doesn't exist, error occurred, or user is not admin, redirect
      if (profileError || !profile || profile.role !== "admin") {
        console.warn("[Middleware] Admin access denied:", {
          userId: session.user.id,
          email: session.user.email,
          error: profileError?.message,
          role: profile?.role || "no profile",
        });
        // Redirect non-admins to home page
        return NextResponse.redirect(new URL("/", req.url));
      }

      console.log("[Middleware] Admin access granted for:", session.user.email);
    } catch (error) {
      console.error("[Middleware] Error checking admin role:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Return the response with any cookie updates (important for session refresh)
  return response;
}

/**
 * Matcher configuration
 * 
 * Only run middleware on protected routes for performance.
 * Add more routes here as needed.
 */
export const config = {
  matcher: [
    "/client/:path*",
    "/admin/:path*",
  ],
};
