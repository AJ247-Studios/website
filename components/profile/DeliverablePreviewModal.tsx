/**
 * DeliverablePreviewModal Component
 * 
 * Lightbox/modal for full deliverable preview:
 * - Full-res image/video preview
 * - Annotations panel (timestamped comments)
 * - Approve/Request revision actions
 * - Download button
 * - Navigation between deliverables
 */

"use client";

import { useEffect, useState, useRef } from "react";
import type { Deliverable, Annotation } from "@/lib/types/portal";

interface DeliverablePreviewModalProps {
  media: Deliverable | null;
  annotations?: Annotation[];
  allItems?: Deliverable[];
  onClose: () => void;
  onApprove: (id: string) => void;
  onRequestRevision: (id: string, comment: string) => void;
  onDownload: (id: string) => void;
  onNavigate?: (id: string) => void;
}

export function DeliverablePreviewModal({
  media,
  annotations = [],
  allItems = [],
  onClose,
  onApprove,
  onRequestRevision,
  onDownload,
  onNavigate,
}: DeliverablePreviewModalProps) {
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [revisionComment, setRevisionComment] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!media) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") navigatePrev();
      if (e.key === "ArrowRight") navigateNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [media, allItems]);

  // Track preview analytics
  useEffect(() => {
    if (media) {
      // Analytics: track preview open
      // analytics.track("deliverable_preview", { id: media.id, media_type: media.file_type });
    }
  }, [media]);

  if (!media) return null;

  const currentIndex = allItems.findIndex((item) => item.id === media.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allItems.length - 1 && currentIndex !== -1;

  const navigatePrev = () => {
    if (hasPrev && onNavigate) {
      onNavigate(allItems[currentIndex - 1].id);
    }
  };

  const navigateNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(allItems[currentIndex + 1].id);
    }
  };

  const handleApprove = () => {
    onApprove(media.id);
    // Analytics: track approval
    // analytics.track("deliverable_approve", { id: media.id });
  };

  const handleRequestRevision = () => {
    if (revisionComment.trim()) {
      onRequestRevision(media.id, revisionComment);
      setRevisionComment("");
      setShowRevisionForm(false);
    }
  };

  const handleDownload = () => {
    onDownload(media.id);
    // Analytics: track download
    // analytics.track("download_initiated", { id: media.id, resolution: "full" });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative w-full h-full flex flex-col max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h3 className="text-white font-medium truncate max-w-xs sm:max-w-md">
              {media.title}
            </h3>
            <span className="text-white/60 text-sm hidden sm:inline">
              {formatSize(media.file_size)}
              {media.resolution && ` • ${media.resolution.width}×${media.resolution.height}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {annotations.length > 0 && (
              <button
                onClick={() => setShowAnnotations(!showAnnotations)}
                className={`p-2 rounded-lg transition-colors ${
                  showAnnotations
                    ? "bg-blue-600 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                title="Toggle annotations"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {annotations.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-blue-500 text-white rounded-full flex items-center justify-center">
                    {annotations.length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Media viewer */}
          <div className="flex-1 flex items-center justify-center relative p-4">
            {/* Navigation arrows */}
            {hasPrev && (
              <button
                onClick={navigatePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                title="Previous"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {hasNext && (
              <button
                onClick={navigateNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                title="Next"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Media display */}
            {media.file_type === "video" ? (
              <video
                ref={videoRef}
                src={media.preview_url || media.thumbnail_url}
                className="max-w-full max-h-full rounded-lg"
                controls
                autoPlay
              />
            ) : media.file_type === "image" ? (
              <img
                src={media.preview_url || media.thumbnail_url}
                alt={media.title}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white/70">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Preview not available</p>
                <button
                  onClick={handleDownload}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download to view
                </button>
              </div>
            )}
          </div>

          {/* Annotations sidebar */}
          {showAnnotations && annotations.length > 0 && (
            <div className="w-80 bg-slate-900 border-l border-slate-700 overflow-y-auto">
              <div className="p-4">
                <h4 className="text-white font-medium mb-4">Comments & Feedback</h4>
                <div className="space-y-4">
                  {annotations.map((annotation) => (
                    <AnnotationItem key={annotation.id} annotation={annotation} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <StatusBadge status={media.approval_status} />
              {media.expiry_at && (
                <span className="text-white/60 text-sm">
                  Expires {new Date(media.expiry_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {media.approval_status === "pending" && (
                <>
                  {showRevisionForm ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={revisionComment}
                        onChange={(e) => setRevisionComment(e.target.value)}
                        placeholder="What needs changing?"
                        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-48"
                        autoFocus
                      />
                      <button
                        onClick={handleRequestRevision}
                        disabled={!revisionComment.trim()}
                        className="px-3 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => setShowRevisionForm(false)}
                        className="p-2 text-white/60 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowRevisionForm(true)}
                        className="px-4 py-2.5 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        Request Change
                      </button>
                      <button
                        onClick={handleApprove}
                        className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve & Deliver
                      </button>
                    </>
                  )}
                </>
              )}
              <button
                onClick={handleDownload}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Deliverable["approval_status"] }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    revision_requested: "bg-red-500/20 text-red-300 border-red-500/30",
    delivered: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  };

  const labels: Record<string, string> = {
    pending: "Pending Review",
    approved: "Approved",
    revision_requested: "Revision Requested",
    delivered: "Delivered",
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function AnnotationItem({ annotation }: { annotation: Annotation }) {
  return (
    <div className={`p-3 rounded-lg ${annotation.resolved ? "bg-slate-800/50" : "bg-slate-800"}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-white text-sm font-medium">{annotation.author_name}</span>
        <span className="text-white/40 text-xs">
          {new Date(annotation.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className={`text-sm ${annotation.resolved ? "text-white/40 line-through" : "text-white/80"}`}>
        {annotation.text}
      </p>
      {annotation.timecode !== undefined && (
        <span className="inline-block mt-2 px-2 py-0.5 bg-blue-600/30 text-blue-300 text-xs rounded">
          @ {formatTimecode(annotation.timecode)}
        </span>
      )}
      {annotation.resolved && (
        <span className="inline-block mt-2 ml-2 px-2 py-0.5 bg-emerald-600/30 text-emerald-300 text-xs rounded">
          Resolved
        </span>
      )}
    </div>
  );
}

function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default DeliverablePreviewModal;
