"use client";

import { useState, useCallback } from "react";
import { useSupabase } from "@/components/SupabaseProvider";

export type FileType = 'raw' | 'deliverable' | 'avatar' | 'portfolio' | 'public-asset' | 'team-wip';

export interface UploadOptions {
  projectId?: string;
  clientId?: string;
  fileType: FileType;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  id: string;
  filename: string;
  size: number;
  mimeType?: string;
  isPublic: boolean;
  url?: string;
}

export interface UploadError {
  message: string;
  code?: string;
}

interface UseUploadReturn {
  upload: (file: File, options: UploadOptions) => Promise<UploadResult>;
  isUploading: boolean;
  progress: number;
  error: UploadError | null;
  reset: () => void;
}

/**
 * Hook for uploading files using presigned URLs
 * 
 * Usage:
 * ```tsx
 * const { upload, isUploading, progress, error } = useUpload();
 * 
 * const handleUpload = async (file: File) => {
 *   try {
 *     const result = await upload(file, { 
 *       fileType: 'deliverable',
 *       projectId: '123'
 *     });
 *     console.log('Uploaded:', result.url);
 *   } catch (err) {
 *     console.error('Upload failed:', err);
 *   }
 * };
 * ```
 */
export function useUpload(): UseUploadReturn {
  const { session } = useSupabase();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<UploadError | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(async (
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> => {
    if (!session) {
      throw { message: "You must be logged in to upload files", code: "UNAUTHORIZED" };
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: Request presigned URL from server
      const requestResponse = await fetch("/api/upload/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          projectId: options.projectId,
          clientId: options.clientId,
          fileType: options.fileType,
        }),
      });

      if (!requestResponse.ok) {
        const errorData = await requestResponse.json();
        throw { message: errorData.error || "Failed to get upload URL", code: "REQUEST_FAILED" };
      }

      const { presignedUrl, token } = await requestResponse.json();
      
      setProgress(10);

      // Step 2: Upload file directly to R2 using presigned URL
      await uploadWithProgress(file, presignedUrl, (uploadProgress) => {
        // Map 0-100 to 10-90 (save room for completion step)
        const mappedProgress = 10 + (uploadProgress * 0.8);
        setProgress(Math.round(mappedProgress));
        options.onProgress?.(Math.round(mappedProgress));
      });

      setProgress(90);

      // Step 3: Notify server that upload is complete
      const completeResponse = await fetch("/api/upload/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw { message: errorData.error || "Failed to complete upload", code: "COMPLETE_FAILED" };
      }

      const result: UploadResult = await completeResponse.json();
      
      setProgress(100);
      setIsUploading(false);

      return result;

    } catch (err) {
      const uploadError: UploadError = err instanceof Error 
        ? { message: err.message }
        : (err as UploadError);
      
      setError(uploadError);
      setIsUploading(false);
      throw uploadError;
    }
  }, [session]);

  return {
    upload,
    isUploading,
    progress,
    error,
    reset,
  };
}

/**
 * Upload file with XMLHttpRequest to track progress
 */
async function uploadWithProgress(
  file: File,
  url: string,
  onProgress: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed due to network error"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was aborted"));
    });

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

export default useUpload;
