/**
 * DeliverablesStrip Component
 * 
 * Recent deliverables carousel/grid near top:
 * - Show last 3-6 items with quick-preview
 * - Inline meta (filetype, size, expiry)
 * - Single-click actions: preview, approve, download
 */

"use client";

import { useState, type ReactNode } from "react";
import type { Deliverable } from "@/lib/types/portal";

interface DeliverablesStripProps {
  items: Deliverable[];
  onPreview: (id: string) => void;
  onApprove: (id: string) => void;
  onDownload: (id: string) => void;
  maxVisible?: number;
}

export function DeliverablesStrip({
  items,
  onPreview,
  onApprove,
  onDownload,
  maxVisible = 6,
}: DeliverablesStripProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const visibleItems = items.slice(0, maxVisible);
  const pendingCount = items.filter((d) => d.approval_status === "pending").length;

  if (items.length === 0) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Deliverables
          </h2>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-2">No deliverables yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Your photos and videos will appear here after your session
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Deliverables
          </h2>
          {pendingCount > 0 && (
            <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
              {pendingCount} to review
            </span>
          )}
        </div>
        {items.length > maxVisible && (
          <a
            href="/portal/deliverables"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all ({items.length}) →
          </a>
        )}
      </div>

      {/* Deliverables grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {visibleItems.map((item) => (
          <DeliverableCard
            key={item.id}
            item={item}
            isHovered={hoveredId === item.id}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            onPreview={() => onPreview(item.id)}
            onApprove={() => onApprove(item.id)}
            onDownload={() => onDownload(item.id)}
          />
        ))}
      </div>
    </section>
  );
}

interface DeliverableCardProps {
  item: Deliverable;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onPreview: () => void;
  onApprove: () => void;
  onDownload: () => void;
}

function DeliverableCard({
  item,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onPreview,
  onApprove,
  onDownload,
}: DeliverableCardProps) {
  const isPending = item.approval_status === "pending";
  const isExpiring = item.expiry_at && new Date(item.expiry_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const daysUntilExpiry = item.expiry_at 
    ? Math.ceil((new Date(item.expiry_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    : null;

  return (
    <div
      className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onPreview}
    >
      {/* Thumbnail */}
      <img
        src={item.thumbnail_url}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* File type badge */}
      <div className="absolute top-2 left-2">
        <FileTypeBadge type={item.file_type} />
      </div>

      {/* Status badges */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
        {isPending && (
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-500 text-white rounded-full">
            Review
          </span>
        )}
        {isExpiring && daysUntilExpiry !== null && daysUntilExpiry > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium bg-red-500/90 text-white rounded-full">
            {daysUntilExpiry}d left
          </span>
        )}
      </div>

      {/* Hover overlay */}
      <div
        className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Meta info */}
        <p className="text-white text-sm font-medium truncate max-w-[90%]">{item.title}</p>
        <p className="text-white/70 text-xs">{formatSize(item.file_size)}</p>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Preview"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {isPending && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApprove();
              }}
              className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
              title="Approve"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Download"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Video duration indicator */}
      {item.file_type === "video" && item.duration && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
          {formatDuration(item.duration)}
        </div>
      )}
    </div>
  );
}

function FileTypeBadge({ type }: { type: Deliverable["file_type"] }) {
  const icons: Record<string, ReactNode> = {
    image: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    video: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    document: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    archive: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  };

  return (
    <div className="p-1.5 bg-black/50 backdrop-blur-sm rounded-lg">
      <div className="text-white">{icons[type] || icons.document}</div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default DeliverablesStrip;
