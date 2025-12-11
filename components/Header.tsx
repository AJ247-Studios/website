"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export default function Header() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

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
          <Link href="/admin" className="hover:text-gray-600 dark:hover:text-gray-400">
            Admin
          </Link>

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
