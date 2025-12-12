/**
 * PortalLightbox Component
 * 
 * Media viewer with:
 * - Image/video preview
 * - Context panel with metadata
 * - Approve/Request Change actions
 * - Annotation support for videos (timecode)
 * - Download button
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { Deliverable, Annotation } from "@/lib/types/portal";
import { formatFileSize, formatDuration, getStatusColor } from "@/lib/portal-data";

interface PortalLightboxProps {
  deliverable: Deliverable | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onRequestRevision: (id: string, comment: string) => void;
  onDownload: (id: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function PortalLightbox({
  deliverable,
  onClose,
  onApprove,
  onRequestRevision,
  onDownload,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: PortalLightboxProps) {
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionComment, setRevisionComment] = useState("");
  const [currentTimecode, setCurrentTimecode] = useState<number | undefined>();

  // Handle keyboard navigation
  useEffect(() => {
    if (!deliverable) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrevious) onPrevious?.();
      if (e.key === "ArrowRight" && hasNext) onNext?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [deliverable, onClose, onPrevious, onNext, hasPrevious, hasNext]);

  const handleSubmitRevision = useCallback(() => {
    if (!deliverable || !revisionComment.trim()) return;
    onRequestRevision(deliverable.id, revisionComment);
    setRevisionComment("");
    setShowRevisionForm(false);
  }, [deliverable, revisionComment, onRequestRevision]);

  if (!deliverable) return null;

  const statusColors = getStatusColor(deliverable.approval_status);
  const isPending = deliverable.approval_status === "pending";

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${deliverable.title}`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Close lightbox"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        {/* Previous button */}
        {hasPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Previous"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Media */}
        <div className="max-w-5xl max-h-[80vh] w-full">
          {deliverable.file_type === "video" ? (
            <video
              src={deliverable.preview_url}
              poster={deliverable.thumbnail_url}
              controls
              className="w-full h-full max-h-[80vh] object-contain rounded-lg"
              onTimeUpdate={(e) => setCurrentTimecode(Math.floor(e.currentTarget.currentTime))}
            />
          ) : (
            <img
              src={deliverable.preview_url || deliverable.thumbnail_url}
              alt={deliverable.title}
              className="w-full h-full max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </div>

        {/* Next button */}
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 sm:right-[340px] p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Next"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Context panel (sidebar) */}
      <div className="hidden sm:flex w-80 bg-slate-900 flex-col border-l border-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-semibold text-white mb-1 line-clamp-2">
            {deliverable.title}
          </h2>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${statusColors.bg} ${statusColors.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
            {formatApprovalStatus(deliverable.approval_status)}
          </span>
        </div>

        {/* Metadata */}
        <div className="p-4 border-b border-slate-800 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Type</span>
            <span className="text-white">{deliverable.file_type.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Size</span>
            <span className="text-white">{formatFileSize(deliverable.file_size)}</span>
          </div>
          {deliverable.resolution && (
            <div className="flex justify-between">
              <span className="text-slate-400">Resolution</span>
              <span className="text-white">
                {deliverable.resolution.width} × {deliverable.resolution.height}
              </span>
            </div>
          )}
          {deliverable.duration && (
            <div className="flex justify-between">
              <span className="text-slate-400">Duration</span>
              <span className="text-white">{formatDuration(deliverable.duration)}</span>
            </div>
          )}
          {deliverable.expiry_at && (
            <div className="flex justify-between">
              <span className="text-slate-400">Download expires</span>
              <span className="text-white">
                {new Date(deliverable.expiry_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Annotations */}
        {deliverable.annotations.length > 0 && (
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              Comments ({deliverable.annotations.length})
            </h3>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {deliverable.annotations.map((annotation) => (
                <AnnotationItem key={annotation.id} annotation={annotation} />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 mt-auto space-y-3">
          {isPending && !showRevisionForm && (
            <>
              <button
                onClick={() => onApprove(deliverable.id)}
                className="w-full py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => setShowRevisionForm(true)}
                className="w-full py-2.5 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Request Changes
              </button>
            </>
          )}

          {showRevisionForm && (
            <div className="space-y-3">
              <textarea
                value={revisionComment}
                onChange={(e) => setRevisionComment(e.target.value)}
                placeholder={deliverable.file_type === "video" 
                  ? `Describe changes needed${currentTimecode ? ` (at ${formatDuration(currentTimecode)})` : ""}...`
                  : "Describe the changes you'd like..."}
                className="w-full px-3 py-2 text-sm text-white bg-slate-800 border border-slate-700 rounded-lg placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowRevisionForm(false);
                    setRevisionComment("");
                  }}
                  className="flex-1 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRevision}
                  disabled={!revisionComment.trim()}
                  className="flex-1 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {!showRevisionForm && (
            <button
              onClick={() => onDownload(deliverable.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-400 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          )}
        </div>
      </div>

      {/* Mobile context (bottom sheet style) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white text-sm truncate max-w-[200px]">
              {deliverable.title}
            </h2>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusColors.bg} ${statusColors.text}`}>
              {formatApprovalStatus(deliverable.approval_status)}
            </span>
          </div>
          <button
            onClick={() => onDownload(deliverable.id)}
            className="p-2 text-blue-400 bg-blue-900/30 rounded-lg"
            aria-label="Download"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
        
        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(deliverable.id)}
              className="flex-1 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg"
            >
              Approve
            </button>
            <button
              onClick={() => setShowRevisionForm(true)}
              className="flex-1 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg"
            >
              Request Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface AnnotationItemProps {
  annotation: Annotation;
}

function AnnotationItem({ annotation }: AnnotationItemProps) {
  return (
    <div className={`text-sm ${annotation.resolved ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-white">{annotation.author_name}</span>
        {annotation.timecode !== undefined && (
          <span className="px-1.5 py-0.5 text-xs bg-slate-800 text-slate-400 rounded">
            {formatDuration(annotation.timecode)}
          </span>
        )}
      </div>
      <p className="text-slate-400">{annotation.text}</p>
    </div>
  );
}

function formatApprovalStatus(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending Review",
    approved: "Approved",
    revision_requested: "Changes Requested",
    delivered: "Delivered",
  };
  return labels[status] || status;
}

export default PortalLightbox;
