"use client";

import { useState, useCallback } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { createSignedUrl, createSignedUrls, STORAGE_BUCKET } from "@/lib/supabase-storage";

export interface SignedUrlResult {
  path: string;
  url: string;
  expiresAt: Date;
}

export interface UseSignedUrlReturn {
  getSignedUrl: (storagePath: string, expiresInSeconds?: number) => Promise<SignedUrlResult | null>;
  getSignedUrls: (paths: string[], expiresInSeconds?: number) => Promise<SignedUrlResult[]>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for fetching signed URLs for Supabase Storage files
 * 
 * Usage:
 * ```tsx
 * const { getSignedUrl, isLoading, error } = useSignedUrl();
 * 
 * const handleView = async (storagePath: string) => {
 *   const result = await getSignedUrl(storagePath);
 *   if (result) {
 *     window.open(result.url, '_blank');
 *   }
 * };
 * ```
 */
export function useSignedUrl(): UseSignedUrlReturn {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSignedUrl = useCallback(async (
    storagePath: string,
    expiresInSeconds: number = 3600
  ): Promise<SignedUrlResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { url, error: signError } = await createSignedUrl(
        supabase,
        storagePath,
        expiresInSeconds
      );

      if (signError || !url) {
        setError(signError?.message || "Failed to get signed URL");
        return null;
      }

      const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

      return {
        path: storagePath,
        url,
        expiresAt,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get signed URL";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const getSignedUrls = useCallback(async (
    paths: string[],
    expiresInSeconds: number = 3600
  ): Promise<SignedUrlResult[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { urls, error: signError } = await createSignedUrls(
        supabase,
        paths,
        expiresInSeconds
      );

      if (signError) {
        setError(signError.message);
        return [];
      }

      const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

      return urls.map(({ path, signedUrl }) => ({
        path,
        url: signedUrl,
        expiresAt,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get signed URLs";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  return {
    getSignedUrl,
    getSignedUrls,
    isLoading,
    error,
  };
}

export default useSignedUrl;
