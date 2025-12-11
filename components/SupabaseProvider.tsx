"use client";

import { createClientBrowser } from "@/utils/supabase-browser";
import { createContext, useContext, useState } from "react";
import type { SupabaseClient, Session } from "@supabase/supabase-js";

type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({
  children,
  initialSession = null,
}: {
  children: React.ReactNode;
  initialSession?: Session | null;
}) => {
  const [supabase] = useState(() => createClientBrowser());

  return (
    <SupabaseContext.Provider value={{ supabase, session: initialSession }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) throw new Error("useSupabase must be used within SupabaseProvider");
  return context;
};
