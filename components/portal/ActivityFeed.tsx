/**
 * ActivityFeed Component
 * 
 * Shows recent activity including:
 * - Comments, approvals, payments
 * - Email + in-app notifications
 * - Timestamps and actor info
 */

"use client";

import type { ActivityItem } from "@/lib/types/portal";

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
}

export function ActivityFeed({ activities, maxItems = 10 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Recent Activity
        </h2>
        <a
          href="#all-activity"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all →
        </a>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {displayActivities.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {displayActivities.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
          </div>
        )}
      </div>
    </section>
  );
}

interface ActivityRowProps {
  activity: ActivityItem;
}

function ActivityRow({ activity }: ActivityRowProps) {
  const { icon, color } = getActivityIcon(activity.type);

  return (
    <div className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      {/* Icon */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 dark:text-white">
          <span className="font-medium">{activity.actor_name}</span>
          {" "}
          {getActivityVerb(activity.type)}
          {" "}
          <span className="font-medium">{activity.target_title}</span>
        </p>
        {activity.metadata?.comment ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">
            &ldquo;{String(activity.metadata.comment)}&rdquo;
          </p>
        ) : null}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {formatTimeAgo(activity.created_at)}
        </p>
      </div>

      {/* Actor avatar */}
      {activity.actor_avatar && (
        <img
          src={activity.actor_avatar}
          alt=""
          className="w-6 h-6 rounded-full shrink-0"
        />
      )}
    </div>
  );
}

function getActivityIcon(type: string): { icon: React.ReactNode; color: string } {
  const icons: Record<string, { icon: React.ReactNode; color: string }> = {
    deliverable_uploaded: {
      icon: (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      color: "bg-blue-100 dark:bg-blue-900/30",
    },
    deliverable_approved: {
      icon: (
        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    deliverable_revision_requested: {
      icon: (
        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: "bg-orange-100 dark:bg-orange-900/30",
    },
    deliverable_downloaded: {
      icon: (
        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      color: "bg-purple-100 dark:bg-purple-900/30",
    },
    comment_added: {
      icon: (
        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      color: "bg-slate-100 dark:bg-slate-800",
    },
    invoice_sent: {
      icon: (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "bg-blue-100 dark:bg-blue-900/30",
    },
    invoice_paid: {
      icon: (
        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    project_status_changed: {
      icon: (
        <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: "bg-cyan-100 dark:bg-cyan-900/30",
    },
    file_uploaded: {
      icon: (
        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      color: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    message_received: {
      icon: (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-blue-100 dark:bg-blue-900/30",
    },
    message_sent: {
      icon: (
        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      color: "bg-slate-100 dark:bg-slate-800",
    },
  };

  return icons[type] || icons.comment_added;
}

function getActivityVerb(type: string): string {
  const verbs: Record<string, string> = {
    deliverable_uploaded: "uploaded",
    deliverable_approved: "approved",
    deliverable_revision_requested: "requested changes to",
    deliverable_downloaded: "downloaded",
    comment_added: "commented on",
    invoice_sent: "sent invoice",
    invoice_paid: "paid invoice",
    project_status_changed: "updated status of",
    file_uploaded: "uploaded file to",
    message_received: "sent you a message:",
    message_sent: "sent a message:",
  };
  return verbs[type] || "updated";
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

export default ActivityFeed;
