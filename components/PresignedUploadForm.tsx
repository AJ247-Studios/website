"use client";

import { useState, useCallback, useRef } from "react";
import { useUpload, type FileType, type UploadResult } from "@/hooks/useUpload";
import { useSupabase } from "@/components/SupabaseProvider";

interface PresignedUploadFormProps {
  projectId?: string;
  clientId?: string;
  defaultFileType?: FileType;
  allowedFileTypes?: FileType[];
  onUploadComplete?: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  className?: string;
}

const FILE_TYPE_LABELS: Record<FileType, string> = {
  'raw': 'Raw Files',
  'deliverable': 'Deliverables',
  'avatar': 'Profile Picture',
  'portfolio': 'Portfolio',
  'public-asset': 'Website Assets',
  'team-wip': 'Work in Progress',
};

const FILE_TYPE_DESCRIPTIONS: Record<FileType, string> = {
  'raw': 'Original footage and raw files (up to 5GB)',
  'deliverable': 'Final files for client delivery (up to 1GB)',
  'avatar': 'Profile picture (up to 5MB)',
  'portfolio': 'Portfolio showcase items (up to 500MB)',
  'public-asset': 'Public website assets (up to 50MB)',
  'team-wip': 'Work in progress files (up to 2GB)',
};

export default function PresignedUploadForm({
  projectId,
  clientId,
  defaultFileType = 'deliverable',
  allowedFileTypes = ['raw', 'deliverable', 'team-wip'],
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  className = "",
}: PresignedUploadFormProps) {
  const { session, role } = useSupabase();
  const { upload, isUploading, progress, error, reset } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileType, setFileType] = useState<FileType>(defaultFileType);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Filter allowed file types based on user role
  const availableFileTypes = allowedFileTypes.filter(type => {
    if (type === 'portfolio' || type === 'public-asset') {
      return role === 'admin';
    }
    if (type === 'raw' || type === 'deliverable' || type === 'team-wip') {
      return ['admin', 'team'].includes(role || '');
    }
    return true;
  });

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files).slice(0, maxFiles);
    setSelectedFiles(prev => {
      const combined = [...prev, ...fileArray].slice(0, maxFiles);
      return combined;
    });
  }, [maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const results: UploadResult[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      setCurrentFileIndex(i);
      const file = selectedFiles[i];
      
      try {
        const result = await upload(file, {
          fileType,
          projectId,
          clientId,
        });
        
        results.push(result);
        onUploadComplete?.(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        onUploadError?.(errorMessage);
      }
    }

    setUploadedFiles(prev => [...prev, ...results]);
    setSelectedFiles([]);
    setCurrentFileIndex(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setUploadedFiles([]);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!session) {
    return (
      <div className={`p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center ${className}`}>
        <p className="text-yellow-700 dark:text-yellow-300">
          Please log in to upload files.
        </p>
      </div>
    );
  }

  const totalProgress = selectedFiles.length > 0
    ? ((currentFileIndex / selectedFiles.length) * 100) + (progress / selectedFiles.length)
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Type Selector */}
      {availableFileTypes.length > 1 && (
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Upload Type
          </label>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value as FileType)}
            disabled={isUploading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:opacity-50"
          >
            {availableFileTypes.map(type => (
              <option key={type} value={type}>
                {FILE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {FILE_TYPE_DESCRIPTIONS[fileType]}
          </p>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept="image/*,video/*,application/pdf,application/zip"
          disabled={isUploading}
        />
        
        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium text-blue-600 dark:text-blue-400">Click to upload</span>
              {" "}or drag and drop
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Up to {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selected Files ({selectedFiles.length})
            </h4>
            <button
              onClick={clearAll}
              disabled={isUploading}
              className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Clear All
            </button>
          </div>
          
          <ul className="space-y-2 max-h-48 overflow-auto">
            {selectedFiles.map((file, index) => (
              <li 
                key={`${file.name}-${index}`}
                className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg
                  ${isUploading && index === currentFileIndex ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    {file.type.startsWith('image/') ? (
                      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    ) : file.type.startsWith('video/') ? (
                      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                {!isUploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="shrink-0 p-1 text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Uploading {currentFileIndex + 1} of {selectedFiles.length}...
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.round(totalProgress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error.message}</p>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || isUploading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                   text-white font-semibold rounded-lg transition-colors
                   disabled:cursor-not-allowed"
      >
        {isUploading 
          ? `Uploading... (${currentFileIndex + 1}/${selectedFiles.length})`
          : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`
        }
      </button>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-green-700 dark:text-green-400">
            ✓ Successfully Uploaded ({uploadedFiles.length})
          </h4>
          <ul className="space-y-1">
            {uploadedFiles.map((file) => (
              <li 
                key={file.id}
                className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm"
              >
                <span className="text-gray-700 dark:text-gray-300 truncate">
                  {file.filename}
                </span>
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline shrink-0 ml-2"
                  >
                    View
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
