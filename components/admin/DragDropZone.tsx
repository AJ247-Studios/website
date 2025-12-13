"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PauseIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";

/**
 * DragDropZone
 * 
 * Drag & drop file upload with chunked/resumable support.
 * 
 * FEATURES:
 * - Resumable uploads after network loss
 * - Progress per file and overall
 * - Pause/resume individual uploads
 * - Batch file selection
 * - File type filtering
 */

interface ChunkUploadResult {
  uploadId: string;
  r2UploadId: string;
  r2Path: string;
  chunkSize: number;
  totalChunks: number;
  chunkUrls: { partNumber: number; url: string }[];
  expiresAt: string;
}

interface FileUploadState {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error' | 'processing';
  progress: number;
  bytesUploaded: number;
  uploadId?: string;
  r2UploadId?: string;
  r2Path?: string;
  assetId?: string;
  chunkUrls?: { partNumber: number; url: string }[];
  uploadedParts: { partNumber: number; etag: string }[];
  error?: string;
  currentChunk: number;
  totalChunks: number;
  chunkSize: number;
  startTime?: number;
  isPaused: boolean;
}

interface DragDropZoneProps {
  projectId?: string;
  clientId?: string;
  fileType: 'raw' | 'deliverable' | 'portfolio' | 'team-wip';
  maxFiles?: number;
  maxFileSize?: number; // bytes, default 5GB
  acceptedTypes?: string[]; // MIME types
  onUploadComplete?: (files: { assetId: string; filename: string; r2Path: string }[]) => void;
  onUploadError?: (filename: string, error: string) => void;
  className?: string;
  disabled?: boolean;
}

// Default accepted types per file category
const DEFAULT_ACCEPTED_TYPES: Record<string, string[]> = {
  'raw': ['video/*', 'image/*', '.zip', '.rar'],
  'deliverable': ['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp', '.pdf', '.zip'],
  'portfolio': ['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp'],
  'team-wip': ['video/*', 'image/*', '.zip', '.rar', '.pdf'],
};

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
const CONCURRENT_CHUNKS = 3; // Upload 3 chunks at a time

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatETA(bytesUploaded: number, totalBytes: number, startTime: number): string {
  if (bytesUploaded === 0) return '--:--';
  const elapsed = (Date.now() - startTime) / 1000; // seconds
  const bytesPerSecond = bytesUploaded / elapsed;
  const remainingBytes = totalBytes - bytesUploaded;
  const remainingSeconds = remainingBytes / bytesPerSecond;
  
  if (remainingSeconds < 60) return `${Math.round(remainingSeconds)}s`;
  if (remainingSeconds < 3600) return `${Math.round(remainingSeconds / 60)}m`;
  return `${Math.round(remainingSeconds / 3600)}h ${Math.round((remainingSeconds % 3600) / 60)}m`;
}

