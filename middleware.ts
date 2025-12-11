import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Adapter to let Supabase read/write cookies in middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          res.cookies.delete({ name, ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Temporary debug: confirm middleware sees the session
  console.log("Middleware session:", session ? { user: session.user.id } : null);

  const pathname = req.nextUrl.pathname;

  // Protect /client and /admin
  if (pathname.startsWith("/client") || pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Admin-only: enforce role check for /admin
  if (pathname.startsWith("/admin")) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session!.user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/client/:path*",
    "/admin/:path*",
  ],
};
