"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import type { AssetType } from "@/lib/types/storage";

export interface UploadModalProps {
  projectId: string;
  onClose: () => void;
  onComplete: () => void;
  defaultAssetType?: AssetType;
}

interface FileWithPreview {
  file: File;
  id: string;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

/**
 * Upload Modal
 * 
 * Features:
 * - Drag & drop zone
 * - Multiple file selection
 * - Client-side preview generation
 * - Per-file progress tracking
 * - Asset type selection (raw/deliverable/wip)
 * - Bulk metadata (tags, notes)
 * - Retry failed uploads
 */
export function UploadModal({
  projectId,
  onClose,
  onComplete,
  defaultAssetType = "raw",
}: UploadModalProps) {
  const { supabase, session, user } = useSupabase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [assetType, setAssetType] = useState<AssetType>(defaultAssetType);
  const [tags, setTags] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  // Accepted file types
  const acceptedTypes = {
    image: ".jpg,.jpeg,.png,.heic,.cr2,.nef,.arw,.dng,.gif,.webp,.tiff",
    video: ".mp4,.mov,.webm,.mkv,.avi",
    document: ".pdf",
  };
  const acceptString = Object.values(acceptedTypes).join(",");

  // Max file size: 5GB
  const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Create preview for images
  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(undefined);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  };

  // Handle file selection
  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles: FileWithPreview[] = [];
    
    for (const file of Array.from(fileList)) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} exceeds 5GB limit`);
        continue;
      }

      const preview = await createPreview(file);
      newFiles.push({
        file,
        id: generateId(),
        preview,
        progress: 0,
        status: "pending",
      });
    }

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Remove file from list
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Upload single file
  const uploadFile = async (fileWithPreview: FileWithPreview): Promise<boolean> => {
    if (!session || !user) return false;

    const { file, id } = fileWithPreview;
    
    // Update status
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "uploading" as const } : f))
    );

    try {
      // Build storage path
      const timestamp = new Date().toISOString().split("T")[0];
      const slugifiedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueSuffix = Math.random().toString(36).substring(2, 8);
      const storagePath = `projects/${projectId}/${assetType}/${timestamp}_${user.id.substring(0, 8)}_${uniqueSuffix}_${slugifiedName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Save metadata
      const { data: mediaAsset, error: dbError } = await supabase.from("media_assets").insert({
        project_id: projectId,
        uploaded_by: user.id,
        storage_path: uploadData.path,
        size: file.size,
        mime_type: file.type,
        asset_type: assetType,
      }).select('id').single();

      if (dbError) throw dbError;

      // Trigger thumbnail generation for images (fire and forget)
      if (file.type.startsWith('image/')) {
        console.log('🖼️ MODAL: Triggering thumbnail for', mediaAsset.id);
        fetch('/api/thumbnails/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaId: mediaAsset.id }),
        }).catch(err => console.warn('Thumbnail request failed:', err));
      }

      // Update status
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "complete" as const, progress: 100 } : f))
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "error" as const, error: message } : f))
      );
      return false;
    }
  };

  // Upload all files
  const uploadAll = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    let completed = 0;

    for (const fileWithPreview of files) {
      if (fileWithPreview.status === "complete") {
        completed++;
        continue;
      }

      await uploadFile(fileWithPreview);
      completed++;
      setOverallProgress(Math.round((completed / files.length) * 100));
    }

    setIsUploading(false);

    // Check if all succeeded
    const allComplete = files.every((f) => f.status === "complete");
    if (allComplete) {
      onComplete();
    }
  };

  // Retry failed uploads
  const retryFailed = async () => {
    const failedFiles = files.filter((f) => f.status === "error");
    if (failedFiles.length === 0) return;

    setIsUploading(true);
    
    for (const file of failedFiles) {
      // Reset status
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "pending" as const, error: undefined } : f))
      );
      await uploadFile(file);
    }

    setIsUploading(false);
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Get file icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return (
        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (mimeType.startsWith("video/")) {
      return (
        <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, []);

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const completeCount = files.filter((f) => f.status === "complete").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Add files for this shoot</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Upload images, videos, or documents
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${isDragging
                ? "border-amber-500 bg-amber-500/10"
                : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptString}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />
            <svg className="w-12 h-12 mx-auto text-zinc-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-white font-medium mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-zinc-500">
              JPG, PNG, RAW, MP4, MOV, PDF — Max 5GB per file
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Asset Type
              </label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value as AssetType)}
                disabled={isUploading}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="raw">Raw / Original</option>
                <option value="wip">Work in Progress</option>
                <option value="deliverable">Deliverable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isUploading}
                placeholder="wedding, portraits, edited"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>{files.length} file{files.length !== 1 ? "s" : ""} selected</span>
                {completeCount > 0 && (
                  <span className="text-green-400">{completeCount} uploaded</span>
                )}
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((fileWithPreview) => (
                  <div
                    key={fileWithPreview.id}
                    className={`
                      flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border
                      ${fileWithPreview.status === "error" ? "border-red-500/50" : "border-zinc-700/50"}
                    `}
                  >
                    {/* Preview/Icon */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                      {fileWithPreview.preview ? (
                        <img
                          src={fileWithPreview.preview}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getFileIcon(fileWithPreview.file.type)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{fileWithPreview.file.name}</p>
                      <p className="text-xs text-zinc-500">
                        {formatSize(fileWithPreview.file.size)}
                        {fileWithPreview.status === "error" && (
                          <span className="text-red-400 ml-2">{fileWithPreview.error}</span>
                        )}
                      </p>
                      
                      {/* Progress bar */}
                      {fileWithPreview.status === "uploading" && (
                        <div className="mt-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 transition-all"
                            style={{ width: `${fileWithPreview.progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Status/Remove */}
                    <div className="shrink-0">
                      {fileWithPreview.status === "complete" ? (
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : fileWithPreview.status === "uploading" ? (
                        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      ) : fileWithPreview.status === "error" ? (
                        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <button
                          onClick={() => removeFile(fileWithPreview.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800 bg-zinc-900/50">
          {/* Overall progress */}
          {isUploading && (
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <div className="w-32 h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span>{overallProgress}%</span>
            </div>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {errorCount > 0 && !isUploading && (
              <button
                onClick={retryFailed}
                className="px-4 py-2 text-amber-400 hover:text-amber-300 transition-colors"
              >
                Retry failed ({errorCount})
              </button>
            )}
            
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {completeCount === files.length && files.length > 0 ? "Done" : "Cancel"}
            </button>
            
            {pendingCount > 0 && (
              <button
                onClick={uploadAll}
                disabled={isUploading || files.length === 0}
                className="px-6 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : `Upload ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;
