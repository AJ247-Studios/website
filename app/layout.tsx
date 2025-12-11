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

export const metadata: Metadata = {
  title: "AJ247 Studios",
  description: "Exceptional digital experiences through innovative design and cutting-edge technology",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );

  // Fetch session server-side
  const { data: { session } } = await supabase.auth.getSession();

  // Fetch role server-side (bypass RLS using SERVICE_ROLE_KEY)
  let role: string | null = null;
  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
    role = profile?.role || null;
  }

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <SupabaseProvider initialSession={session}>
          <Header initialRole={role} />
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
