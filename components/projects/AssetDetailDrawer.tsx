"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { MediaAsset, AssetType, MediaStatus } from "@/lib/types/storage";
import { getPreviewUrl, formatFileSize, formatDuration, getFileTypeFromMime } from "@/utils/getPreviewUrl";
import { safeStatus, getStatusLabel } from "@/utils/safeStatus";

export interface AssetDetailDrawerProps {
  asset: MediaAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (asset: MediaAsset) => void;
  onUpdate?: (assetId: string, updates: Partial<MediaAsset>) => Promise<void>;
  onDelete?: (assetId: string) => Promise<void>;
  onAddToDeliverable?: (asset: MediaAsset) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  uploaderName?: string;
}

const STATUS_OPTIONS: { value: MediaStatus; label: string; color: string }[] = [
  { value: 'uploaded', label: 'Uploaded', color: 'bg-zinc-500' },
  { value: 'processing', label: 'Processing', color: 'bg-amber-500' },
  { value: 'ready', label: 'Ready', color: 'bg-green-500' },
  { value: 'failed', label: 'Failed', color: 'bg-red-500' },
];

const TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: 'raw', label: 'Raw' },
  { value: 'wip', label: 'In Progress' },
  { value: 'deliverable', label: 'Deliverable' },
];

/**
 * AssetDetailDrawer Component
 * 
 * Side drawer for viewing and editing asset details:
 * - Large preview (image/video player)
 * - Full metadata display
 * - Edit mode for title, caption, tags, status
 * - Actions: Download, Replace, Delete, Add to Deliverable
 * - Keyboard navigation (Escape to close, arrow keys for prev/next)
 */
