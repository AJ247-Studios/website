"use client";

import React, { useState, useCallback } from "react";
import {
  DocumentIcon,
  FilmIcon,
  PhotoIcon,
  FolderIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  FolderArrowDownIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

/**
 * FileList & FileRow Components
 * 
 * Displays uploaded media assets with:
 * - Status badges (processing, ready, published)
 * - Quick-edit controls
 * - Bulk selection
 * - Processing status visibility
 */

interface MediaAsset {
  id: string;
  filename: string;
  r2_path: string;
  mime_type: string;
  file_size: number;
  file_type: 'raw' | 'deliverable' | 'portfolio' | 'team-wip';
  upload_status: 'uploading' | 'processing' | 'complete' | 'failed';
  created_at: string;
  updated_at: string;
  thumbnail_path?: string;
  duration_seconds?: number;
  resolution?: { width: number; height: number };
  tags?: string[];
  project_id?: string;
  project_name?: string;
  qa_status?: 'pending' | 'approved' | 'rejected';
  qa_notes?: string;
  publish_status?: 'draft' | 'published' | 'unpublished';
  processing_job?: {
    id: string;
    type: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress?: number;
    error_message?: string;
  };
}

interface FileRowProps {
  asset: MediaAsset;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onPreview: (asset: MediaAsset) => void;
  onEdit: (asset: MediaAsset) => void;
  onDelete: (asset: MediaAsset) => void;
  onDownload: (asset: MediaAsset) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('video/')) {
    return <FilmIcon className="w-5 h-5" />;
  }
  if (mimeType.startsWith('image/')) {
    return <PhotoIcon className="w-5 h-5" />;
  }
  if (mimeType.includes('zip') || mimeType.includes('rar')) {
    return <FolderIcon className="w-5 h-5" />;
  }
  return <DocumentIcon className="w-5 h-5" />;
}

