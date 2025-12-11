import { supabase } from "./supabaseClient";
import type { Session, EmailOtpType, MobileOtpType } from "@supabase/supabase-js";

/**
 * Get the current user session
 */
export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  redirectUrl?: string
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });
}

/**
 * Sign out the current user
 */
export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * Reset password with email
 */
export async function resetPassword(email: string, redirectUrl?: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}

/**
 * Update user email
 */
export async function updateEmail(newEmail: string) {
  return supabase.auth.updateUser({ email: newEmail });
}

/**
 * Verify OTP for multi-factor authentication (supports email and SMS)
 */
export async function verifyOTP(
  identifier: { email?: string; phone?: string },
  token: string,
  type: EmailOtpType | MobileOtpType
) {
  return supabase.auth.verifyOtp({
    ...identifier,
    token,
    type
  });
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (session: Session | null) => void
) {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session);
    }
  );

  return listener?.subscription;
}
