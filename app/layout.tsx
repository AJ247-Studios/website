import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { SupabaseProvider } from "@/components/SupabaseProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata: Metadata = {
  title: "AJ247 Studios",
  description: "Exceptional digital experiences through innovative design and cutting-edge technology",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  /**
   * CRITICAL: Use ANON_KEY to read session from cookies
   * 
   * The SERVICE_ROLE_KEY bypasses auth and doesn't correctly parse
   * session cookies set by the browser. We need ANON_KEY here to:
   * 1. Properly read the session from browser cookies
   * 2. Respect the auth flow and session tokens
   * 
   * For role fetching, we use supabaseAdmin (SERVICE_ROLE_KEY) separately
   * to bypass RLS and get the user's role from the profiles table.
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        // Note: Server Components can't set cookies, but that's okay
        // The middleware handles session refresh and cookie updates
      },
    }
  );

  // Fetch session server-side using ANON_KEY (reads from cookies correctly)
  const { data: { session } } = await supabase.auth.getSession();

  // Fetch role server-side using SERVICE_ROLE_KEY (bypasses RLS)
  // This ensures we can always get the role even with strict RLS policies
  let role: string | null = null;
  if (session) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
    role = profile?.role || null;
  }

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {/* Pass both session and role to provider for client-side state management */}
        <SupabaseProvider initialSession={session} initialRole={role}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget />
        </SupabaseProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
