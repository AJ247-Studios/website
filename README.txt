================================================================================
COMPLETE CONFIGURATION AUDIT
Project: AJ247 Studios Website
Date: December 11, 2025
================================================================================


================================================================================
FILE: middleware.ts
================================================================================

```typescript
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Adapter to let Supabase read/write cookies in middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
  // Use SERVICE_ROLE_KEY for bypassing RLS to fetch role
  if (pathname.startsWith("/admin")) {
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

    const { data: profile, error: profileError } = await adminSupabase
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
```


================================================================================
FILE: app/layout.tsx
================================================================================

```tsx
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

  const { data: { session } } = await supabase.auth.getSession();
  
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
```


================================================================================
FILE: components/Header.tsx
================================================================================

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientBrowser } from "@/utils/supabase-browser";
import type { Session } from "@supabase/supabase-js";

const supabase = createClientBrowser();

interface HeaderProps {
  initialSession?: Session | null;
  initialRole?: string | null;
}

export default function Header({ initialSession = null, initialRole = null }: HeaderProps) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [role, setRole] = useState<string | null>(initialRole);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!mounted) return;
      setSession(sess);
      if (sess) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", sess.user.id)
          .single()
          .then(({ data: profile }) => setRole(profile?.role || null));
      } else {
        setRole(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Prevent flash by rendering nothing until loading is complete
  if (loading) return null;

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          AJ247 Studios
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-400">
            Home
          </Link>
          <Link href="/portfolio" className="hover:text-gray-600 dark:hover:text-gray-400">
            Portfolio
          </Link>
          {role === "admin" && (
            <Link href="/admin" className="hover:text-gray-600 dark:hover:text-gray-400">
              Admin
            </Link>
          )}

          {/* Auth Links */}
          <div className="flex gap-4 ml-4 pl-4 border-l border-gray-300 dark:border-gray-700">
            {!loading && !session ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="px-4 py-2 text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Profile
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
```


================================================================================
FILE: lib/supabaseClient.ts
================================================================================

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Media {
  id: string;
  filename: string;
  url: string;
  title?: string;
  description?: string;
  youtube_id?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface FileRecord {
  id: string;
  user_id: string | null;
  filename: string;
  mime_type: string;
  size: number;
  url: string;
  bucket: string;
  created_at: string;
  updated_at: string;
}
```


================================================================================
FILE: lib/supabase-admin.ts
================================================================================

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```


================================================================================
FILE: utils/supabase-server.ts
================================================================================

```typescript
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
      },
    }
  );
}
```


================================================================================
FILE: utils/supabase-browser.ts
================================================================================

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClientBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```


================================================================================
FILE: components/SupabaseProvider.tsx
================================================================================

```tsx
"use client";

import { createClientBrowser } from "@/utils/supabase-browser";
import { createContext, useContext, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseContext = {
  supabase: SupabaseClient;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase] = useState(() => createClientBrowser());

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return context;
};
```


================================================================================
FILE: next.config.ts
================================================================================

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
```


================================================================================
FILE: package.json
================================================================================

```json
{
  "name": "aj247-studios-website",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/AJ247-Studios/website.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/AJ247-Studios/website/issues"
  },
  "homepage": "https://github.com/AJ247-Studios/website#readme",
  "dependencies": {
    "@aws-sdk/client-s3": "^3.948.0",
    "@supabase/auth-helpers-nextjs": "^0.15.0",
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.87.1",
    "@types/formidable": "^3.4.6",
    "@vercel/analytics": "^1.6.1",
    "@vercel/speed-insights": "^1.3.1",
    "formidable": "^3.5.4",
    "next": "^16.0.8",
    "openai": "^6.10.0",
    "react": "^19.2.1",
    "react-dom": "^19.2.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.17",
    "@types/node": "^24.10.2",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "autoprefixer": "^10.4.22",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.17",
    "typescript": "^5.9.3"
  }
}
```


================================================================================
FILE: .env.local (Variable Names & Values)
================================================================================

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=****REDACTED****
R2_ENDPOINT=https://****REDACTED****.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=****REDACTED****
R2_SECRET_ACCESS_KEY=****REDACTED****
R2_BUCKET=aj247-media
R2_PUBLIC_DOMAIN=https://****REDACTED****

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://****REDACTED****.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=****REDACTED****
SUPABASE_SERVICE_ROLE_KEY=****REDACTED****

# Database (if needed)
DATABASE_URL=****REDACTED****


================================================================================
FILE: supabase/migrations/create_files_table.sql
================================================================================

```sql
-- Create files table for storing R2 upload metadata
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  bucket TEXT DEFAULT 'aj247-media',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own files
CREATE POLICY "Users can view own files"
  ON files
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own files
CREATE POLICY "Users can insert own files"
  ON files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON files
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins can view all files (optional)
CREATE POLICY "Admins can view all files"
  ON files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_created_at ON files(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```


================================================================================
NOTES ON PROFILES TABLE
================================================================================

IMPORTANT: A dedicated "profiles" table schema was NOT found in your migrations.

Your code references profiles table with at least these columns:
  - id (UUID, likely references auth.users(id))
  - role (TEXT, stores user role like 'admin' or 'user')

The table must exist in Supabase for your code to work. You likely created it manually 
in Supabase or it needs to be created via SQL.

RECOMMENDED SCHEMA (to create if missing):

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger to create profile on signup (requires postgres function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```


================================================================================
MIDDLEWARE MATCHER
================================================================================

The middleware in your codebase protects these routes:

export const config = {
  matcher: [
    "/client/:path*",
    "/admin/:path*",
  ],
};

This means:
- /client/* routes require authentication
- /admin/* routes require authentication AND admin role
- Unauthenticated users are redirected to /login
- Non-admin users accessing /admin are redirected to /login


================================================================================
API AUTH ROUTES
================================================================================

No dedicated /api/auth/* routes found in your codebase.

Auth is handled by:
1. Supabase Auth (via @supabase/supabase-js client library)
2. Middleware.ts (for server-side session checks)
3. Header.tsx (for client-side auth state management)


================================================================================
KEY CONFIGURATION ISSUES TO REVIEW
================================================================================

1. MISSING PROFILES TABLE
   - Your code queries "profiles" table in middleware and Header.tsx
   - No CREATE TABLE statement found in migrations
   - ACTION: Create profiles table in Supabase manually or run the recommended SQL above

2. COOKIE ADAPTER
   - middleware.ts uses SERVICE_ROLE_KEY (should be on server only) ✓ CORRECT
   - app/layout.tsx uses ANON_KEY with cookie adapter ✓ CORRECT
   - Header.tsx is "use client" and uses createBrowserClient ✓ CORRECT
   - utils/supabase-browser.ts uses ANON_KEY ✓ CORRECT
   - utils/supabase-server.ts has read-only cookie adapter ✓ CORRECT

3. ENVIRONMENT VARIABLES
   - NEXT_PUBLIC_SUPABASE_URL ✓ Used correctly
   - NEXT_PUBLIC_SUPABASE_ANON_KEY ✓ Used correctly (public)
   - SUPABASE_SERVICE_ROLE_KEY ✓ Used only in server contexts (middleware, admin checks)

4. IMPORTS
   - All imports use @/path aliases ✓ CORRECT
   - @supabase/ssr used for server ✓ CORRECT
   - @supabase/supabase-js used for admin ✓ CORRECT
   - createBrowserClient from @supabase/ssr used for browser ✓ CORRECT

================================================================================
