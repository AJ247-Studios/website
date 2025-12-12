/**
 * UploadsPanel Component
 * 
 * Client uploads section with:
 * - Drag & drop file upload
 * - Upload progress indicators
 * - File size limits and instructions
 * - Previously uploaded files
 */

"use client";

import { useState, useRef, useCallback } from "react";
import type { ClientUpload } from "@/lib/types/portal";
import { formatFileSize } from "@/lib/portal-data";

interface UploadsPanelProps {
  projectId: string;
  uploads: ClientUpload[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (uploadId: string) => void;
  maxFileSize?: number; // bytes, default 5GB
  allowedTypes?: string[];
}

export function UploadsPanel({
  projectId,
  uploads,
  onUpload,
  onDelete,
  maxFileSize = 5 * 1024 * 1024 * 1024, // 5GB
  allowedTypes = ["image/*", "video/*", "application/pdf", ".zip", ".rar"],
}: UploadsPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        errors.push(`${file.name} exceeds ${formatFileSize(maxFileSize)} limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (errors.length > 0) {
      setError(errors.join(". "));
      setTimeout(() => setError(null), 5000);
    }

    return validFiles;
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      // Simulate upload progress
      for (const file of validFiles) {
        setUploadingFiles(prev => new Map(prev).set(file.name, 0));
      }
      
      try {
        await onUpload(validFiles);
      } finally {
        setUploadingFiles(new Map());
      }
    }
  }, [onUpload, maxFileSize]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      for (const file of validFiles) {
        setUploadingFiles(prev => new Map(prev).set(file.name, 0));
      }
      
      try {
        await onUpload(validFiles);
      } finally {
        setUploadingFiles(new Map());
      }
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onUpload, maxFileSize]);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Your Uploads
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Max {formatFileSize(maxFileSize)} per file
        </span>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${isDragging 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
            : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(",")}
          onChange={handleFileSelect}
          className="sr-only"
          id="file-upload"
        />
        
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Drag & drop files here, or{" "}
          <label
            htmlFor="file-upload"
            className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline"
          >
            browse
          </label>
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Upload reference images, logos, or any files for your project
        </p>

        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 rounded-xl">
            <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
              Drop files here
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Uploading files */}
      {uploadingFiles.size > 0 && (
        <div className="mt-4 space-y-2">
          {Array.from(uploadingFiles.entries()).map(([name, progress]) => (
            <div key={name} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-8 h-8 shrink-0 rounded bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {name}
                </p>
                <div className="mt-1 h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {progress}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files list */}
      {uploads.length > 0 && (
        <div className="mt-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Uploaded Files ({uploads.length})
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {uploads.map((upload) => (
              <UploadRow
                key={upload.id}
                upload={upload}
                onDelete={() => onDelete(upload.id)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface UploadRowProps {
  upload: ClientUpload;
  onDelete: () => void;
}

function UploadRow({ upload, onDelete }: UploadRowProps) {
  const fileIcon = getFileIcon(upload.file_type);

  return (
    <div className="flex items-center gap-3 p-3">
      <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${fileIcon.bg}`}>
        {fileIcon.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {upload.filename}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {formatFileSize(upload.file_size)} • {formatUploadDate(upload.created_at)}
        </p>
      </div>
      {upload.status === "ready" && (
        <a
          href={upload.url}
          download
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Download"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      )}
      <button
        onClick={onDelete}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        aria-label="Delete"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

function getFileIcon(fileType: string): { icon: React.ReactNode; bg: string } {
  if (fileType.startsWith("image")) {
    return {
      icon: <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      bg: "bg-pink-100 dark:bg-pink-900/30",
    };
  }
  if (fileType.startsWith("video")) {
    return {
      icon: <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
      bg: "bg-purple-100 dark:bg-purple-900/30",
    };
  }
  if (fileType.includes("pdf")) {
    return {
      icon: <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
      bg: "bg-red-100 dark:bg-red-900/30",
    };
  }
  if (fileType.includes("zip") || fileType.includes("rar")) {
    return {
      icon: <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
      bg: "bg-amber-100 dark:bg-amber-900/30",
    };
  }
  return {
    icon: <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    bg: "bg-slate-100 dark:bg-slate-800",
  };
}

function formatUploadDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default UploadsPanel;
