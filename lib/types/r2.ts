// TypeScript types for R2 and file uploads

export interface FileRecord {
  id: string;
  user_id: string | null;
  filename: string;
  mime_type: string;
  size: number;
  url: string;
  bucket: string;
  created_at: string;
  updated_at: string;
}

export interface UploadResponse {
  success: boolean;
  file?: FileRecord;
  media?: any;
  error?: string;
}

export interface R2UploadOptions {
  prefix?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface PresignedUploadData {
  url: string;
  fields: Record<string, string>;
  key: string;
}
