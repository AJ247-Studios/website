"use client";

import Link from "next/link";
import { useSupabase } from "@/components/SupabaseProvider";
import { useState } from "react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AJ</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">AJ247 Studios</span>
          </Link>

          {/* Desktop Navigation - limited to 4-6 items per research */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Home
            </Link>
            <Link href="/services" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Services
            </Link>
            <Link href="/portfolio" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Portfolio
            </Link>
            <Link href="/about" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              About
            </Link>
            {/* Show Admin link only for users with admin role */}
            {role === "admin" && (
              <Link href="/admin" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Right side - Auth + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <span className="px-4 py-2 text-sm text-slate-400">Loading...</span>
            ) : !session ? (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/contact" className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                  Get a Quote
                </Link>
              </>
            ) : (
              <>
                <Link href="/profile" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Profile
                </Link>
                <Link href="/contact" className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                  Get a Quote
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col gap-1">
              <Link href="/" className="px-4 py-3 text-base font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/services" className="px-4 py-3 text-base font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Services
              </Link>
              <Link href="/portfolio" className="px-4 py-3 text-base font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Portfolio
              </Link>
              <Link href="/about" className="px-4 py-3 text-base font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              {role === "admin" && (
                <Link href="/admin" className="px-4 py-3 text-base font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <div className="border-t border-slate-200 dark:border-slate-800 my-2"></div>
              {!session ? (
                <>
                  <Link href="/login" className="px-4 py-3 text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/contact" className="mx-4 mt-2 px-4 py-3 text-base font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg text-center hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Get a Quote
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/profile" className="px-4 py-3 text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link href="/contact" className="mx-4 mt-2 px-4 py-3 text-base font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg text-center hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Get a Quote
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
