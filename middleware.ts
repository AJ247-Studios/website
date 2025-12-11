import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function middleware(req: NextRequest) {
  // Create a new NextResponse to modify
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // CRITICAL: Use ANON_KEY to read session from cookies
  // Service role key bypasses auth and doesn't parse session cookies correctly
  // This client MUST have set/remove capabilities to refresh sessions properly
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          // Update both request and response cookies
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

  // Get session - this will also refresh the session if needed
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Protect /client and /admin routes - require valid session
  if (pathname.startsWith("/client") || pathname.startsWith("/admin")) {
    if (!session) {
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Admin-only route protection
  // Use SERVICE_ROLE_KEY to bypass RLS and fetch role safely
  if (pathname.startsWith("/admin") && session) {
    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      // If profile doesn't exist, error occurred, or user is not admin, redirect
      if (profileError || !profile || profile.role !== "admin") {
        console.error("[Middleware] Admin access denied:", {
          userId: session.user.id,
          error: profileError?.message,
          role: profile?.role,
        });
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("[Middleware] Error checking admin role:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Return the response with any cookie updates
  return response;
}

export const config = {
  matcher: [
    "/client/:path*",
    "/admin/:path*",
  ],
};
