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
  metadataBase: new URL("https://aj247studios.com"),
  title: {
    default: "AJ247 Studios | Premium Photo & Video Production in Kraków",
    template: "%s | AJ247 Studios",
  },
  description:
    "Professional photo and video production in Kraków. Sports events, concerts, weddings, portraits & corporate. 500+ projects delivered. Get a free quote today.",
  keywords: [
    "photo production Kraków",
    "video production Kraków",
    "event photographer Poland",
    "sports photography",
    "concert videography",
    "wedding photographer Kraków",
    "corporate video production",
    "professional photography services",
  ],
  authors: [{ name: "AJ247 Studios" }],
  creator: "AJ247 Studios",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aj247studios.com",
    siteName: "AJ247 Studios",
    title: "AJ247 Studios | Premium Photo & Video Production in Kraków",
    description:
      "Professional photo and video production in Kraków. Sports events, concerts, weddings, portraits & corporate. Get a free quote today.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AJ247 Studios - Premium Photo & Video Production",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AJ247 Studios | Premium Photo & Video Production",
    description:
      "Professional photo and video production in Kraków. Sports, concerts, weddings, portraits & corporate.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
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
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components can't set cookies - that's okay
            // The middleware handles session refresh and cookie updates
          }
        },
      },
    }
  );

  // Use getUser() for proper server-side validation
  // This validates the JWT with Supabase and refreshes if needed
  const { data: { user } } = await supabase.auth.getUser();

  // Also get the session for the client-side (contains access_token etc)
  const { data: { session } } = await supabase.auth.getSession();

  // Fetch role server-side using SERVICE_ROLE_KEY (bypasses RLS)
  // This ensures we can always get the role even with strict RLS policies
  // Use maybeSingle() to handle missing profiles gracefully
  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role || "user";
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
