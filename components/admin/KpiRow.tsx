/**
 * KpiRow Component
 * 
 * Top row of KPIs for admin dashboard:
 * - Revenue this period
 * - Bookings this week
 * - Open projects
 * - Unpaid invoices
 * - Unread messages
 * - Average turnaround
 * 
 * Each KPI links to filtered list
 */

"use client";

import Link from "next/link";
import type { AdminKpis } from "@/lib/types/portal";
import { formatCurrency } from "@/lib/portal-data";

interface KpiRowProps {
  kpis: AdminKpis;
}

export function KpiRow({ kpis }: KpiRowProps) {
  return (
    <section className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Revenue */}
        <KpiCard
          title="Revenue"
          value={formatCurrency(kpis.revenue_this_month_cents)}
          subtitle="This month"
          change={kpis.revenue_change_percent}
          href="/admin/invoices?status=paid&period=month"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconColor="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"
        />

        {/* Bookings */}
        <KpiCard
          title="Bookings"
          value={String(kpis.bookings_this_week)}
          subtitle="This week"
          change={kpis.bookings_change_percent}
          href="/admin/projects?status=scheduled"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          iconColor="text-blue-600 bg-blue-100 dark:bg-blue-900/30"
        />

        {/* Open Projects */}
        <KpiCard
          title="Open Projects"
          value={String(kpis.open_projects)}
          subtitle="In progress"
          href="/admin/projects?status=active"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          iconColor="text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30"
        />

        {/* Pending Approvals */}
        <KpiCard
          title="Pending"
          value={String(kpis.pending_approvals)}
          subtitle="Awaiting review"
          href="/admin/deliverables?status=pending"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconColor="text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30"
          highlight={kpis.pending_approvals > 10}
        />

        {/* Unpaid Invoices */}
        <KpiCard
          title="Unpaid"
          value={formatCurrency(kpis.unpaid_invoices_cents)}
          subtitle={`${kpis.overdue_invoices_count} overdue`}
          href="/admin/invoices?status=unpaid"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          iconColor="text-amber-600 bg-amber-100 dark:bg-amber-900/30"
          highlight={kpis.overdue_invoices_count > 0}
        />

        {/* Messages */}
        <KpiCard
          title="Messages"
          value={String(kpis.unread_messages)}
          subtitle="Unread"
          href="/admin/messages"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          iconColor="text-purple-600 bg-purple-100 dark:bg-purple-900/30"
          highlight={kpis.unread_messages > 0}
        />
      </div>
    </section>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  change?: number;
  href: string;
  icon: React.ReactNode;
  iconColor: string;
  highlight?: boolean;
}

function KpiCard({
  title,
  value,
  subtitle,
  change,
  href,
  icon,
  iconColor,
  highlight,
}: KpiCardProps) {
  return (
    <Link
      href={href}
      className={`
        block p-4 bg-white dark:bg-slate-900 rounded-xl border 
        ${highlight 
          ? "border-amber-200 dark:border-amber-800 ring-2 ring-amber-500/20" 
          : "border-slate-200 dark:border-slate-800"
        }
        hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-md
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconColor}`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            change >= 0 
              ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30" 
              : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
          }`}>
            {change >= 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
        {value}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>
    </Link>
  );
}

export default KpiRow;
