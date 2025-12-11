"use client";

import Link from "next/link";
import { useSupabase } from "@/components/SupabaseProvider";

/**
 * Header Component
 * 
 * Gets session and role from SupabaseProvider context.
 * The provider handles all auth state changes and role fetching,
 * so this component just reads the current state.
 */
export default function Header() {
  // Get session and role from the provider context
  // The provider automatically updates these on auth state changes
  const { session, role, isLoading } = useSupabase();

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">AJ247 Studios</Link>
        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-400">Home</Link>
          <Link href="/portfolio" className="hover:text-gray-600 dark:hover:text-gray-400">Portfolio</Link>
          {/* Show Admin link only for users with admin role */}
          {role === "admin" && (
            <Link href="/admin" className="hover:text-gray-600 dark:hover:text-gray-400">Admin</Link>
          )}
          <div className="flex gap-4 ml-4 pl-4 border-l border-gray-300 dark:border-gray-700">
            {isLoading ? (
              // Show loading state while checking auth
              <span className="px-4 py-2 text-gray-400">Loading...</span>
            ) : !session ? (
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