export function AssetDetailDrawer({
  asset,
  isOpen,
  onClose,
  onDownload,
  onUpdate,
  onDelete,
  onAddToDeliverable,
  canEdit = false,
  canDelete = false,
  uploaderName,
}: AssetDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    caption: '',
    tags: [] as string[],
    asset_type: 'raw' as AssetType,
  });
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Reset form when asset changes
  useEffect(() => {
    if (asset) {
      setEditForm({
        title: asset.title || '',
        caption: asset.caption || '',
        tags: asset.tags || [],
        asset_type: asset.asset_type,
      });
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [asset]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        if (isEditing) {
          setIsEditing(false);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEditing, showDeleteConfirm, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isOpen]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!asset || !onUpdate) return;
    
    setIsSaving(true);
    try {
      await onUpdate(asset.id, {
        title: editForm.title || undefined,
        caption: editForm.caption || undefined,
        tags: editForm.tags.length > 0 ? editForm.tags : undefined,
        asset_type: editForm.asset_type,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  }, [asset, onUpdate, editForm]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!asset || !onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(asset.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [asset, onDelete, onClose]);

  // Add tag
  const handleAddTag = useCallback(() => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !editForm.tags.includes(tag)) {
      setEditForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setNewTag('');
    }
  }, [newTag, editForm.tags]);

  // Remove tag
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove),
    }));
  }, []);

  if (!asset) return null;

  const fileType = getFileTypeFromMime(asset.mime_type);
  const previewUrl = getPreviewUrl(asset, { useOriginal: true });
  const isImage = fileType === 'image';
  const isVideo = fileType === 'video';
  const isAudio = fileType === 'audio';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={`
          fixed right-0 top-0 bottom-0 w-full max-w-lg bg-zinc-900 border-l border-zinc-800 z-50
          transform transition-transform duration-300 ease-out overflow-hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Asset details"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
            <h2 className="text-lg font-semibold text-white truncate pr-4">
              {isEditing ? 'Edit Asset' : (asset.title || asset.filename)}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Preview */}
            <div className="relative bg-zinc-950 aspect-video flex items-center justify-center">
              {isImage && (
                <img
                  src={previewUrl}
                  alt={asset.title || asset.filename}
                  className="max-w-full max-h-full object-contain"
                />
              )}
              {isVideo && (
                <video
                  src={previewUrl}
                  controls
                  className="max-w-full max-h-full"
                  poster={asset.thumbnail_path ? getPreviewUrl(asset) : undefined}
                >
                  Your browser does not support video playback.
                </video>
              )}
              {isAudio && (
                <div className="text-center p-8">
                  <svg className="w-16 h-16 mx-auto text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <audio src={previewUrl} controls className="w-full max-w-xs mx-auto" />
                </div>
              )}
              {!isImage && !isVideo && !isAudio && (
                <div className="text-center p-8">
                  <svg className="w-16 h-16 mx-auto text-zinc-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-zinc-400">Preview not available</p>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2 p-4 border-b border-zinc-800">
              <button
                onClick={() => onDownload(asset)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              {onAddToDeliverable && (
                <button
                  onClick={() => onAddToDeliverable(asset)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to Delivery
                </button>
              )}
            </div>

            {/* Metadata / Edit Form */}
            <div className="p-4 space-y-4">
              {isEditing ? (
                /* Edit Mode */
                <>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={asset.filename}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                      Caption
                    </label>
                    <textarea
                      value={editForm.caption}
                      onChange={(e) => setEditForm(prev => ({ ...prev, caption: e.target.value }))}
                      placeholder="Add a caption..."
                      rows={3}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                      Type
                    </label>
                    <select
                      value={editForm.asset_type}
                      onChange={(e) => setEditForm(prev => ({ ...prev, asset_type: e.target.value as AssetType }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    >
                      {TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editForm.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 text-zinc-300 text-sm rounded-full"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="p-0.5 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Add tag..."
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      />
                      <button
                        onClick={handleAddTag}
                        disabled={!newTag.trim()}
                        className="px-3 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* View Mode */
                <>
                  {/* Title & Caption */}
                  {(asset.title || asset.caption) && (
                    <div className="space-y-2">
                      {asset.title && asset.title !== asset.filename && (
                        <h3 className="text-lg font-medium text-white">{asset.title}</h3>
                      )}
                      {asset.caption && (
                        <p className="text-sm text-zinc-400">{asset.caption}</p>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {asset.tags && asset.tags.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {asset.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Info */}
                  <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      File Information
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-zinc-500">Filename</span>
                        <p className="text-white truncate" title={asset.filename}>{asset.filename}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Size</span>
                        <p className="text-white">{formatFileSize(asset.file_size)}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Type</span>
                        <p className="text-white capitalize">{asset.asset_type}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Status</span>
                        <p className="text-white capitalize">{getStatusLabel(safeStatus(asset))}</p>
                      </div>
                      {asset.mime_type && (
                        <div>
                          <span className="text-zinc-500">Format</span>
                          <p className="text-white">{asset.mime_type}</p>
                        </div>
                      )}
                      {asset.width && asset.height && (
                        <div>
                          <span className="text-zinc-500">Dimensions</span>
                          <p className="text-white">{asset.width} × {asset.height}</p>
                        </div>
                      )}
                      {asset.duration_seconds && (
                        <div>
                          <span className="text-zinc-500">Duration</span>
                          <p className="text-white">{formatDuration(asset.duration_seconds)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Info */}
                  <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Upload Information
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Uploaded by</span>
                        <span className="text-white">{uploaderName || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Uploaded</span>
                        <span className="text-white">
                          {new Date(asset.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {asset.updated_at !== asset.created_at && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Modified</span>
                          <span className="text-white">
                            {new Date(asset.updated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  {(asset.view_count || asset.download_count) && (
                    <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                      <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Statistics
                      </h4>
                      
                      <div className="flex gap-6">
                        {asset.view_count !== undefined && (
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-white">{asset.view_count}</p>
                            <p className="text-xs text-zinc-500">Views</p>
                          </div>
                        )}
                        {asset.download_count !== undefined && (
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-white">{asset.download_count}</p>
                            <p className="text-xs text-zinc-500">Downloads</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-zinc-800 px-4 py-3 shrink-0">
            {isEditing ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : showDeleteConfirm ? (
              <div className="space-y-3">
                <p className="text-sm text-zinc-400 text-center">
                  Are you sure you want to delete this file? This action cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {canEdit && onUpdate && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                )}
                {canDelete && onDelete && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AssetDetailDrawer;
