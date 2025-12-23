// TypeScript types for Supabase Storage file uploads

export interface MediaAsset {
  id: string;
  project_id: string | null;
  uploaded_by: string | null;
  storage_path: string;
  filename: string;
  file_size: number | null;
  mime_type: string | null;
  asset_type: AssetType;
  status: MediaStatus;
  
  // Rich metadata
  title?: string;
  caption?: string;
  tags?: string[];
  credits?: string[];
  
  // Technical metadata
  duration_seconds?: number;
  width?: number;
  height?: number;
  resolution?: string;
  
  // Thumbnails
  thumbnail_path?: string;  // Path to generated thumbnail in storage bucket
  thumbnails?: Record<string, string>;
  thumbnail_status?: ThumbnailStatus;
  
  // Publishing
  public_portfolio?: boolean;
  publish_at?: string;
  expires_at?: string;
  featured?: boolean;
  sort_order?: number;
  
  // QA workflow
  qa_status?: QAStatus;
  qa_notes?: string;
  qa_by?: string;
  qa_at?: string;
  
  // Stats
  view_count?: number;
  download_count?: number;
  
  // Audit
  created_at: string;
  updated_at: string;
}

export type AssetType = 
  | 'raw' 
  | 'deliverable' 
  | 'avatar' 
  | 'portfolio' 
  | 'wip';

export type MediaStatus = 
  | 'uploaded' 
  | 'processing' 
  | 'ready' 
  | 'failed';

export type ThumbnailStatus = 
  | 'pending' 
  | 'processing' 
  | 'ready' 
  | 'failed';

export type QAStatus = 
  | 'pending' 
  | 'passed' 
  | 'rejected';

export interface UploadOptions {
  projectId?: string;
  assetType: AssetType;
  title?: string;
  caption?: string;
  tags?: string[];
}

export interface UploadResult {
  id: string;
  storagePath: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  assetType: AssetType;
}

export interface SignedUrlResult {
  path: string;
  url: string;
  expiresAt: Date;
}

// ============================================
// Project and Member Types
// ============================================

export type ProjectRole = 'client' | 'team' | 'admin';

export interface Project {
  id: string;
  title: string;
  description?: string;
  client_id: string;
  status: string;
  shoot_date?: string;
  delivery_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  created_at: string;
}

export interface CreateProjectPayload {
  title: string;
  description?: string;
  client_id: string;
}

export interface AddProjectMembersPayload {
  project_id: string;
  members: Array<{
    user_id: string;
    role: ProjectRole;
  }>;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// Upload Event Types
// ============================================

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadCompleteEvent {
  asset: MediaAsset;
  storagePath: string;
}

export interface UploadErrorEvent {
  message: string;
  code?: string;
  filename?: string;
}
