/**
 * Deliverable Detail Modal
 * 
 * Full-screen lightbox for viewing deliverable details:
 * - Image/video preview with navigation
 * - Metadata sidebar
 * - Comments with video timecode support (Frame.io style)
 * - Approve / Request Change actions
 * - Download button
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { 
  ClientDeliverable, 
  DeliverableAsset, 
  DeliverableComment 
} from "./types";

interface DeliverableDetailModalProps {
  deliverable: ClientDeliverable;
  comments: DeliverableComment[];
  selectedAssetIndex: number;
  onAssetChange: (index: number) => void;
  onClose: () => void;
  onApprove: () => void;
  onRequestChange: (reason: string, timecode?: number) => void;
  onDownload: (asset: DeliverableAsset) => void;
  isLoading: boolean;
  projectId: string;
}

// Status config
const STATUS_CONFIG = {
  delivered: { label: 'Needs Review', color: 'text-amber-600 dark:text-amber-400' },
  approved: { label: 'Approved', color: 'text-emerald-600 dark:text-emerald-400' },
  pending: { label: 'In Progress', color: 'text-blue-600 dark:text-blue-400' },
  revision_requested: { label: 'Changes Requested', color: 'text-orange-600 dark:text-orange-400' },
};

export default function DeliverableDetailModal({
  deliverable,
  comments: initialComments,
  selectedAssetIndex,
  onAssetChange,
  onClose,
  onApprove,
  onRequestChange,
  onDownload,
  isLoading,
  projectId,
}: DeliverableDetailModalProps) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [currentTimecode, setCurrentTimecode] = useState<number | undefined>();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(initialComments);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentAsset = deliverable.assets[selectedAssetIndex];
  const statusConfig = STATUS_CONFIG[deliverable.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const canApprove = deliverable.status === 'delivered';
  const isVideo = currentAsset?.file_type === 'video';

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && selectedAssetIndex > 0) {
        onAssetChange(selectedAssetIndex - 1);
      }
      if (e.key === 'ArrowRight' && selectedAssetIndex < deliverable.assets.length - 1) {
        onAssetChange(selectedAssetIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, selectedAssetIndex, deliverable.assets.length, onAssetChange]);

  // Handle video time update for timecode comments
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTimecode(Math.floor(videoRef.current.currentTime));
    }
  }, []);

  // Seek video to timecode when clicking a comment
  const seekToTimecode = useCallback((timecode: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timecode;
      videoRef.current.play();
    }
  }, []);

  // Submit request change with current timecode
  const handleSubmitRequest = () => {
    if (requestReason.trim().length < 10) {
      alert('Please provide a more detailed reason (at least 10 characters)');
      return;
    }
    onRequestChange(requestReason, currentTimecode);
  };

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Not authenticated');
      
      const res = await fetch(`/api/client/deliverables/${deliverable.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: newComment,
          timecode: isVideo ? currentTimecode : undefined,
          media_asset_id: currentAsset?.id,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to post comment');
      
      const data = await res.json();
      setComments([...comments, data.comment]);
      setNewComment('');
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex"
      role="dialog"
      aria-modal="true"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Media viewer */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative">
          {/* Previous button */}
          {selectedAssetIndex > 0 && (
            <button
              onClick={() => onAssetChange(selectedAssetIndex - 1)}
              className="absolute left-4 z-10 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Previous"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Media */}
          <div className="max-w-5xl max-h-[70vh] lg:max-h-[85vh] w-full">
            {currentAsset?.file_type === 'video' ? (
              <video
                ref={videoRef}
                src={currentAsset.preview_url}
                poster={currentAsset.thumbnail_url}
                controls
                className="w-full h-full max-h-[70vh] lg:max-h-[85vh] object-contain rounded-lg"
                onTimeUpdate={handleTimeUpdate}
              />
            ) : currentAsset?.preview_url || currentAsset?.thumbnail_url ? (
              <img
                src={currentAsset.preview_url || currentAsset.thumbnail_url}
                alt={currentAsset.title || deliverable.title}
                className="w-full h-full max-h-[70vh] lg:max-h-[85vh] object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-slate-800 rounded-lg">
                <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Next button */}
          {selectedAssetIndex < deliverable.assets.length - 1 && (
            <button
              onClick={() => onAssetChange(selectedAssetIndex + 1)}
              className="absolute right-4 lg:right-[340px] z-10 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Next"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Asset navigation dots */}
          {deliverable.assets.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {deliverable.assets.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onAssetChange(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === selectedAssetIndex
                      ? 'bg-white'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to asset ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col max-h-[40vh] lg:max-h-screen overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 shrink-0">
            <h2 className="font-semibold text-white mb-1 line-clamp-2">
              {deliverable.title}
            </h2>
            <p className={`text-sm ${statusConfig.color}`}>
              {statusConfig.label}
            </p>
          </div>

          {/* Metadata */}
          <div className="p-4 border-b border-slate-800 space-y-2 text-sm shrink-0">
            {currentAsset && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white">{currentAsset.file_type.toUpperCase()}</span>
                </div>
                {currentAsset.file_size && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Size</span>
                    <span className="text-white">{formatFileSize(currentAsset.file_size)}</span>
                  </div>
                )}
                {currentAsset.width && currentAsset.height && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resolution</span>
                    <span className="text-white">{currentAsset.width} × {currentAsset.height}</span>
                  </div>
                )}
                {currentAsset.duration && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration</span>
                    <span className="text-white">{formatDuration(currentAsset.duration)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                Comments ({comments.length})
              </h3>
              
              {comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <CommentItem 
                      key={comment.id} 
                      comment={comment}
                      isVideo={isVideo}
                      onSeek={seekToTimecode}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No comments yet</p>
              )}

              {/* New comment form */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isVideo && currentTimecode !== undefined 
                    ? `Add a comment at ${formatDuration(currentTimecode)}...`
                    : "Add a comment..."
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="mt-2 w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-slate-800 space-y-2 shrink-0">
            {/* Download button */}
            {currentAsset?.download_url && (
              <button
                onClick={() => onDownload(currentAsset)}
                className="w-full py-2.5 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Original
              </button>
            )}

            {/* Approve / Request Change buttons */}
            {canApprove && !showRequestForm && (
              <div className="flex gap-2">
                <button
                  onClick={onApprove}
                  disabled={isLoading}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Request Changes
                </button>
              </div>
            )}

            {/* Request change form */}
            {showRequestForm && (
              <div className="space-y-2">
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder={isVideo && currentTimecode !== undefined
                    ? `Describe the changes needed at ${formatDuration(currentTimecode)}...`
                    : "Describe the changes needed..."
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitRequest}
                    disabled={isLoading || requestReason.trim().length < 10}
                    className="flex-1 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRequestForm(false);
                      setRequestReason('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Revision already requested */}
            {deliverable.status === 'revision_requested' && deliverable.revision_reason && (
              <div className="p-3 bg-orange-900/20 border border-orange-800 rounded-lg">
                <p className="text-xs font-medium text-orange-400 mb-1">Changes Requested:</p>
                <p className="text-sm text-orange-200">{deliverable.revision_reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Comment Item Component
function CommentItem({ 
  comment, 
  isVideo,
  onSeek 
}: { 
  comment: DeliverableComment;
  isVideo: boolean;
  onSeek: (timecode: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
        comment.author.is_team
          ? 'bg-blue-600 text-white'
          : 'bg-slate-700 text-slate-300'
      }`}>
        {comment.author.avatar ? (
          <img src={comment.author.avatar} alt="" className="w-8 h-8 rounded-full" />
        ) : (
          comment.author.name.charAt(0).toUpperCase()
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-white">
            {comment.author.name}
          </span>
          {comment.author.is_team && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-600 text-white rounded">
              TEAM
            </span>
          )}
        </div>
        <p className="text-sm text-slate-300 break-words">{comment.body}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-500">
            {formatTimeAgo(comment.created_at)}
          </span>
          {isVideo && comment.timecode !== undefined && (
            <button
              onClick={() => onSeek(comment.timecode!)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              @{formatDuration(comment.timecode)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Utility functions
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
