"use client";

import Link from "next/link";

export default function AdminMessagesPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Messages</h1>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Messages Coming Soon</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            The messaging feature is under development. Soon you&apos;ll be able to communicate 
            directly with clients here.
          </p>
        </div>
      </div>
    </main>
  );
}
