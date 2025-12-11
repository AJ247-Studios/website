import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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
  return `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${encodeURIComponent(key)}`;
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
 * Generate a unique key for uploaded files
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
