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
  media?: unknown;
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

// New storage types for presigned upload flow

export type FileType = 
  | 'raw' 
  | 'deliverable' 
  | 'avatar' 
  | 'portfolio' 
  | 'public-asset' 
  | 'team-wip'
  | 'transcode'
  | 'backup'
  | 'other';

export type AccessLevel = 'public' | 'client' | 'team' | 'private';

export interface StorageObject {
  id: string;
  project_id: string | null;
  client_id: string | null;
  uploaded_by: string | null;
  r2_path: string;
  r2_bucket: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  checksum: string | null;
  is_public: boolean;
  access_level: AccessLevel;
  file_type: FileType | null;
  transcode_status: 'pending' | 'processing' | 'completed' | 'failed' | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadRequestPayload {
  filename: string;
  contentType: string;
  size: number;
  projectId?: string;
  clientId?: string;
  fileType: FileType;
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  key: string;
  token: string;
  expiresAt: string;
  maxSize: number;
}

export interface UploadCompletePayload {
  token: string;
  checksum?: string;
}

export interface UploadCompleteResponse {
  id: string;
  filename: string;
  size: number;
  mimeType?: string;
  isPublic: boolean;
  url?: string;
}

export interface DownloadResponse {
  url: string;
  filename: string;
  isPublic: boolean;
  expiresAt: string | null;
}

