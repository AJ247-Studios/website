"use client";

/**
 * Optimized Login Page
 * 
 * UX Requirements (from research):
 * - Magic link + password fallback
 * - Clear error handling & recovery
 * - Accessibility: big labels, high contrast, keyboard-first
 * - aria-live for error announcements
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";
import Link from "next/link";

type AuthMethod = "magic-link" | "password";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("magic-link");
  const [errors, setErrors] = useState<FormErrors>({});
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase, session } = useSupabase();
  
  // Get redirect URL from query params (set by middleware)
  const redirectTo = searchParams.get("redirect") || "/profile";
  const errorMessage = searchParams.get("error");

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.push(redirectTo);
    }
  }, [session, router, redirectTo]);

  // Handle URL error params (e.g., from OAuth failures)
  useEffect(() => {
    if (errorMessage) {
      setErrors({ email: decodeURIComponent(errorMessage) });
    }
  }, [errorMessage]);

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (authMethod === "password" && !password) {
      newErrors.password = "Please enter your password";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, authMethod]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (authMethod === "magic-link") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
          },
        });

        if (error) {
          setErrors({ email: error.message });
          setLoading(false);
          return;
        }

        setMagicLinkSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Friendly error messages
          if (error.message.includes("Invalid login credentials")) {
            setErrors({ 
              email: "Email or password is incorrect",
              password: " " // Visual indicator on password field too
            });
          } else if (error.message.includes("Email not confirmed")) {
            setErrors({ email: "Please verify your email address first" });
          } else {
            setErrors({ email: error.message });
          }
          setLoading(false);
          return;
        }
        
        // Analytics: Track login
        // analytics.track("login_complete", { method: "password" });
      }
    } catch (err) {
      setErrors({ email: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrors({ email: "Please enter your email address first" });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/profile&type=recovery`,
      });

      if (error) {
        setErrors({ email: error.message });
      } else {
        setMagicLinkSent(true);
      }
    } catch (err) {
      setErrors({ email: "Failed to send reset link" });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session or already logged in
  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Magic link / reset sent confirmation
  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Check your email
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We sent a sign-in link to{" "}
              <span className="font-medium text-slate-900 dark:text-white">{email}</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Click the link in the email to sign in securely. No password needed.
            </p>
            <button
              onClick={() => setMagicLinkSent(false)}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              ← Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold">AJ</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome back
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Sign in to access your client portal
            </p>
          </div>

          {/* Error announcement for screen readers */}
          {errors.email && (
            <div 
              role="alert" 
              aria-live="assertive" 
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm"
            >
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">{errors.email}</p>
                  {errors.email.includes("incorrect") && (
                    <button
                      onClick={handleForgotPassword}
                      className="mt-1 text-red-600 dark:text-red-400 underline hover:no-underline text-sm"
                    >
                      Reset your password
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                or continue with email
              </span>
            </div>
          </div>

          {/* Auth method tabs */}
          <div className="flex gap-2 p-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-lg" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={authMethod === "magic-link"}
              onClick={() => setAuthMethod("magic-link")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                authMethod === "magic-link"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Magic Link
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMethod === "password"}
              onClick={() => setAuthMethod("password")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                authMethod === "password"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Password
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({});
                }}
                autoComplete="email"
                placeholder="jan@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`w-full px-4 py-3 border ${
                  errors.email ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                } rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              />
            </div>

            {/* Password (only for password method) */}
            {authMethod === "password" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={!!errors.password}
                    className={`w-full px-4 py-3 pr-12 border ${
                      errors.password && errors.password !== " " ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    } rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Magic link info */}
            {authMethod === "magic-link" && (
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                We&apos;ll email you a secure link to sign in instantly—no password needed.
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-base font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : authMethod === "magic-link" ? (
                "Send Magic Link"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${redirectTo !== "/profile" ? `?redirect=${redirectTo}` : ""}`}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create one
            </Link>
          </p>

          {/* Help link */}
          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Having trouble?{" "}
            <Link href="/contact" className="font-medium hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
