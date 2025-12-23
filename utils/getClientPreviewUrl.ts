/**
 * Client Preview URL Utility
 * 
 * Generates signed URLs for private assets server-side.
 * Clients never call createSignedUrl directly - all signed URLs
 * are generated through the API endpoints.
 * 
 * This ensures:
 * 1. Private assets stay private (no bucket access from client)
 * 2. URLs expire after a set time (default: 1 hour)
 * 3. Access is logged and can be revoked
 */

import { createPresignedGetUrl } from "@/lib/r2";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Default expiration times (in seconds)
export const URL_EXPIRY = {
  THUMBNAIL: 3600,      // 1 hour for thumbnails
  PREVIEW: 3600,        // 1 hour for previews  
  DOWNLOAD: 1800,       // 30 minutes for downloads
  SHORT: 300,           // 5 minutes for quick views
} as const;

export interface SignedUrlResult {
  signedUrl: string;
  expiresAt: Date;
}

export interface AssetUrls {
  thumbnail?: SignedUrlResult;
  preview?: SignedUrlResult;
  download?: SignedUrlResult;
}

/**
 * Generate a signed URL for a private asset
 * 
 * @param storagePath - The R2/Supabase storage path
 * @param expiresIn - Expiration time in seconds
 * @returns Signed URL and expiration timestamp
 */
export async function getSignedUrl(
  storagePath: string,
  expiresIn: number = URL_EXPIRY.PREVIEW
): Promise<SignedUrlResult> {
  // Handle Supabase Storage paths (start with project bucket)
  if (storagePath.startsWith('project-files/') || storagePath.startsWith('media/')) {
    const bucket = storagePath.split('/')[0];
    const path = storagePath.substring(bucket.length + 1);
    
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    
    if (error || !data?.signedUrl) {
      throw new Error(`Failed to generate signed URL: ${error?.message || 'Unknown error'}`);
    }
    
    return {
      signedUrl: data.signedUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  }
  
  // Handle R2 paths
  const signedUrl = await createPresignedGetUrl(storagePath, expiresIn);
  
  return {
    signedUrl,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
  };
}

/**
 * Generate all signed URLs for a media asset
 * 
 * @param asset - Media asset with storage paths
 * @returns Object with thumbnail, preview, and download URLs
 */
export async function getAssetUrls(asset: {
  storage_path?: string;
  thumbnail_path?: string;
  r2_path?: string;
}): Promise<AssetUrls> {
  const urls: AssetUrls = {};
  
  // Get the main storage path
  const mainPath = asset.storage_path || asset.r2_path;
  
  // Generate thumbnail URL
  if (asset.thumbnail_path) {
    try {
      urls.thumbnail = await getSignedUrl(asset.thumbnail_path, URL_EXPIRY.THUMBNAIL);
    } catch (e) {
      console.error('Failed to generate thumbnail URL:', e);
    }
  }
  
  // Generate preview URL (same as main file for images, transcoded for video)
  if (mainPath) {
    try {
      urls.preview = await getSignedUrl(mainPath, URL_EXPIRY.PREVIEW);
    } catch (e) {
      console.error('Failed to generate preview URL:', e);
    }
  }
  
  // Generate download URL (original file)
  if (mainPath) {
    try {
      urls.download = await getSignedUrl(mainPath, URL_EXPIRY.DOWNLOAD);
    } catch (e) {
      console.error('Failed to generate download URL:', e);
    }
  }
  
  return urls;
}

/**
 * Batch generate signed URLs for multiple assets
 * More efficient than generating URLs one by one
 * 
 * @param assets - Array of media assets
 * @returns Map of asset ID to signed URLs
 */
export async function batchGetAssetUrls(
  assets: Array<{
    id: string;
    storage_path?: string;
    thumbnail_path?: string;
    r2_path?: string;
  }>
): Promise<Map<string, AssetUrls>> {
  const results = new Map<string, AssetUrls>();
  
  // Process in parallel for efficiency
  await Promise.all(
    assets.map(async (asset) => {
      try {
        const urls = await getAssetUrls(asset);
        results.set(asset.id, urls);
      } catch (e) {
        console.error(`Failed to generate URLs for asset ${asset.id}:`, e);
        results.set(asset.id, {});
      }
    })
  );
  
  return results;
}

/**
 * Verify user has access to a project (for authorization)
 * 
 * @param userId - The user's auth ID
 * @param projectId - The project ID
 * @returns true if user has access
 */
export async function verifyProjectAccess(
  userId: string,
  projectId: string
): Promise<boolean> {
  // Check if user is team/admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (profile?.role === 'admin' || profile?.role === 'team') {
    return true;
  }
  
  // Check if user is a client for this project
  const { data: project } = await supabaseAdmin
    .from('projects')
    .select(`
      id,
      client_id,
      client_users!inner(user_id)
    `)
    .eq('id', projectId)
    .eq('client_users.user_id', userId)
    .single();
  
  return !!project;
}

/**
 * Verify user has access to a deliverable
 * 
 * @param userId - The user's auth ID
 * @param deliverableId - The deliverable ID
 * @returns true if user has access
 */
export async function verifyDeliverableAccess(
  userId: string,
  deliverableId: string
): Promise<boolean> {
  // Check if user is team/admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (profile?.role === 'admin' || profile?.role === 'team') {
    return true;
  }
  
  // Check if user is a client for this deliverable's project
  const { data: deliverable } = await supabaseAdmin
    .from('deliverables')
    .select(`
      id,
      project:projects!inner(
        id,
        client_id,
        client_users!inner(user_id)
      )
    `)
    .eq('id', deliverableId)
    .eq('project.client_users.user_id', userId)
    .single();
  
  return !!deliverable;
}

export default {
  getSignedUrl,
  getAssetUrls,
  batchGetAssetUrls,
  verifyProjectAccess,
  verifyDeliverableAccess,
  URL_EXPIRY,
};
