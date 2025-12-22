"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DeliverablesContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Deliverables</h1>
            {status !== "all" && (
              <p className="text-slate-400 mt-1">Filtered by: {status}</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Deliverables Management Coming Soon</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            The deliverables tracking feature is under development. You&apos;ll be able to manage 
            and track all project deliverables here.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function AdminDeliverablesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    }>
      <DeliverablesContent />
    </Suspense>
  );
}
