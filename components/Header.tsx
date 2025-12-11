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

  // Fetch role when session changes
  useEffect(() => {
    let mounted = true;

    const fetchRole = async (currentSession: Session) => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentSession.user.id)
          .single();
        
        if (mounted) {
          setRole(profile?.role || null);
        }
      } catch (error) {
        console.error("[Header] Error fetching role:", error);
        if (mounted) {
          setRole(null);
        }
      }
    };

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (!mounted) return;
      
      setSession(sess);
      
      if (sess) {
        await fetchRole(sess);
      } else {
        setRole(null);
      }
    });

    // If we have an initial session but no role, fetch it
    if (initialSession && !initialRole) {
      fetchRole(initialSession);
    }

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [initialSession, initialRole]);

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
