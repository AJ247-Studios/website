"use client";

import { createClientBrowser } from "@/utils/supabase-browser";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { SupabaseClient, Session, User } from "@supabase/supabase-js";

type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  role: string | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

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
  
  // Track session state - initialized from server
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
  const [role, setRole] = useState<string | null>(initialRole);
  
  // If we have initialSession from server, we're NOT loading.
  // Otherwise, we need to try to recover session from storage/cookies.
  const [isLoading, setIsLoading] = useState(!initialSession);
  
  // Track if we've initialized to prevent double-fetching
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initialized.current) return;
    initialized.current = true;

    /**
     * CRITICAL: Rehydrate session on mount
     *
     * Handles both cases:
     * 1) No initialSession (recover from browser storage)
     * 2) We have initialSession from the server but the browser client doesn't
     *    yet have it (after OAuth/magic-link redirect). In that case, push the
     *    server session into the browser client so future refreshes stay logged in.
     */
    async function initializeAuth() {
      try {
        // Read whatever the browser currently knows (localStorage/sessionStorage)
        const { data: { session: storedSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth init error:", error.message);
        }

        let effectiveSession = storedSession;

        // If the browser has no session but the server sent one, hydrate it now
        if (!storedSession && initialSession?.access_token && initialSession?.refresh_token) {
          const { data, error: setError } = await supabase.auth.setSession({
            access_token: initialSession.access_token,
            refresh_token: initialSession.refresh_token,
          });

          if (setError) {
            console.error("Auth setSession error:", setError.message);
          } else if (data?.session) {
            effectiveSession = data.session;
          }
        }

        if (effectiveSession) {
          setSession(effectiveSession);
          setUser(effectiveSession.user);

          // Fetch role if we recovered a session but don't have a role yet
          if (!role && effectiveSession.user) {
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("role")
              .eq("id", effectiveSession.user.id)
              .maybeSingle();
            setRole(profile?.role || "user");
          }
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();

    /**
     * Subscribe to auth state changes
     * 
     * This handles:
     * - SIGNED_IN: User logs in (OAuth, magic link, password)
     * - SIGNED_OUT: User logs out
     * - TOKEN_REFRESHED: Access token was refreshed
     * - USER_UPDATED: User profile was updated
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Update session and user state
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Handle different auth events
        switch (event) {
          case "SIGNED_IN":
          case "TOKEN_REFRESHED":
            if (newSession?.user) {
              // Fetch/refresh role
              const { data: profile } = await supabase
                .from("user_profiles")
                .select("role")
                .eq("id", newSession.user.id)
                .maybeSingle();
              setRole(profile?.role || "user");
            }
            break;
            
          case "SIGNED_OUT":
            setRole(null);
            break;
            
          case "USER_UPDATED":
            // Role might have changed, refetch
            if (newSession?.user) {
              const { data: profile } = await supabase
                .from("user_profiles")
                .select("role")
                .eq("id", newSession.user.id)
                .maybeSingle();
              setRole(profile?.role || "user");
            }
            break;
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, initialSession, role]);

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
