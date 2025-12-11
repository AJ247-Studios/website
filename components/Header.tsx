"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import type { Session } from "@supabase/supabase-js";

interface HeaderProps {
  initialRole?: string | null;
}

export default function Header({ initialRole = null }: HeaderProps) {
  const { session } = useSupabase();
  const [role, setRole] = useState<string | null>(initialRole);

  // Listen to session changes only
  useEffect(() => {
    if (!session) setRole(null);
  }, [session]);

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">AJ247 Studios</Link>
        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-400">Home</Link>
          <Link href="/portfolio" className="hover:text-gray-600 dark:hover:text-gray-400">Portfolio</Link>
          {role === "admin" && (
            <Link href="/admin" className="hover:text-gray-600 dark:hover:text-gray-400">Admin</Link>
          )}
          <div className="flex gap-4 ml-4 pl-4 border-l border-gray-300 dark:border-gray-700">
            {!session ? (
              <>
                <Link href="/login" className="px-4 py-2 text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Sign In</Link>
                <Link href="/signup" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Sign Up</Link>
              </>
            ) : (
              <Link href="/profile" className="px-4 py-2 text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Profile</Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
