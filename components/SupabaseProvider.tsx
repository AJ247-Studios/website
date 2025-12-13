"use client";

import { createClientBrowser } from "@/utils/supabase-browser";
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import type { SupabaseClient, Session, User, AuthChangeEvent } from "@supabase/supabase-js";

type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  role: string | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

/**
 * Debug helper - logs auth events with timestamps
 * Only logs in development mode
 */
function debugLog(label: string, data: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 12);
    console.log(`[Auth ${timestamp}] ${label}`, data);
  }
}

export const SupabaseProvider = ({
  children,
  initialSession = null,
  initialRole = null,
}: {
  children: React.ReactNode;
  initialSession?: Session | null;
  initialRole?: string | null;
}) => {
  // Create a single Supabase client instance for browser (singleton)
  const [supabase] = useState(() => createClientBrowser());
  
  // Track session state - initialized from server OR null (will rehydrate)
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
  const [role, setRole] = useState<string | null>(initialRole);
  
  // CRITICAL: Always start loading=true, even with initialSession
  // This ensures we don't render protected content until client-side validation completes
  const [isLoading, setIsLoading] = useState(true);
  
  // Track mount state for cleanup
  const mountedRef = useRef(true);
  
  // Fetch role helper - memoized to prevent dependency issues
  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      return profile?.role || "user";
    } catch (err) {
      console.error("[Auth] fetchRole error:", err);
      return "user";
    }
  }, [supabase]);

  useEffect(() => {
    mountedRef.current = true;
    
    debugLog("init", {
      hasInitialSession: !!initialSession,
      initialUserId: initialSession?.user?.id ?? null,
      initialRole,
    });

    /**
     * CRITICAL: Always call getSession() on mount
     * 
     * Even if we have initialSession from SSR, we need to:
     * 1. Validate it's still valid client-side
     * 2. Let supabase-js sync its internal state with localStorage
     * 3. Handle cases where SSR session differs from client storage
     * 
     * This is the KEY FIX for session rehydration issues.
     */
    async function initializeAuth() {
      try {
        debugLog("getSession", { status: "starting" });
        
        const { data: { session: clientSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          debugLog("getSession", { status: "error", error: error.message });
          if (mountedRef.current) {
            setSession(null);
            setUser(null);
            setRole(null);
            setIsLoading(false);
          }
          return;
        }

        debugLog("getSession", {
          status: "success",
          sessionExists: !!clientSession,
          userId: clientSession?.user?.id ?? null,
          expiresAt: clientSession?.expires_at
            ? new Date(clientSession.expires_at * 1000).toISOString()
            : null,
        });

        if (!mountedRef.current) return;

        // Update state with client-side session (may differ from SSR)
        setSession(clientSession);
        setUser(clientSession?.user ?? null);

        // Fetch role if we have a session
        if (clientSession?.user) {
          const userRole = await fetchRole(clientSession.user.id);
          if (mountedRef.current) {
            setRole(userRole);
            debugLog("role", { userId: clientSession.user.id, role: userRole });
          }
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error("[Auth] initializeAuth error:", err);
        if (mountedRef.current) {
          setSession(null);
          setUser(null);
          setRole(null);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          debugLog("init", { status: "complete", isLoading: false });
        }
      }
    }

    // Always initialize - don't skip even with initialSession
    initializeAuth();

    /**
     * Subscribe to auth state changes
     * 
     * IMPORTANT: This fires AFTER getSession() completes in most cases,
     * but we still need it for:
     * - SIGNED_IN: User logs in (OAuth, magic link, password)
     * - SIGNED_OUT: User logs out
     * - TOKEN_REFRESHED: Access token was refreshed
     * - USER_UPDATED: User profile was updated
     * - INITIAL_SESSION: Fired when session is first detected (v2.x)
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        debugLog("onAuthStateChange", {
          event,
          sessionExists: !!newSession,
          userId: newSession?.user?.id ?? null,
          expiresAt: newSession?.expires_at
            ? new Date(newSession.expires_at * 1000).toISOString()
            : null,
        });

        if (!mountedRef.current) return;

        // Always update session and user state
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Handle different auth events
        switch (event) {
          case "INITIAL_SESSION":
            // INITIAL_SESSION is fired on first load - we've already handled this in initializeAuth
            // But update role if needed
            if (newSession?.user) {
              const userRole = await fetchRole(newSession.user.id);
              if (mountedRef.current) setRole(userRole);
            }
            break;
            
          case "SIGNED_IN":
          case "TOKEN_REFRESHED":
            if (newSession?.user) {
              const userRole = await fetchRole(newSession.user.id);
              if (mountedRef.current) {
                setRole(userRole);
                debugLog("role updated", { event, role: userRole });
              }
            }
            // Ensure loading is false after sign in
            if (mountedRef.current) setIsLoading(false);
            break;
            
          case "SIGNED_OUT":
            if (mountedRef.current) {
              setRole(null);
              setIsLoading(false);
            }
            break;
            
          case "USER_UPDATED":
            // Role might have changed, refetch
            if (newSession?.user) {
              const userRole = await fetchRole(newSession.user.id);
              if (mountedRef.current) setRole(userRole);
            }
            break;
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      debugLog("cleanup", { status: "unsubscribed" });
    };
  }, [supabase, fetchRole]); // Removed initialSession and initialRole from deps - only run once

  return (
    <SupabaseContext.Provider value={{ supabase, session, user, role, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) throw new Error("useSupabase must be used within SupabaseProvider");
  return context;
};

/**
 * Alias for useSupabase - provides same functionality
 * Use whichever naming you prefer
 */
export const useAuth = useSupabase;
