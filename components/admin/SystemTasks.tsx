/**
 * SystemTasks Component
 * 
 * Background jobs, transcode status, storage alerts:
 * - Real-time task status updates
 * - Storage usage warnings
 * - Transcode queue status
 */

"use client";

import { useState, type ReactNode } from "react";
import type { SystemTask as SystemTaskType } from "@/lib/types/portal";

interface StorageInfo {
  used_gb: number;
  total_gb: number;
  breakdown: {
    videos: number;
    images: number;
    documents: number;
    other: number;
  };
}

interface SystemTasksProps {
  tasks: SystemTaskType[];
  storage: StorageInfo;
  onRetryTask?: (taskId: string) => void;
  onCancelTask?: (taskId: string) => void;
}

const taskIcons: Record<SystemTaskType["type"], ReactNode> = {
  transcode: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  backup: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  sync: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  export: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
};

const statusColors: Record<SystemTaskType["status"], { bg: string; text: string; icon: ReactNode }> = {
  pending: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
  },
  running: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    icon: (
      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ),
  },
  completed: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  failed: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-600 dark:text-red-400",
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

export function SystemTasks({
  tasks,
  storage,
  onRetryTask,
  onCancelTask,
}: SystemTasksProps) {
  const [showAllTasks, setShowAllTasks] = useState(false);

  const visibleTasks = showAllTasks ? tasks : tasks.slice(0, 4);
  const storagePercent = Math.round((storage.used_gb / storage.total_gb) * 100);
  const storageWarning = storagePercent >= 80;
  const storageCritical = storagePercent >= 95;

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">System Tasks</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {tasks.filter(t => t.status === "running").length} running
          </span>
        </div>
      </div>

      {/* Storage indicator */}
      <div className={`p-4 border-b border-slate-200 dark:border-slate-800 ${
        storageCritical 
          ? "bg-red-50 dark:bg-red-900/10" 
          : storageWarning 
          ? "bg-amber-50 dark:bg-amber-900/10" 
          : "bg-slate-50 dark:bg-slate-800/50"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg className={`w-4 h-4 ${
              storageCritical 
                ? "text-red-600 dark:text-red-400" 
                : storageWarning 
                ? "text-amber-600 dark:text-amber-400" 
                : "text-slate-600 dark:text-slate-400"
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Storage
            </span>
          </div>
          <span className={`text-sm font-semibold ${
            storageCritical 
              ? "text-red-600 dark:text-red-400" 
              : storageWarning 
              ? "text-amber-600 dark:text-amber-400" 
              : "text-slate-900 dark:text-white"
          }`}>
            {storage.used_gb} / {storage.total_gb} GB
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all ${
              storageCritical 
                ? "bg-red-500" 
                : storageWarning 
                ? "bg-amber-500" 
                : "bg-blue-500"
            }`}
            style={{ width: `${storagePercent}%` }}
          />
        </div>

        {/* Breakdown */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Videos {storage.breakdown.videos}GB
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Images {storage.breakdown.images}GB
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Docs {storage.breakdown.documents}GB
          </span>
        </div>

        {(storageCritical || storageWarning) && (
          <button className={`mt-3 w-full text-center text-xs font-medium py-1.5 rounded-lg ${
            storageCritical 
              ? "text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50" 
              : "text-amber-700 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
          } transition-colors`}>
            {storageCritical ? "Upgrade Storage Now" : "Review Storage Usage"}
          </button>
        )}
      </div>

      {/* Tasks list */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {visibleTasks.map(task => {
          const status = statusColors[task.status];
          return (
            <div key={task.id} className="p-4">
              <div className="flex items-start gap-3">
                {/* Type icon */}
                <div className={`shrink-0 p-2 rounded-lg ${status.bg}`}>
                  <div className={status.text}>
                    {taskIcons[task.type]}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {task.title}
                    </p>
                    <div className={status.text}>
                      {status.icon}
                    </div>
                  </div>

                  {/* Progress bar for running tasks */}
                  {task.status === "running" && task.progress !== undefined && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {task.progress}% complete
                        {task.started_at && ` • Started ${formatTimeAgo(task.started_at)}`}
                      </p>
                    </div>
                  )}

                  {/* Error message */}
                  {task.status === "failed" && task.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {task.error}
                    </p>
                  )}

                  {/* Completed time */}
                  {task.status === "completed" && task.completed_at && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Completed {formatTimeAgo(task.completed_at)}
                    </p>
                  )}

                  {/* Pending indicator */}
                  {task.status === "pending" && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Waiting in queue
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-1">
                  {task.status === "failed" && onRetryTask && (
                    <button
                      onClick={() => onRetryTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Retry"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                  {(task.status === "running" || task.status === "pending") && onCancelTask && (
                    <button
                      onClick={() => onCancelTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {tasks.length > 4 && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowAllTasks(!showAllTasks)}
            className="w-full text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {showAllTasks ? "Show Less" : `Show ${tasks.length - 4} More Tasks`}
          </button>
        </div>
      )}
    </div>
  );
}

export default SystemTasks;
