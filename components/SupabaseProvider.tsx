"use client";

import { createClientBrowser } from "@/utils/supabase-browser";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { SupabaseClient, Session } from "@supabase/supabase-js";

type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
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
  // Create a single Supabase client instance for browser
  const [supabase] = useState(() => createClientBrowser());
  
  // Track session state - initialized from server but updates on auth changes
  const [session, setSession] = useState<Session | null>(initialSession);
  const [role, setRole] = useState<string | null>(initialRole);
  const [isLoading, setIsLoading] = useState(!initialSession);

  // Function to fetch user role from profiles table
  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("[SupabaseProvider] Error fetching role:", error.message);
        setRole(null);
      } else {
        setRole(profile?.role || null);
      }
    } catch (err) {
      console.error("[SupabaseProvider] Exception fetching role:", err);
      setRole(null);
    }
  }, [supabase]);

  useEffect(() => {
    // Get initial session from browser cookies (in case server session is stale)
    const initializeSession = async () => {
      try {
        const { data: { session: browserSession } } = await supabase.auth.getSession();
        
        if (browserSession) {
          setSession(browserSession);
          // Only fetch role if we don't have it or user changed
          if (!initialRole || browserSession.user.id !== initialSession?.user?.id) {
            await fetchRole(browserSession.user.id);
          }
        } else {
          setSession(null);
          setRole(null);
        }
      } catch (error) {
        console.error("[SupabaseProvider] Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("[SupabaseProvider] Auth state change:", event);
        
        setSession(newSession);
        
        if (newSession?.user) {
          // Fetch role when user logs in or session is refreshed
          await fetchRole(newSession.user.id);
        } else {
          // Clear role on logout
          setRole(null);
        }
        
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchRole, initialRole, initialSession?.user?.id]);

  return (
    <SupabaseContext.Provider value={{ supabase, session, role, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) throw new Error("useSupabase must be used within SupabaseProvider");
  return context;
};
