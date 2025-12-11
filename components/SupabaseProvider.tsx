"use client";

import { createClientBrowser } from "@/utils/supabase-browser";
import { createContext, useContext, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseContext = {
  supabase: SupabaseClient;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase] = useState(() => createClientBrowser());

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return context;
};
