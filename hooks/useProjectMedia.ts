"use client";

import { useState, useCallback, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import {
  uploadProjectMedia,
  getProjectMedia,
  getMediaAsset,
  updateMediaAsset,
  deleteMediaAsset,
  createDownloadUrl,
  createBatchDownloadUrls,
  trackDownload,
  type UploadMediaInput,
} from "@/lib/projects";
import type { MediaAsset, AssetType } from "@/lib/types/storage";

export interface UseProjectMediaReturn {
  // Data
  assets: MediaAsset[];
  
  // Loading states
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  
  // Error
  error: string | null;
  
  // Actions
  loadAssets: (projectId: string, options?: LoadAssetsOptions) => Promise<void>;
  uploadFile: (input: Omit<UploadMediaInput, 'uploadedBy'>) => Promise<MediaAsset | null>;
  updateAsset: (assetId: string, updates: MediaAssetUpdates) => Promise<MediaAsset | null>;
  deleteAsset: (assetId: string) => Promise<boolean>;
  getDownloadUrl: (storagePath: string, expiresIn?: number) => Promise<string | null>;
  downloadFile: (asset: MediaAsset) => Promise<void>;
  clearError: () => void;
}

export interface LoadAssetsOptions {
  assetType?: AssetType;
  status?: string;
  limit?: number;
  offset?: number;
}

export type MediaAssetUpdates = Partial<Pick<
  MediaAsset, 
  'title' | 'caption' | 'tags' | 'status' | 'qa_status' | 'qa_notes'
>>;

/**
 * Hook for project media management
 * 
 * Handles file uploads, fetching, and downloads with signed URLs.
 * All operations respect RLS policies.
 * 
 * Usage:
 * ```tsx
 * const { assets, loadAssets, uploadFile, downloadFile, isLoading } = useProjectMedia();
 * 
 * useEffect(() => {
 *   loadAssets(projectId);
 * }, [projectId, loadAssets]);
 * 
 * const handleUpload = async (file: File) => {
 *   const asset = await uploadFile({
 *     file,
 *     projectId,
 *     assetType: 'raw',
 *   });
 * };
 * 
 * const handleDownload = async (asset: MediaAsset) => {
 *   await downloadFile(asset);
 * };
 * ```
 */
export function useProjectMedia(): UseProjectMediaReturn {
  const { supabase, session, user } = useSupabase();
  
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Load media assets for a project
   * 
   * RLS guarantees only project members can see assets.
   */
  const loadAssets = useCallback(async (
    projectId: string,
    options?: LoadAssetsOptions
  ) => {
    if (!session) {
      setError("You must be logged in to view media");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { assets: data, error: fetchError } = await getProjectMedia(
        supabase,
        projectId,
        options
      );

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setAssets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  /**
   * Upload a file to a project
   * 
   * Uploads to Supabase Storage and creates metadata record.
   */
  const uploadFile = useCallback(async (
    input: Omit<UploadMediaInput, 'uploadedBy'>
  ): Promise<MediaAsset | null> => {
    if (!session || !user) {
      setError("You must be logged in to upload files");
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      setUploadProgress(10);

      const { asset, error: uploadError } = await uploadProjectMedia(supabase, {
        ...input,
        uploadedBy: user.id,
      });

      if (uploadError) {
        setError(uploadError.message);
        return null;
      }

      setUploadProgress(100);

      // Add to local state
      if (asset) {
        setAssets(prev => [asset, ...prev]);
      }

      return asset;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [supabase, session, user]);

  /**
   * Update asset metadata
   */
  const updateAssetMetadata = useCallback(async (
    assetId: string,
    updates: MediaAssetUpdates
  ): Promise<MediaAsset | null> => {
    if (!session) {
      setError("You must be logged in to update assets");
      return null;
    }

    setError(null);

    try {
      const { asset, error: updateError } = await updateMediaAsset(
        supabase,
        assetId,
        updates
      );

      if (updateError) {
        setError(updateError.message);
        return null;
      }

      // Update local state
      if (asset) {
        setAssets(prev => prev.map(a => a.id === assetId ? asset : a));
      }

      return asset;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
      return null;
    }
  }, [supabase, session]);

  /**
   * Delete an asset
   */
  const removeAsset = useCallback(async (assetId: string): Promise<boolean> => {
    if (!session) {
      setError("You must be logged in to delete assets");
      return false;
    }

    setError(null);

    try {
      const { success, error: deleteError } = await deleteMediaAsset(supabase, assetId);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      // Remove from local state
      if (success) {
        setAssets(prev => prev.filter(a => a.id !== assetId));
      }

      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      return false;
    }
  }, [supabase, session]);

  /**
   * Get a signed download URL
   * 
   * URLs expire after the specified time (default: 1 hour).
   */
  const getDownloadUrl = useCallback(async (
    storagePath: string,
    expiresIn: number = 3600
  ): Promise<string | null> => {
    if (!session) {
      setError("You must be logged in to get download URLs");
      return null;
    }

    try {
      const { url, error: urlError } = await createDownloadUrl(
        supabase,
        storagePath,
        expiresIn
      );

      if (urlError) {
        setError(urlError.message);
        return null;
      }

      return url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get download URL");
      return null;
    }
  }, [supabase, session]);

  /**
   * Download a file
   * 
   * Creates a signed URL and opens it in a new tab.
   * Also tracks the download.
   */
  const downloadAsset = useCallback(async (asset: MediaAsset) => {
    const url = await getDownloadUrl(asset.storage_path);
    
    if (url) {
      // Track the download
      await trackDownload(supabase, asset.id);
      
      // Open in new tab
      window.open(url, '_blank');
    }
  }, [supabase, getDownloadUrl]);

  return {
    assets,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    loadAssets,
    uploadFile,
    updateAsset: updateAssetMetadata,
    deleteAsset: removeAsset,
    getDownloadUrl,
    downloadFile: downloadAsset,
    clearError,
  };
}

export default useProjectMedia;
