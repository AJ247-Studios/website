import { SupabaseClient } from "@supabase/supabase-js";
import { STORAGE_BUCKET } from "./supabase-storage";

/**
 * Thumbnail generation utilities
 * 
 * Thumbnails are stored in the same bucket under `thumbnails/` prefix.
 * This keeps RLS policies simple and avoids cross-bucket complexity.
 */

export const THUMBNAIL_SIZES = {
  small: { width: 150, height: 150 },
  medium: { width: 300, height: 300 },
  large: { width: 600, height: 600 },
} as const;

export type ThumbnailSize = keyof typeof THUMBNAIL_SIZES;

// Supported image types for thumbnail generation
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

/**
 * Check if a file type supports thumbnail generation
 */
export function canGenerateThumbnail(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return SUPPORTED_IMAGE_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Build thumbnail storage path from original path and media ID
 */
export function buildThumbnailPath(
  mediaId: string, 
  size: ThumbnailSize = 'medium'
): string {
  const { width, height } = THUMBNAIL_SIZES[size];
  return `thumbnails/${mediaId}-${width}x${height}.jpg`;
}

/**
 * Check if a path is a thumbnail (to prevent infinite loops)
 */
export function isThumbnailPath(path: string): boolean {
  return path.startsWith('thumbnails/');
}

/**
 * Get signed URL for a thumbnail
 */
export async function getThumbnailUrl(
  supabase: SupabaseClient,
  thumbnailPath: string | null,
  expiresIn: number = 3600
): Promise<string | null> {
  if (!thumbnailPath) return null;
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(thumbnailPath, expiresIn);
  
  if (error) {
    console.error('Failed to get thumbnail URL:', error);
    return null;
  }
  
  return data.signedUrl;
}

/**
 * Get thumbnail URLs for multiple assets
 */
export async function getThumbnailUrls(
  supabase: SupabaseClient,
  thumbnailPaths: (string | null)[],
  expiresIn: number = 3600
): Promise<Map<string, string>> {
  const validPaths = thumbnailPaths.filter((p): p is string => p !== null);
  
  if (validPaths.length === 0) {
    return new Map();
  }
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrls(validPaths, expiresIn);
  
  if (error) {
    console.error('Failed to get thumbnail URLs:', error);
    return new Map();
  }
  
  const urlMap = new Map<string, string>();
  data.forEach(item => {
    if (item.path && item.signedUrl) {
      urlMap.set(item.path, item.signedUrl);
    }
  });
  
  return urlMap;
}
