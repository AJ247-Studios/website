/**
 * DeliverableCard Component
 * 
 * Displays a single deliverable as a card (grid view) or row (list view).
 * Features:
 * - Thumbnail preview with fallback
 * - Status badge
 * - Quick action buttons
 * - Asset count indicator
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Eye, 
  Download, 
  MessageSquare, 
  Check, 
  RefreshCw,
  Clock,
  FileVideo,
  FileImage,
  FileAudio,
  FileText,
  File,
  ChevronRight,
  Loader2
} from "lucide-react";
import type { ClientDeliverable, FileType } from "@/lib/types/deliverables";
import { STATUS_CONFIG, formatFileSize } from "@/lib/types/deliverables";

interface DeliverableCardProps {
  deliverable: ClientDeliverable;
  viewMode: 'grid' | 'list';
  onSelect: () => void;
  onApprove: () => void;
  onRequestChange: (reason: string) => void;
  isLoading?: boolean;
}

const FILE_ICONS: Record<FileType, typeof FileVideo> = {
  video: FileVideo,
  image: FileImage,
  audio: FileAudio,
  document: FileText,
  archive: File,
  other: File,
};

export default function DeliverableCard({
  deliverable,
  viewMode,
  onSelect,
  onApprove,
  onRequestChange,
  isLoading = false,
}: DeliverableCardProps) {
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [imageError, setImageError] = useState(false);

  const statusConfig = STATUS_CONFIG[deliverable.status];
  const primaryAsset = deliverable.assets?.[0];
  const assetCount = deliverable.assets?.length || 0;
  const FileIcon = FILE_ICONS[primaryAsset?.file_type || 'other'];
  
  // Can approve/request changes only if status is 'delivered'
  const canReview = deliverable.status === 'delivered';

  // Handle change request submission
  const handleSubmitChange = () => {
    if (changeReason.trim().length >= 10) {
      onRequestChange(changeReason);
      setShowChangeDialog(false);
      setChangeReason('');
    }
  };

  // Due date formatting
  const dueDate = deliverable.due_date 
    ? new Date(deliverable.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const isOverdue = deliverable.due_date && new Date(deliverable.due_date) < new Date() && deliverable.status !== 'approved';

  if (viewMode === 'list') {
    return (
      <div 
        className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
        onClick={onSelect}
      >
        {/* Thumbnail */}
        <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
          {deliverable.thumbnail_url && !imageError ? (
            <Image
              src={deliverable.thumbnail_url}
              alt={deliverable.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-slate-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-slate-900 dark:text-white truncate">
              {deliverable.title}
            </h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span>{assetCount} {assetCount === 1 ? 'file' : 'files'}</span>
            {deliverable.comment_count ? (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {deliverable.comment_count}
              </span>
            ) : null}
            {dueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                <Clock className="w-3.5 h-3.5" />
                {dueDate}
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {canReview && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onApprove(); }}
                disabled={isLoading}
                className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 disabled:opacity-50"
                title="Approve"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowChangeDialog(true); }}
                disabled={isLoading}
                className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 disabled:opacity-50"
                title="Request Changes"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    );
  }

  // Grid view (card)
  return (
    <>
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg cursor-pointer group"
        onClick={onSelect}
      >
        {/* Thumbnail */}
        <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-800">
          {deliverable.thumbnail_url && !imageError ? (
            <Image
              src={deliverable.thumbnail_url}
              alt={deliverable.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FileIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </div>
          )}

          {/* Asset count badge */}
          {assetCount > 1 && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-md">
              {assetCount} files
            </div>
          )}

          {/* Status badge */}
          <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-md ${statusConfig.bg} ${statusConfig.text}`}>
            {statusConfig.label}
          </div>

          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className="p-2 rounded-full bg-white/90 text-slate-700 hover:bg-white transition-colors"
              title="View"
            >
              <Eye className="w-5 h-5" />
            </button>
            {canReview && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onApprove(); }}
                  disabled={isLoading}
                  className="p-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  title="Approve"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowChangeDialog(true); }}
                  disabled={isLoading}
                  className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                  title="Request Changes"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Card content */}
        <div className="p-4">
          <h3 className="font-medium text-slate-900 dark:text-white truncate mb-1">
            {deliverable.title}
          </h3>
          {deliverable.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
              {deliverable.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-3">
              {deliverable.comment_count ? (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {deliverable.comment_count}
                </span>
              ) : null}
            </div>
            {dueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                <Clock className="w-3.5 h-3.5" />
                {dueDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Change request dialog */}
      {showChangeDialog && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowChangeDialog(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Request Changes
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Please describe the changes you'd like to see. Be as specific as possible.
            </p>
            <textarea
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Describe the changes needed..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex items-center justify-between mt-4">
              <span className={`text-xs ${changeReason.trim().length < 10 ? 'text-slate-400' : 'text-emerald-500'}`}>
                {changeReason.trim().length}/10 characters minimum
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowChangeDialog(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitChange}
                  disabled={changeReason.trim().length < 10 || isLoading}
                  className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
