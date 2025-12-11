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
    icon: '/favicon.ico',
    // or: icon: '/favicon.png'
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  
  // Create Supabase client with ANON_KEY for reading session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Get session from cookies
  const { data: { session } } = await supabase.auth.getSession();
  
  // Fetch user role if session exists
  // NOTE: For admin role check, we use SERVICE_ROLE_KEY in a separate admin client
  // to bypass RLS, since users can only see their own profile with ANON_KEY
  let role: string | null = null;
  if (session) {
    try {
      // Create admin client to bypass RLS for role check
      const adminSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
          },
        }
      );

      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      
      role = profile?.role || null;
    } catch (error) {
      console.error("[Layout] Error fetching role:", error);
      role = null;
    }
  }

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <SupabaseProvider>
          <Header initialSession={session} initialRole={role} />
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
