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
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: Use getUser() instead of getSession() for server-side validation
  // getUser() validates the token with Supabase servers and refreshes if needed
  // This also triggers cookie updates when tokens are refreshed
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // Protect /client and /admin routes - require valid session
  if (pathname.startsWith("/client") || pathname.startsWith("/admin")) {
    if (!user) {
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
   * 1. We've already verified the user exists
   * 2. We're only reading the role for the authenticated user
   * 3. SERVICE_ROLE_KEY is server-side only and never exposed to client
   */
  if (pathname.startsWith("/admin") && user) {
    try {
      // Use maybeSingle() to handle missing profiles gracefully
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      // If profile doesn't exist, error occurred, or user is not admin, redirect
      if (profileError || !profile || profile.role !== "admin") {
        // Redirect non-admins to home page
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      // Log error for debugging but redirect to home
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Return the response with any cookie updates (important for session refresh)
  return response;
}

/**
 * Matcher configuration
 * 
 * Run middleware on ALL routes to ensure session cookies are refreshed.
 * Exclude static files, images, and API routes for performance.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
