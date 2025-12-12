/**
 * ClientHero Component
 * 
 * Hero section for client portal showing:
 * - Client name and welcome message
 * - Outstanding invoices summary
 * - Next shoot date
 * - Quick action buttons
 */

"use client";

import Link from "next/link";
import type { ClientProfile, Project, Invoice } from "@/lib/types/portal";
import { formatCurrency } from "@/lib/portal-data";

interface ClientHeroProps {
  client: ClientProfile;
  nextShootDate?: string;
  totalOwed: number;
  pendingApprovals: number;
  onDownloadAll?: () => void;
  onBookSession?: () => void;
}

export function ClientHero({
  client,
  nextShootDate,
  totalOwed,
  pendingApprovals,
  onDownloadAll,
  onBookSession,
}: ClientHeroProps) {
  const greeting = getGreeting();
  const firstName = client.name.split(" ")[0];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 mb-8">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-pattern)" />
        </svg>
      </div>

      <div className="relative">
        {/* Welcome message */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-slate-400 text-sm mb-1">{greeting}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {firstName}
            </h1>
          </div>
          {client.avatar_url && (
            <img
              src={client.avatar_url}
              alt=""
              className="w-14 h-14 rounded-full border-2 border-white/20 hidden sm:block"
            />
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Next Shoot */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-slate-400">Next Shoot</span>
            </div>
            <p className="text-white font-semibold text-sm sm:text-base truncate">
              {nextShootDate ? formatDate(nextShootDate) : "No shoots scheduled"}
            </p>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-slate-400">To Review</span>
            </div>
            <p className="text-white font-semibold text-sm sm:text-base">
              {pendingApprovals} {pendingApprovals === 1 ? "item" : "items"}
            </p>
          </div>

          {/* Outstanding Balance */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-slate-400">Outstanding</span>
            </div>
            <p className={`font-semibold text-sm sm:text-base ${totalOwed > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {totalOwed > 0 ? formatCurrency(totalOwed) : "All paid!"}
            </p>
          </div>

          {/* Account Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-slate-400">Status</span>
            </div>
            <div className="flex items-center gap-1.5">
              {client.tags.includes("vip") && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-300 rounded">
                  VIP
                </span>
              )}
              {client.tags.includes("repeat") && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-300 rounded">
                  Repeat
                </span>
              )}
              {client.tags.length === 0 && (
                <span className="text-white text-sm">Active</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions - sticky on larger screens */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onDownloadAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 font-medium rounded-xl hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download All
          </button>
          
          <button
            onClick={onBookSession}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Book Session
          </button>

          <Link
            href="/contact"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Message Us
          </Link>

          <Link
            href="#"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default ClientHero;
