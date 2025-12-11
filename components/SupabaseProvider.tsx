"use client";

import { createClientBrowser } from "@/utils/supabase-browser";
import { createContext, useContext, useState, useEffect } from "react";
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
  // Log what we received from server
  console.log("[SupabaseProvider] Initializing with:", {
    hasInitialSession: !!initialSession,
    initialUserId: initialSession?.user?.id || "none",
    initialRole: initialRole,
  });

  // Create a single Supabase client instance for browser (singleton)
  const [supabase] = useState(() => createClientBrowser());
  
  // Track session state - initialized from server
  const [session, setSession] = useState<Session | null>(initialSession);
  const [role, setRole] = useState<string | null>(initialRole);
  // IMPORTANT: If we have initialSession from server, we're NOT loading
  // This prevents the "Loading..." flash
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("[SupabaseProvider] useEffect running, setting up auth listener");
    
    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("[SupabaseProvider] Auth state change:", {
          event,
          hasNewSession: !!newSession,
          newUserId: newSession?.user?.id || "none",
        });
        
        // Update session
        setSession(newSession);
        
        // Only refetch role on actual sign in/out (not token refresh)
        if (event === "SIGNED_IN" && newSession?.user) {
          console.log("[SupabaseProvider] SIGNED_IN - fetching role...");
          // Fetch role from user_profiles
          const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("id", newSession.user.id)
            .maybeSingle();
          console.log("[SupabaseProvider] Role fetch result:", { profile, error: error?.message });
          setRole(profile?.role || "user");
        } else if (event === "SIGNED_OUT") {
          console.log("[SupabaseProvider] SIGNED_OUT - clearing role");
          setRole(null);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      console.log("[SupabaseProvider] Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, [supabase]);

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