export default function DragDropZone({
  projectId,
  clientId,
  fileType,
  maxFiles = 20,
  maxFileSize = MAX_FILE_SIZE,
  acceptedTypes,
  onUploadComplete,
  onUploadError,
  className = "",
  disabled = false,
}: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  
  const acceptTypes = acceptedTypes || DEFAULT_ACCEPTED_TYPES[fileType] || [];
  const acceptString = acceptTypes.join(',');

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      abortControllersRef.current.forEach(controller => controller.abort());
    };
  }, []);

  // Check if file type is accepted
  const isAcceptedType = (file: File): boolean => {
    if (acceptTypes.length === 0) return true;
    return acceptTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
  };

  // Initialize chunked upload
  const initUpload = async (fileState: FileUploadState): Promise<ChunkUploadResult | null> => {
    try {
      const response = await fetch('/api/uploads/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: fileState.file.name,
          contentType: fileState.file.type || 'application/octet-stream',
          totalSize: fileState.file.size,
          projectId,
          clientId,
          fileType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initialize upload');
      }

      return await response.json();
    } catch (error) {
      console.error('Init upload error:', error);
      return null;
    }
  };

  // Upload a single chunk
  const uploadChunk = async (
    url: string,
    file: File,
    partNumber: number,
    chunkSize: number,
    totalChunks: number,
    signal: AbortSignal
  ): Promise<{ partNumber: number; etag: string } | null> => {
    const start = (partNumber - 1) * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: chunk,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        signal,
      });

      if (!response.ok) {
        throw new Error(`Chunk ${partNumber} upload failed`);
      }

      // Get ETag from response headers
      const etag = response.headers.get('ETag') || `"${partNumber}"`;
      return { partNumber, etag: etag.replace(/"/g, '') };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return null;
      }
      console.error(`Chunk ${partNumber} error:`, error);
      return null;
    }
  };

  // Report chunk progress to server
  const reportChunkProgress = async (
    uploadId: string,
    partNumber: number,
    etag: string,
    bytesUploaded: number
  ) => {
    try {
      await fetch('/api/uploads/chunk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, partNumber, etag, bytesUploaded }),
      });
    } catch (error) {
      console.error('Failed to report chunk progress:', error);
    }
  };

  // Complete upload
  const completeUpload = async (
    uploadId: string,
    parts: { partNumber: number; etag: string }[]
  ): Promise<{ assetId: string; r2Path: string } | null> => {
    try {
      const response = await fetch('/api/uploads/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, parts }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete upload');
      }

      return await response.json();
    } catch (error) {
      console.error('Complete upload error:', error);
      return null;
    }
  };

  // Main upload function for a file
  const uploadFile = async (fileId: string) => {
    // Get current state at start
    let currentFileState: FileUploadState | undefined;
    
    setFiles(prev => {
      currentFileState = prev.find(f => f.id === fileId);
      return prev.map(f => 
        f.id === fileId ? { ...f, status: 'uploading', startTime: Date.now() } : f
      );
    });

    if (!currentFileState) return;
    const fileState = currentFileState;

    // Create abort controller
    const abortController = new AbortController();
    abortControllersRef.current.set(fileId, abortController);

    // Initialize upload if needed
    let uploadData: ChunkUploadResult | null = null;
    if (!fileState.uploadId) {
      uploadData = await initUpload(fileState);
      if (!uploadData) {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'error', error: 'Failed to initialize upload' } : f
        ));
        onUploadError?.(fileState.file.name, 'Failed to initialize upload');
        return;
      }

      setFiles(prev => prev.map(f => 
        f.id === fileId ? {
          ...f,
          uploadId: uploadData!.uploadId,
          r2UploadId: uploadData!.r2UploadId,
          r2Path: uploadData!.r2Path,
          chunkUrls: uploadData!.chunkUrls,
          totalChunks: uploadData!.totalChunks,
          chunkSize: uploadData!.chunkSize,
        } : f
      ));
    }

    // Use upload data or existing state
    const chunkUrls = uploadData?.chunkUrls || fileState.chunkUrls || [];
    const totalChunks = uploadData?.totalChunks || fileState.totalChunks;
    const chunkSize = uploadData?.chunkSize || fileState.chunkSize || DEFAULT_CHUNK_SIZE;
    const uploadId = uploadData?.uploadId || fileState.uploadId!;
    let uploadedParts = [...fileState.uploadedParts];

    // Get remaining chunks to upload
    const uploadedPartNumbers = new Set(uploadedParts.map(p => p.partNumber));
    const remainingChunks = chunkUrls.filter(c => !uploadedPartNumbers.has(c.partNumber));

    // Upload chunks with concurrency limit
    let chunkIndex = 0;
    const uploadNextBatch = async (): Promise<void> => {
      const batch = remainingChunks.slice(chunkIndex, chunkIndex + CONCURRENT_CHUNKS);
      if (batch.length === 0) return;

      const results = await Promise.all(
        batch.map(chunk => 
          uploadChunk(
            chunk.url,
            fileState.file,
            chunk.partNumber,
            chunkSize,
            totalChunks,
            abortController.signal
          )
        )
      );

      // Check if aborted
      if (abortController.signal.aborted) {
        return;
      }

      // Process results
      for (const result of results) {
        if (result) {
          uploadedParts.push(result);
          await reportChunkProgress(uploadId, result.partNumber, result.etag, chunkSize);
        }
      }

      // Update progress
      const bytesUploaded = Math.min(uploadedParts.length * chunkSize, fileState.file.size);
      const progress = Math.round((uploadedParts.length / totalChunks) * 100);

      setFiles(prev => prev.map(f => 
        f.id === fileId ? {
          ...f,
          uploadedParts,
          currentChunk: uploadedParts.length,
          bytesUploaded,
          progress,
        } : f
      ));

      chunkIndex += CONCURRENT_CHUNKS;
      
      // Continue with next batch if not done
      if (chunkIndex < remainingChunks.length) {
        await uploadNextBatch();
      }
    };

    try {
      await uploadNextBatch();

      // Check if all chunks uploaded
      if (uploadedParts.length === totalChunks) {
        // Complete upload
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'processing' } : f
        ));

        const result = await completeUpload(uploadId, uploadedParts);
        
        if (result) {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? {
              ...f,
              status: 'completed',
              assetId: result.assetId,
              progress: 100,
            } : f
          ));
        } else {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'error', error: 'Failed to finalize upload' } : f
          ));
          onUploadError?.(fileState.file.name, 'Failed to finalize upload');
        }
      }
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'error', error: (error as Error).message } : f
      ));
      onUploadError?.(fileState.file.name, (error as Error).message);
    } finally {
      abortControllersRef.current.delete(fileId);
    }
  };

  // Pause upload
  const pauseUpload = (fileId: string) => {
    const controller = abortControllersRef.current.get(fileId);
    if (controller) {
      controller.abort();
    }
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'paused', isPaused: true } : f
    ));
  };

  // Resume upload
  const resumeUpload = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, isPaused: false } : f
    ));
    uploadFile(fileId);
  };

  // Retry failed upload
  const retryUpload = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'pending', error: undefined, isPaused: false } : f
    ));
    uploadFile(fileId);
  };

  // Remove file from queue
  const removeFile = (fileId: string) => {
    const controller = abortControllersRef.current.get(fileId);
    if (controller) {
      controller.abort();
    }
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Handle file selection
  const handleFiles = useCallback((selectedFiles: FileList | File[]) => {
    if (disabled) return;

    const newFiles: FileUploadState[] = [];
    const fileArray = Array.from(selectedFiles);

    for (const file of fileArray) {
      if (files.length + newFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        break;
      }

      if (file.size > maxFileSize) {
        alert(`${file.name} is too large. Maximum size: ${formatBytes(maxFileSize)}`);
        continue;
      }

      if (!isAcceptedType(file)) {
        alert(`${file.name} is not an accepted file type`);
        continue;
      }

      const fileState: FileUploadState = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        status: 'pending',
        progress: 0,
        bytesUploaded: 0,
        uploadedParts: [],
        currentChunk: 0,
        totalChunks: Math.ceil(file.size / DEFAULT_CHUNK_SIZE),
        chunkSize: DEFAULT_CHUNK_SIZE,
        isPaused: false,
      };

      newFiles.push(fileState);
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      
      // Start uploading new files
      setTimeout(() => {
        newFiles.forEach(f => uploadFile(f.id));
      }, 100);
    }
  }, [files.length, maxFiles, maxFileSize, disabled, acceptTypes]);

  // Notify when uploads complete
  useEffect(() => {
    const completed = files.filter(f => f.status === 'completed' && f.assetId);
    if (completed.length > 0 && completed.length === files.filter(f => f.status !== 'error').length) {
      onUploadComplete?.(completed.map(f => ({
        assetId: f.assetId!,
        filename: f.file.name,
        r2Path: f.r2Path!,
      })));
    }
  }, [files, onUploadComplete]);

  // Drag handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Calculate overall progress
  const overallProgress = files.length > 0
    ? Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)
    : 0;

  const uploadingCount = files.filter(f => f.status === 'uploading').length;
  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
            : 'border-white/20 hover:border-white/40 bg-white/5'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptString}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <CloudArrowUpIcon className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-[#D4AF37]' : 'text-white/60'}`} />
        
        <p className="text-lg font-medium text-white mb-2">
          {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
        </p>
        
        <p className="text-sm text-white/60 mb-4">
          Supports {fileType} files up to {formatBytes(maxFileSize)}
          {maxFiles && ` • Max ${maxFiles} files`}
        </p>

        {files.length > 0 && (
          <div className="text-sm text-white/80">
            {uploadingCount > 0 && `${uploadingCount} uploading`}
            {completedCount > 0 && ` • ${completedCount} complete`}
            {errorCount > 0 && ` • ${errorCount} failed`}
          </div>
        )}
      </div>

      {/* Overall progress */}
      {files.length > 0 && uploadingCount > 0 && (
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/80">Overall progress</span>
            <span className="text-white">{overallProgress}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#D4AF37] transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {files.map(fileState => (
            <div
              key={fileState.id}
              className="bg-white/5 rounded-lg p-4 flex items-center gap-4"
            >
              {/* File icon */}
              <div className="shrink-0">
                {fileState.status === 'completed' ? (
                  <CheckCircleIcon className="w-8 h-8 text-green-400" />
                ) : fileState.status === 'error' ? (
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
                ) : fileState.status === 'processing' ? (
                  <ArrowPathIcon className="w-8 h-8 text-[#D4AF37] animate-spin" />
                ) : (
                  <DocumentIcon className="w-8 h-8 text-white/60" />
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{fileState.file.name}</p>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span>{formatBytes(fileState.file.size)}</span>
                  {fileState.status === 'uploading' && fileState.startTime && (
                    <>
                      <span>•</span>
                      <span>ETA: {formatETA(fileState.bytesUploaded, fileState.file.size, fileState.startTime)}</span>
                    </>
                  )}
                  {fileState.status === 'paused' && (
                    <>
                      <span>•</span>
                      <span className="text-yellow-400">Paused</span>
                    </>
                  )}
                  {fileState.error && (
                    <>
                      <span>•</span>
                      <span className="text-red-400">{fileState.error}</span>
                    </>
                  )}
                </div>
                
                {/* Progress bar */}
                {(fileState.status === 'uploading' || fileState.status === 'paused') && (
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          fileState.status === 'paused' ? 'bg-yellow-400' : 'bg-[#D4AF37]'
                        }`}
                        style={{ width: `${fileState.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/50 mt-1">
                      <span>{formatBytes(fileState.bytesUploaded)} / {formatBytes(fileState.file.size)}</span>
                      <span>{fileState.progress}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-2">
                {fileState.status === 'uploading' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); pauseUpload(fileState.id); }}
                    className="p-2 text-white/60 hover:text-white transition"
                    title="Pause"
                  >
                    <PauseIcon className="w-5 h-5" />
                  </button>
                )}
                {fileState.status === 'paused' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); resumeUpload(fileState.id); }}
                    className="p-2 text-[#D4AF37] hover:text-[#D4AF37]/80 transition"
                    title="Resume"
                  >
                    <PlayIcon className="w-5 h-5" />
                  </button>
                )}
                {fileState.status === 'error' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); retryUpload(fileState.id); }}
                    className="p-2 text-[#D4AF37] hover:text-[#D4AF37]/80 transition"
                    title="Retry"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(fileState.id); }}
                  className="p-2 text-white/60 hover:text-red-400 transition"
                  title="Remove"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
