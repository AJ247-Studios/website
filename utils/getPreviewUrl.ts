import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Preview URL Helper
 * 
 * Returns the best URL for displaying a media asset preview.
 * Prefers thumbnail_path for images, falls back to storage_path.
 * 
 * For public buckets: returns public URL
 * For private buckets: returns signed URL with TTL
 * 
 * Cache behavior:
 * - Thumbnails rarely change, use long cache (1 hour default)
 * - Originals may change, use shorter cache for downloads
 */

export interface MediaAssetPreview {
  id: string;
  storage_path: string;
  thumbnail_path?: string | null;
  mime_type?: string | null;
  asset_type?: string;
}

export interface PreviewUrlOptions {
  /** Time-to-live for signed URLs in seconds (default: 3600 = 1 hour) */
  signedTTL?: number;
  /** Force using original instead of thumbnail */
  useOriginal?: boolean;
  /** Preferred thumbnail size: 'sm' | 'md' | 'lg' (if multiple sizes stored) */
  size?: 'sm' | 'md' | 'lg';
}

// Cache for preview URLs (client-side only)
const urlCache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_BUFFER_MS = 60000; // Refresh 1 minute before expiry

/**
 * Get the storage bucket name from environment
 */
export const MEDIA_BUCKET = 'media';

/**
 * Check if the bucket is configured as public
 * In production, you might want to set this via environment variable
 */
export const IS_BUCKET_PUBLIC = process.env.NEXT_PUBLIC_STORAGE_PUBLIC === 'true';

/**
 * Get the appropriate path for preview (thumbnail or original)
 */
export function getPreviewPath(
  asset: MediaAssetPreview,
  options: PreviewUrlOptions = {}
): string {
  const { useOriginal = false } = options;
  
  // For images, prefer thumbnail if available
  const isImage = asset.mime_type?.startsWith('image/');
  
  if (!useOriginal && isImage && asset.thumbnail_path) {
    return asset.thumbnail_path;
  }
  
  return asset.storage_path;
}

/**
 * Get public URL for an asset (for public buckets)
 */
export function getPublicUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

/**
 * Create a signed URL for an asset (for private buckets)
 * This should be called server-side or with authenticated client
 */
export async function createSignedPreviewUrl(
  supabase: SupabaseClient,
  path: string,
  ttl: number = 3600
): Promise<string | null> {
  // Check cache first (client-side)
  const cacheKey = `signed:${path}`;
  const cached = urlCache.get(cacheKey);
  
  if (cached && cached.expiresAt > Date.now() + CACHE_BUFFER_MS) {
    return cached.url;
  }
  
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, ttl);
  
  if (error || !data?.signedUrl) {
    console.error('Failed to create signed URL:', error);
    return null;
  }
  
  // Cache the result
  urlCache.set(cacheKey, {
    url: data.signedUrl,
    expiresAt: Date.now() + (ttl * 1000),
  });
  
  return data.signedUrl;
}

/**
 * Main helper: Get preview URL for a media asset
 * 
 * Usage:
 * ```tsx
 * // For public bucket:
 * const url = getPreviewUrl(asset);
 * 
 * // For private bucket (need authenticated supabase client):
 * const url = await getPreviewUrl(asset, { supabase });
 * ```
 */
export function getPreviewUrl(
  asset: MediaAssetPreview,
  options: PreviewUrlOptions = {}
): string {
  const path = getPreviewPath(asset, options);
  
  // For public buckets, return the public URL directly
  // This is synchronous and can be used in render
  return getPublicUrl(path);
}

/**
 * Async version for private buckets
 */
export async function getPreviewUrlAsync(
  asset: MediaAssetPreview,
  supabase: SupabaseClient,
  options: PreviewUrlOptions = {}
): Promise<string | null> {
  const path = getPreviewPath(asset, options);
  const { signedTTL = 3600 } = options;
  
  if (IS_BUCKET_PUBLIC) {
    return getPublicUrl(path);
  }
  
  return createSignedPreviewUrl(supabase, path, signedTTL);
}

/**
 * Get download URL (always use original file, not thumbnail)
 */
export async function getDownloadUrl(
  asset: MediaAssetPreview,
  supabase: SupabaseClient,
  ttl: number = 3600
): Promise<string | null> {
  if (IS_BUCKET_PUBLIC) {
    return getPublicUrl(asset.storage_path);
  }
  
  return createSignedPreviewUrl(supabase, asset.storage_path, ttl);
}

/**
 * Batch get preview URLs for multiple assets
 * More efficient than calling getPreviewUrl in a loop for signed URLs
 */
export async function getBatchPreviewUrls(
  assets: MediaAssetPreview[],
  supabase: SupabaseClient,
  options: PreviewUrlOptions = {}
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const { signedTTL = 3600 } = options;
  
  if (IS_BUCKET_PUBLIC) {
    // For public buckets, just generate URLs directly
    assets.forEach(asset => {
      const path = getPreviewPath(asset, options);
      results.set(asset.id, getPublicUrl(path));
    });
    return results;
  }
  
  // For private buckets, we need to create signed URLs
  // Unfortunately Supabase doesn't have a batch signed URL endpoint,
  // so we do this in parallel
  const promises = assets.map(async (asset) => {
    const path = getPreviewPath(asset, options);
    const url = await createSignedPreviewUrl(supabase, path, signedTTL);
    if (url) {
      results.set(asset.id, url);
    }
  });
  
  await Promise.all(promises);
  return results;
}

/**
 * Clear the URL cache (useful when assets are updated)
 */
export function clearPreviewUrlCache(): void {
  urlCache.clear();
}

/**
 * Get file type icon based on mime type
 */
export function getFileTypeFromMime(mimeType: string | null | undefined): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (!mimeType) return 'other';
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  
  return 'other';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

/**
 * Format duration for videos
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
