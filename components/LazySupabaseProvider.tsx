"use client";

import dynamic from "next/dynamic";
import type { Session } from "@supabase/supabase-js";

const DynamicSupabaseProvider = dynamic(
  () => import("./SupabaseProvider").then((mod) => mod.SupabaseProvider),
  { ssr: false, loading: () => <></> }
);

export function LazySupabaseProvider({
  children,
  initialSession,
  initialRole,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
  initialRole: string | null;
}) {
  return (
    <DynamicSupabaseProvider initialSession={initialSession} initialRole={initialRole}>
      {children}
    </DynamicSupabaseProvider>
  );
}
