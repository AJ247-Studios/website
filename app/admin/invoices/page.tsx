"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function InvoicesContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";
  const period = searchParams.get("period");

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            {(status !== "all" || period) && (
              <p className="text-slate-400 mt-1">
                {status !== "all" && `Status: ${status}`}
                {status !== "all" && period && " • "}
                {period && `Period: ${period}`}
              </p>
            )}
          </div>
          <Link 
            href="/admin" 
            className="text-amber-500 hover:text-amber-400"
          >
            ← Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Invoices Management Coming Soon</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            The invoicing feature is under development. You&apos;ll be able to create, 
            track, and manage invoices here.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function AdminInvoicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    }>
      <InvoicesContent />
    </Suspense>
  );
}
