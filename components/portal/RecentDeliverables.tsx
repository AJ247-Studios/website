/**
 * RecentDeliverables Component
 * 
 * Hero of the portal - shows recent deliverables with:
 * - Thumbnails with quick preview (lightbox)
 * - File type indicators and metadata
 * - Approve / Request Change actions
 * - Download buttons with signed URLs
 */

"use client";

import { useState } from "react";
import type { Deliverable } from "@/lib/types/portal";
import { formatFileSize, formatDuration, getStatusColor } from "@/lib/portal-data";

interface RecentDeliverablesProps {
  deliverables: Deliverable[];
  onApprove: (id: string) => void;
  onRequestRevision: (id: string) => void;
  onDownload: (id: string) => void;
  onOpenLightbox: (deliverable: Deliverable) => void;
}

export function RecentDeliverables({
  deliverables,
  onApprove,
  onRequestRevision,
  onDownload,
  onOpenLightbox,
}: RecentDeliverablesProps) {
  const pendingCount = deliverables.filter(d => d.approval_status === "pending").length;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Recent Deliverables
          </h2>
          {pendingCount > 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {pendingCount} {pendingCount === 1 ? "item needs" : "items need"} your review
            </p>
          )}
        </div>
        <a
          href="#all-deliverables"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all →
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {deliverables.map((deliverable, index) => (
          <DeliverableCard
            key={deliverable.id}
            deliverable={deliverable}
            priority={index < 6}
            onApprove={() => onApprove(deliverable.id)}
            onRequestRevision={() => onRequestRevision(deliverable.id)}
            onDownload={() => onDownload(deliverable.id)}
            onOpenLightbox={() => onOpenLightbox(deliverable)}
          />
        ))}
      </div>
    </section>
  );
}

interface DeliverableCardProps {
  deliverable: Deliverable;
  priority?: boolean;
  onApprove: () => void;
  onRequestRevision: () => void;
  onDownload: () => void;
  onOpenLightbox: () => void;
}

function DeliverableCard({
  deliverable,
  priority = false,
  onApprove,
  onRequestRevision,
  onDownload,
  onOpenLightbox,
}: DeliverableCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const statusColors = getStatusColor(deliverable.approval_status);
  const isPending = deliverable.approval_status === "pending";
  const isRevisionRequested = deliverable.approval_status === "revision_requested";

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <button
        onClick={onOpenLightbox}
        className="w-full aspect-[4/3] relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-label={`Preview ${deliverable.title}`}
      >
        <img
          src={deliverable.thumbnail_url}
          alt={deliverable.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading={priority ? "eager" : "lazy"}
        />

        {/* Video indicator */}
        {deliverable.file_type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            {deliverable.duration && (
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-xs font-medium bg-black/70 text-white rounded">
                {formatDuration(deliverable.duration)}
              </span>
            )}
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusColors.bg} ${statusColors.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
            {formatStatus(deliverable.approval_status)}
          </span>
        </div>

        {/* Hover overlay with quick actions */}
        <div
          className={`absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Download"
          >
            <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>

        {/* Annotation indicator */}
        {deliverable.annotations.length > 0 && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-500 text-white rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              {deliverable.annotations.length}
            </span>
          </div>
        )}
      </button>

      {/* Info & Actions */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate mb-1">
          {deliverable.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {deliverable.file_type.toUpperCase()} • {formatFileSize(deliverable.file_size)}
          {deliverable.resolution && ` • ${deliverable.resolution.width}×${deliverable.resolution.height}`}
        </p>

        {/* Action buttons */}
        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              className="flex-1 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={onRequestRevision}
              className="flex-1 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Request Edit
            </button>
          </div>
        )}

        {isRevisionRequested && (
          <p className="text-xs text-orange-600 dark:text-orange-400">
            Revision in progress...
          </p>
        )}

        {deliverable.approval_status === "approved" && (
          <button
            onClick={onDownload}
            className="w-full py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            Download
          </button>
        )}
      </div>
    </div>
  );
}

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    pending: "Review",
    approved: "Approved",
    revision_requested: "Changes",
    delivered: "Delivered",
  };
  return labels[status] || status;
}

export default RecentDeliverables;
