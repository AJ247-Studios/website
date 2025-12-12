import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client for Cloudflare R2
export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Minimal client export (alias) per Step 2 instructions
export const r2 = r2Client;

// Default bucket from env
const DEFAULT_BUCKET = process.env.R2_BUCKET!;

/**
 * Generate a presigned PUT URL for direct client uploads
 * 
 * @param key - The storage path/key for the file
 * @param contentType - MIME type of the file being uploaded
 * @param expiresIn - URL expiration in seconds (default: 15 minutes)
 * @param bucket - Optional bucket override
 */
export async function createPresignedPutUrl(
  key: string,
  contentType: string,
  expiresIn: number = 900,
  bucket: string = DEFAULT_BUCKET
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  
  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Generate a presigned GET URL for secure downloads
 * 
 * @param key - The storage path/key for the file
 * @param expiresIn - URL expiration in seconds (default: 1 hour)
 * @param bucket - Optional bucket override
 */
export async function createPresignedGetUrl(
  key: string,
  expiresIn: number = 3600,
  bucket: string = DEFAULT_BUCKET
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  
  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Verify a file exists and get its metadata
 * 
 * @param key - The storage path/key for the file
 * @param bucket - Optional bucket override
 * @returns Object metadata or null if not found
 */
export async function headObject(
  key: string,
  bucket: string = DEFAULT_BUCKET
): Promise<{
  contentLength: number;
  contentType: string | undefined;
  etag: string | undefined;
} | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    
    const response = await r2Client.send(command);
    
    return {
      contentLength: response.ContentLength ?? 0,
      contentType: response.ContentType,
      etag: response.ETag,
    };
  } catch (error: unknown) {
    // File doesn't exist
    if (error && typeof error === 'object' && 'name' in error && error.name === "NotFound") {
      return null;
    }
    throw error;
  }
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Return public URL
  // If using custom domain: return `${process.env.R2_PUBLIC_DOMAIN}/${encodeURIComponent(key)}`
  return `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Generate a storage key following the folder structure convention
 * 
 * Folder structure:
 * /public/website-assets/...           - Site images, hero videos (public)
 * /public/portfolio/{projectId}/...    - Portfolio deliverables (public)
 * /profiles/{userId}/avatar.jpg        - Profile pictures
 * /clients/{clientId}/{projectId}/deliverables/{filename}   - Client deliverables (signed)
 * /clients/{clientId}/{projectId}/raw/{filename}            - Raw files, private
 * /team/{userId}/work_in_progress/...  - Private for team access
 * /backups/{YYYY-MM-DD}/...            - Backup exports (private)
 * /transcodes/{projectId}/720p/...     - Derived files
 */
export function generateStorageKey(
  params: {
    type: 'public-asset' | 'portfolio' | 'avatar' | 'deliverable' | 'raw' | 'team-wip' | 'backup' | 'transcode';
    filename: string;
    projectId?: string;
    clientId?: string;
    userId?: string;
    resolution?: string;
  }
): string {
  const { type, filename, projectId, clientId, userId, resolution } = params;
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueFilename = `${timestamp}_${sanitizedFilename}`;
  
  switch (type) {
    case 'public-asset':
      return `public/website-assets/${uniqueFilename}`;
      
    case 'portfolio':
      if (!projectId) throw new Error('projectId required for portfolio files');
      return `public/portfolio/${projectId}/${uniqueFilename}`;
      
    case 'avatar':
      if (!userId) throw new Error('userId required for avatar files');
      return `profiles/${userId}/avatar${getExtension(filename)}`;
      
    case 'deliverable':
      if (!clientId || !projectId) throw new Error('clientId and projectId required for deliverables');
      return `clients/${clientId}/${projectId}/deliverables/${uniqueFilename}`;
      
    case 'raw':
      if (!clientId || !projectId) throw new Error('clientId and projectId required for raw files');
      return `clients/${clientId}/${projectId}/raw/${uniqueFilename}`;
      
    case 'team-wip':
      if (!userId) throw new Error('userId required for team WIP files');
      return `team/${userId}/work_in_progress/${uniqueFilename}`;
      
    case 'backup':
      const date = new Date().toISOString().split('T')[0];
      return `backups/${date}/${uniqueFilename}`;
      
    case 'transcode':
      if (!projectId) throw new Error('projectId required for transcodes');
      const res = resolution || '720p';
      return `transcodes/${projectId}/${res}/${uniqueFilename}`;
      
    default:
      return `uploads/${uniqueFilename}`;
  }
}

/**
 * Get file extension from filename
 */
function getExtension(filename: string): string {
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '';
}

/**
 * Legacy function for backward compatibility
 */
export function generateFileKey(filename: string, prefix?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  
  if (prefix) {
    return `${prefix}/${timestamp}_${randomString}_${sanitizedFilename}`;
  }
  
  return `${timestamp}_${randomString}_${sanitizedFilename}`;
}

/**
 * Extract key from R2 URL
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    // Remove empty string and bucket name
    return pathParts.slice(2).join("/");
  } catch {
    return null;
  }
}

/**
 * Determine if a storage path is public
 */
export function isPublicPath(key: string): boolean {
  return key.startsWith('public/');
}

/**
 * Get public URL for a file (only use for public paths)
 */
export function getPublicUrl(key: string): string {
  return `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
}
