"use client";

import { useState, useCallback } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { 
  uploadToStorage, 
  buildStoragePath, 
  STORAGE_BUCKET,
  type AssetType 
} from "@/lib/supabase-storage";

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
  storagePath: string;
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

// Map frontend FileType to storage AssetType
function mapFileTypeToAssetType(fileType: FileType): AssetType {
  switch (fileType) {
    case 'raw': return 'raw';
    case 'deliverable': return 'deliverable';
    case 'avatar': return 'avatar';
    case 'portfolio': return 'portfolio';
    case 'public-asset': return 'portfolio';
    case 'team-wip': return 'wip';
    default: return 'deliverable';
  }
}

/**
 * Hook for uploading files directly to Supabase Storage
 * 
 * Flow:
 * 1. Upload file to Supabase Storage (bucket: 'media')
 * 2. Save metadata to media_assets table
 * 3. Return result with storage path (use signed URLs to access)
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
 *     console.log('Uploaded:', result.storagePath);
 *   } catch (err) {
 *     console.error('Upload failed:', err);
 *   }
 * };
 * ```
 */
export function useUpload(): UseUploadReturn {
  const { supabase, session, user } = useSupabase();
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
    if (!session || !user) {
      throw { message: "You must be logged in to upload files", code: "UNAUTHORIZED" };
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: Build storage path
      const assetType = mapFileTypeToAssetType(options.fileType);
      const storagePath = buildStoragePath({
        assetType,
        projectId: options.projectId,
        userId: user.id,
        filename: file.name,
      });

      setProgress(10);
      options.onProgress?.(10);

      // Step 2: Upload directly to Supabase Storage
      const { path, error: uploadError } = await uploadToStorage(
        supabase,
        file,
        storagePath
      );

      if (uploadError) {
        throw { message: uploadError.message, code: "UPLOAD_FAILED" };
      }

      setProgress(70);
      options.onProgress?.(70);

      // Step 3: Save metadata to media_assets table
      const { data: mediaAsset, error: dbError } = await supabase
        .from('media_assets')
        .insert({
          project_id: options.projectId || null,
          uploaded_by: user.id,
          storage_path: path,
          asset_type: assetType,
          filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          status: 'uploaded',
        })
        .select('id')
        .single();

      if (dbError) {
        // Attempt to clean up the uploaded file
        await supabase.storage.from(STORAGE_BUCKET).remove([path]);
        throw { message: dbError.message, code: "DB_INSERT_FAILED" };
      }

      setProgress(100);
      options.onProgress?.(100);
      setIsUploading(false);

      const result: UploadResult = {
        id: mediaAsset.id,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        storagePath: path,
        isPublic: false, // All files are private, accessed via signed URLs
      };

      return result;

    } catch (err) {
      const uploadError: UploadError = err instanceof Error 
        ? { message: err.message }
        : (err as UploadError);
      
      setError(uploadError);
      setIsUploading(false);
      throw uploadError;
    }
  }, [session, user, supabase]);

  return {
    upload,
    isUploading,
    progress,
    error,
    reset,
  };
}

export default useUpload;
