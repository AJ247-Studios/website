/**
 * AlertsFeed Component
 * 
 * Real-time alerts stream with:
 * - New leads, client messages, overdue invoices
 * - One-click triage buttons
 * - Priority indicators
 */

"use client";

import { useState } from "react";
import type { AdminAlert } from "@/lib/types/portal";
import { getStatusColor } from "@/lib/portal-data";

interface AlertsFeedProps {
  alerts: AdminAlert[];
  onDismiss: (alertId: string) => void;
  onAction: (alert: AdminAlert) => void;
  maxAlerts?: number;
}

export function AlertsFeed({
  alerts,
  onDismiss,
  onAction,
  maxAlerts = 5,
}: AlertsFeedProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts
    .filter(a => !dismissedIds.has(a.id))
    .slice(0, maxAlerts);

  const handleDismiss = (alertId: string) => {
    setDismissedIds(prev => new Set(prev).add(alertId));
    onDismiss(alertId);
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Alerts
        </h2>
        {alerts.length > maxAlerts && (
          <a
            href="/admin/alerts"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all ({alerts.length}) →
          </a>
        )}
      </div>

      {visibleAlerts.length > 0 ? (
        <div className="space-y-3">
          {visibleAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDismiss={() => handleDismiss(alert.id)}
              onAction={() => onAction(alert)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">All caught up!</p>
        </div>
      )}
    </section>
  );
}

interface AlertCardProps {
  alert: AdminAlert;
  onDismiss: () => void;
  onAction: () => void;
}

function AlertCard({ alert, onDismiss, onAction }: AlertCardProps) {
  const { icon, color, bgColor } = getAlertStyle(alert.type, alert.priority);

  return (
    <div className={`relative flex items-start gap-3 p-4 rounded-xl border ${bgColor}`}>
      {/* Priority indicator */}
      {alert.priority === "urgent" && (
        <div className="absolute top-0 right-0 w-2 h-2 m-2">
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
          <span className="absolute inset-0 rounded-full bg-red-500" />
        </div>
      )}

      {/* Icon */}
      <div className={`shrink-0 p-2 rounded-lg ${color}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white text-sm">
              {alert.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {alert.description}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {formatTimeAgo(alert.created_at)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          {alert.action_label && (
            <button
              onClick={onAction}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              {alert.action_label}
            </button>
          )}
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

function getAlertStyle(type: string, priority: string): { icon: React.ReactNode; color: string; bgColor: string } {
  const styles: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
    lead: {
      icon: <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
      color: "bg-blue-100 dark:bg-blue-900/30",
      bgColor: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    },
    message: {
      icon: <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
      color: "bg-purple-100 dark:bg-purple-900/30",
      bgColor: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
    },
    overdue: {
      icon: <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: "bg-red-100 dark:bg-red-900/30",
      bgColor: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    },
    approval: {
      icon: <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: "bg-orange-100 dark:bg-orange-900/30",
      bgColor: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
    },
    payment: {
      icon: <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      color: "bg-emerald-100 dark:bg-emerald-900/30",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    },
    system: {
      icon: <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      color: "bg-slate-100 dark:bg-slate-800",
      bgColor: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800",
    },
  };

  return styles[type] || styles.system;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default AlertsFeed;
