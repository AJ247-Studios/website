import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Storage utilities for the 'media' bucket
 * 
 * Bucket Configuration (set in Supabase Dashboard):
 * - Bucket name: media
 * - Private: ✅
 * - Public: ❌
 * 
 * All files are accessed via signed URLs, not public access.
 */

export const STORAGE_BUCKET = "media";

// Storage path patterns
export const STORAGE_PATHS = {
  project: (projectId: string, filename: string) => `projects/${projectId}/${filename}`,
  deliverable: (projectId: string, filename: string) => `projects/${projectId}/deliverables/${filename}`,
  raw: (projectId: string, filename: string) => `projects/${projectId}/raw/${filename}`,
  avatar: (userId: string, filename: string) => `avatars/${userId}/${filename}`,
  portfolio: (filename: string) => `portfolio/${filename}`,
  teamWip: (projectId: string, filename: string) => `projects/${projectId}/wip/${filename}`,
} as const;

export type AssetType = 'raw' | 'deliverable' | 'avatar' | 'portfolio' | 'wip';

/**
 * Generate a unique filename to avoid collisions
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop() || '';
  const baseName = originalFilename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
  
  return `${baseName}_${timestamp}_${randomSuffix}.${extension}`;
}

/**
 * Build storage path based on asset type and context
 */
export function buildStoragePath(options: {
  assetType: AssetType;
  projectId?: string;
  userId?: string;
  filename: string;
}): string {
  const { assetType, projectId, userId, filename } = options;
  const uniqueFilename = generateUniqueFilename(filename);
  
  switch (assetType) {
    case 'raw':
      if (!projectId) throw new Error('projectId required for raw assets');
      return STORAGE_PATHS.raw(projectId, uniqueFilename);
    
    case 'deliverable':
      if (!projectId) throw new Error('projectId required for deliverables');
      return STORAGE_PATHS.deliverable(projectId, uniqueFilename);
    
    case 'avatar':
      if (!userId) throw new Error('userId required for avatars');
      return STORAGE_PATHS.avatar(userId, uniqueFilename);
    
    case 'portfolio':
      return STORAGE_PATHS.portfolio(uniqueFilename);
    
    case 'wip':
      if (!projectId) throw new Error('projectId required for WIP files');
      return STORAGE_PATHS.teamWip(projectId, uniqueFilename);
    
    default:
      if (projectId) {
        return STORAGE_PATHS.project(projectId, uniqueFilename);
      }
      throw new Error('Unable to determine storage path');
  }
}

/**
 * Upload a file directly to Supabase Storage
 */
export async function uploadToStorage(
  supabase: SupabaseClient,
  file: File,
  storagePath: string,
  options?: {
    onProgress?: (progress: number) => void;
    upsert?: boolean;
  }
): Promise<{ path: string; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: options?.upsert ?? false,
    });

  if (error) {
    return { path: '', error: new Error(error.message) };
  }

  return { path: data.path, error: null };
}

/**
 * Create a signed URL for private file access
 * Default expiry: 1 hour
 */
export async function createSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresInSeconds: number = 3600
): Promise<{ url: string | null; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error) {
    return { url: null, error: new Error(error.message) };
  }

  return { url: data.signedUrl, error: null };
}

/**
 * Create multiple signed URLs at once
 */
export async function createSignedUrls(
  supabase: SupabaseClient,
  paths: string[],
  expiresInSeconds: number = 3600
): Promise<{ urls: { path: string; signedUrl: string }[]; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrls(paths, expiresInSeconds);

  if (error) {
    return { urls: [], error: new Error(error.message) };
  }

  return { 
    urls: data.map(d => ({ path: d.path || '', signedUrl: d.signedUrl })), 
    error: null 
  };
}

/**
 * Delete a file from storage
 */
export async function deleteFromStorage(
  supabase: SupabaseClient,
  storagePath: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([storagePath]);

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

/**
 * List files in a storage folder
 */
export async function listFiles(
  supabase: SupabaseClient,
  folderPath: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: 'asc' | 'desc' };
  }
): Promise<{ files: Array<{ name: string; id: string; created_at: string; metadata: Record<string, unknown> }>; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(folderPath, {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      sortBy: options?.sortBy || { column: 'created_at', order: 'desc' },
    });

  if (error) {
    return { files: [], error: new Error(error.message) };
  }

  return { 
    files: data.map(f => ({
      name: f.name,
      id: f.id || '',
      created_at: f.created_at || '',
      metadata: f.metadata || {},
    })),
    error: null 
  };
}

/**
 * Get file metadata from storage
 */
export async function getFileMetadata(
  supabase: SupabaseClient,
  storagePath: string
): Promise<{ 
  metadata: { 
    size: number; 
    mimetype: string; 
    cacheControl: string;
    lastModified: string;
  } | null; 
  error: Error | null 
}> {
  // Supabase doesn't have a direct "head" method, but we can use download with range:0
  // or list the parent folder and find the file
  const pathParts = storagePath.split('/');
  const filename = pathParts.pop() || '';
  const folder = pathParts.join('/');

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(folder, { search: filename });

  if (error) {
    return { metadata: null, error: new Error(error.message) };
  }

  const file = data.find(f => f.name === filename);
  if (!file) {
    return { metadata: null, error: new Error('File not found') };
  }

  return {
    metadata: {
      size: file.metadata?.size || 0,
      mimetype: file.metadata?.mimetype || 'application/octet-stream',
      cacheControl: file.metadata?.cacheControl || '3600',
      lastModified: file.updated_at || file.created_at || '',
    },
    error: null,
  };
}

/**
 * Create signed URL for uploading (for larger files that need resumable uploads)
 */
export async function createUploadSignedUrl(
  supabase: SupabaseClient,
  storagePath: string
): Promise<{ 
  signedUrl: string | null; 
  token: string | null;
  path: string | null;
  error: Error | null 
}> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error) {
    return { signedUrl: null, token: null, path: null, error: new Error(error.message) };
  }

  return { 
    signedUrl: data.signedUrl, 
    token: data.token,
    path: data.path,
    error: null 
  };
}
