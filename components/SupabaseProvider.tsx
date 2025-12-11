"use client";

import { createClientBrowser } from "@/utils/supabase-browser";
import { createContext, useContext, useState, useEffect, useRef } from "react";
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
  // Create a single Supabase client instance for browser (singleton)
  const [supabase] = useState(() => createClientBrowser());
  
  // Track session state - initialized from server but updates on auth changes
  const [session, setSession] = useState<Session | null>(initialSession);
  const [role, setRole] = useState<string | null>(initialRole);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track if we've already initialized to prevent double-initialization
  const initialized = useRef(false);
  // Track last fetched user ID to prevent duplicate fetches
  const lastFetchedUserId = useRef<string | null>(null);

  useEffect(() => {
    // Prevent double-initialization in React Strict Mode
    if (initialized.current) return;
    initialized.current = true;

    // Function to fetch user role from profiles table
    const fetchRole = async (userId: string): Promise<string> => {
      // Skip if we already fetched for this user
      if (lastFetchedUserId.current === userId && role) {
        return role;
      }
      
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        
        if (error) {
          console.error("[SupabaseProvider] Error fetching role:", error.message);
          return "user";
        }
        
        lastFetchedUserId.current = userId;
        return profile?.role || "user";
      } catch (err) {
        console.error("[SupabaseProvider] Exception fetching role:", err);
        return "user";
      }
    };

    // Initialize session
    const initializeSession = async () => {
      try {
        const { data: { session: browserSession } } = await supabase.auth.getSession();
        
        if (browserSession) {
          setSession(browserSession);
          
          // Use initial role if available and user hasn't changed
          if (initialRole && browserSession.user.id === initialSession?.user?.id) {
            setRole(initialRole);
          } else {
            const fetchedRole = await fetchRole(browserSession.user.id);
            setRole(fetchedRole);
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
        
        // Ignore INITIAL_SESSION as we handle it in initializeSession
        if (event === "INITIAL_SESSION") {
          return;
        }
        
        // For TOKEN_REFRESHED, just update the session but don't refetch role
        if (event === "TOKEN_REFRESHED") {
          setSession(newSession);
          return;
        }
        
        // For SIGNED_IN or SIGNED_OUT, update everything
        setSession(newSession);
        
        if (newSession?.user) {
          const fetchedRole = await fetchRole(newSession.user.id);
          setRole(fetchedRole);
        } else {
          setRole(null);
          lastFetchedUserId.current = null;
        }
        
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

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