function StatusBadge({ status, type }: { status: string; type: 'upload' | 'qa' | 'publish' | 'processing' }) {
  const configs: Record<string, { bg: string; text: string; label: string; icon?: React.ReactNode }> = {
    // Upload status
    'uploading': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Uploading', icon: <ArrowPathIcon className="w-3 h-3 animate-spin" /> },
    'processing': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Processing', icon: <ClockIcon className="w-3 h-3" /> },
    'complete': { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Ready', icon: <CheckCircleIcon className="w-3 h-3" /> },
    'failed': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Failed', icon: <ExclamationCircleIcon className="w-3 h-3" /> },
    // QA status
    'pending': { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Pending' },
    'approved': { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Approved', icon: <CheckCircleIcon className="w-3 h-3" /> },
    'rejected': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rejected', icon: <ExclamationCircleIcon className="w-3 h-3" /> },
    // Publish status
    'draft': { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Draft' },
    'published': { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Published' },
    'unpublished': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Unpublished' },
    // Processing job status
    'in_progress': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'In Progress', icon: <ArrowPathIcon className="w-3 h-3 animate-spin" /> },
    'completed': { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Done', icon: <CheckCircleIcon className="w-3 h-3" /> },
  };

  const config = configs[status] || { bg: 'bg-gray-500/20', text: 'text-gray-400', label: status };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${config.bg} ${config.text}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

export function FileRow({
  asset,
  isSelected,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  onDownload,
}: FileRowProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div 
      className={`
        group flex items-center gap-4 p-4 rounded-lg transition-all
        ${isSelected ? 'bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]/50' : 'bg-white/5 hover:bg-white/10'}
      `}
    >
      {/* Checkbox */}
      <div className="shrink-0">
        <button
          onClick={() => onSelect(asset.id, !isSelected)}
          className={`
            w-5 h-5 rounded border flex items-center justify-center transition
            ${isSelected 
              ? 'bg-[#D4AF37] border-[#D4AF37]' 
              : 'border-white/30 hover:border-white/50'
            }
          `}
        >
          {isSelected && <CheckIcon className="w-3 h-3 text-black" />}
        </button>
      </div>

      {/* Thumbnail */}
      <div className="shrink-0 w-12 h-12 rounded bg-white/10 overflow-hidden flex items-center justify-center">
        {asset.thumbnail_path ? (
          <img 
            src={asset.thumbnail_path} 
            alt={asset.filename}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white/40">{getFileIcon(asset.mime_type)}</span>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreview(asset)}
            className="text-white font-medium hover:text-[#D4AF37] truncate transition"
          >
            {asset.filename}
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/60 mt-1">
          <span>{formatBytes(asset.file_size)}</span>
          {asset.duration_seconds && (
            <span>{formatDuration(asset.duration_seconds)}</span>
          )}
          {asset.resolution && (
            <span>{asset.resolution.width}×{asset.resolution.height}</span>
          )}
          <span>{formatDate(asset.created_at)}</span>
        </div>
        {/* Tags */}
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <TagIcon className="w-3 h-3 text-white/40" />
            <span className="text-xs text-white/50">{asset.tags.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Project */}
      {asset.project_name && (
        <div className="shrink-0 hidden md:block">
          <span className="text-sm text-white/60">{asset.project_name}</span>
        </div>
      )}

      {/* Status badges */}
      <div className="shrink-0 flex items-center gap-2">
        <StatusBadge status={asset.upload_status} type="upload" />
        {asset.processing_job && asset.processing_job.status !== 'completed' && (
          <StatusBadge status={asset.processing_job.status} type="processing" />
        )}
        {asset.qa_status && asset.qa_status !== 'pending' && (
          <StatusBadge status={asset.qa_status} type="qa" />
        )}
        {asset.publish_status && asset.publish_status !== 'draft' && (
          <StatusBadge status={asset.publish_status} type="publish" />
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-white/60 hover:text-white transition rounded hover:bg-white/10"
        >
          <EllipsisVerticalIcon className="w-5 h-5" />
        </button>
        
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)} 
            />
            <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl overflow-hidden">
              <button
                onClick={() => { onPreview(asset); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
              >
                <EyeIcon className="w-4 h-4" /> Preview
              </button>
              <button
                onClick={() => { onEdit(asset); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
              >
                <PencilIcon className="w-4 h-4" /> Edit Details
              </button>
              <button
                onClick={() => { onDownload(asset); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
              >
                <ArrowDownTrayIcon className="w-4 h-4" /> Download
              </button>
              <hr className="border-white/10 my-1" />
              <button
                onClick={() => { onDelete(asset); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
              >
                <TrashIcon className="w-4 h-4" /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface FileListProps {
  assets: MediaAsset[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onPreview: (asset: MediaAsset) => void;
  onEdit: (asset: MediaAsset) => void;
  onDelete: (asset: MediaAsset) => void;
  onDownload: (asset: MediaAsset) => void;
  onBulkAction?: (action: 'edit' | 'delete' | 'download' | 'publish' | 'vault', ids: string[]) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function FileList({
  assets,
  selectedIds,
  onSelectionChange,
  onPreview,
  onEdit,
  onDelete,
  onDownload,
  onBulkAction,
  isLoading = false,
  emptyMessage = "No files uploaded yet",
}: FileListProps) {
  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === assets.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(assets.map(a => a.id)));
    }
  }, [assets, selectedIds, onSelectionChange]);

  const handleSelect = useCallback((id: string, selected: boolean) => {
    const newSelection = new Set(selectedIds);
    if (selected) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    onSelectionChange(newSelection);
  }, [selectedIds, onSelectionChange]);

  const allSelected = assets.length > 0 && selectedIds.size === assets.length;
  const someSelected = selectedIds.size > 0;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-white/5 rounded-lg h-20" />
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-xl">
        <FolderIcon className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <p className="text-white/60">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between py-2 px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleSelectAll}
            className={`
              w-5 h-5 rounded border flex items-center justify-center transition
              ${allSelected 
                ? 'bg-[#D4AF37] border-[#D4AF37]' 
                : someSelected
                  ? 'bg-[#D4AF37]/50 border-[#D4AF37]/50'
                  : 'border-white/30 hover:border-white/50'
              }
            `}
          >
            {allSelected && <CheckIcon className="w-3 h-3 text-black" />}
            {someSelected && !allSelected && <div className="w-2 h-0.5 bg-black" />}
          </button>
          <span className="text-sm text-white/60">
            {selectedIds.size > 0 
              ? `${selectedIds.size} selected`
              : `${assets.length} files`
            }
          </span>
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && onBulkAction && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBulkAction('edit', Array.from(selectedIds))}
              className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-2"
            >
              <PencilIcon className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => onBulkAction('publish', Array.from(selectedIds))}
              className="px-3 py-1.5 text-sm bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] rounded-lg transition flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" /> Publish
            </button>
            <button
              onClick={() => onBulkAction('vault', Array.from(selectedIds))}
              className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-2"
            >
              <FolderArrowDownIcon className="w-4 h-4" /> To Vault
            </button>
            <button
              onClick={() => onBulkAction('download', Array.from(selectedIds))}
              className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" /> Download
            </button>
            <button
              onClick={() => onBulkAction('delete', Array.from(selectedIds))}
              className="px-3 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* File rows */}
      <div className="space-y-2">
        {assets.map(asset => (
          <FileRow
            key={asset.id}
            asset={asset}
            isSelected={selectedIds.has(asset.id)}
            onSelect={handleSelect}
            onPreview={onPreview}
            onEdit={onEdit}
            onDelete={onDelete}
            onDownload={onDownload}
          />
        ))}
      </div>
    </div>
  );
}

export type { MediaAsset };
