/**
 * Client Deliverables & Review System Types
 * 
 * Comprehensive type definitions for the deliverable workflow:
 * - Deliverables (packages of work for client review)
 * - DeliverableAssets (media assets within deliverables)
 * - Comments (with video timecode & image annotation support)
 * - Notifications (event queue for emails/push)
 */

// ============================================
// Deliverable Status & Workflow
// ============================================

/**
 * Internal status values stored in DB
 */
export type DeliverableStatus = 
  | 'pending'             // Work in progress
  | 'delivered'           // Ready for client review
  | 'approved'            // Client approved
  | 'revision_requested'  // Client requested changes
  | 'archived';           // Archived/completed

/**
 * Client-facing status labels
 */
export const STATUS_LABELS: Record<DeliverableStatus, string> = {
  pending: 'In Progress',
  delivered: 'Needs Review',
  approved: 'Approved',
  revision_requested: 'Changes Requested',
  archived: 'Archived',
};

/**
 * Status badge styling configuration
 */
export const STATUS_CONFIG: Record<DeliverableStatus, {
  label: string;
  bg: string;
  text: string;
  dot: string;
}> = {
  pending: {
    label: 'In Progress',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-200',
    dot: 'bg-blue-500',
  },
  delivered: {
    label: 'Needs Review',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-800 dark:text-amber-200',
    dot: 'bg-amber-500',
  },
  approved: {
    label: 'Approved',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-800 dark:text-emerald-200',
    dot: 'bg-emerald-500',
  },
  revision_requested: {
    label: 'Changes Requested',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-200',
    dot: 'bg-orange-500',
  },
  archived: {
    label: 'Archived',
    bg: 'bg-slate-100 dark:bg-slate-800/30',
    text: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
};

// ============================================
// Deliverable Types
// ============================================

/**
 * Core deliverable record from DB
 */
export interface Deliverable {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: DeliverableStatus;
  
  // Approval tracking
  approved_at?: string;
  approved_by?: string;
  revision_requested_at?: string;
  revision_requested_by?: string;
  revision_reason?: string;
  
  // Delivery tracking
  delivered_at?: string;
  delivered_by?: string;
  
  // Display
  sort_order: number;
  
  // Audit
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Client-facing deliverable with enriched data
 */
export interface ClientDeliverable extends Deliverable {
  // Client-friendly status label
  client_status: string;
  
  // Assets in this deliverable
  assets: DeliverableAsset[];
  
  // Comment count for quick display
  comment_count?: number;
  unresolved_comment_count?: number;
  
  // Thumbnail for card display (from first asset)
  thumbnail_url?: string;
  
  // Approver info if approved
  approved_by_name?: string;
}

// ============================================
// Deliverable Asset Types
// ============================================

/**
 * File type categories
 */
export type FileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

/**
 * Junction record linking media assets to deliverables
 */
export interface DeliverableAssetRecord {
  id: string;
  deliverable_id: string;
  media_asset_id: string;
  sort_order: number;
  custom_title?: string;
  created_at: string;
}

/**
 * Full asset data with media asset info and signed URLs
 */
export interface DeliverableAsset extends DeliverableAssetRecord {
  // Media asset info
  filename: string;
  original_filename?: string;
  file_type: FileType;
  mime_type: string;
  file_size: number;
  
  // Resolution (for images/video)
  width?: number;
  height?: number;
  
  // Duration (for video/audio)
  duration?: number;
  
  // Signed URLs (generated server-side)
  thumbnail_url?: string;
  preview_url?: string;
  download_url?: string;
  
  // URL expiration
  urls_expire_at?: string;
}

// ============================================
// Comment Types
// ============================================

/**
 * Comment author info
 */
export interface CommentAuthor {
  id: string;
  name: string;
  avatar?: string;
  is_team: boolean;
}

/**
 * Comment record from DB
 */
export interface Comment {
  id: string;
  deliverable_id?: string;
  media_asset_id?: string;
  user_id: string;
  body: string;
  
  // Video timecode (seconds)
  timecode?: number;
  
  // Image annotation coordinates (percentage 0-100)
  x_position?: number;
  y_position?: number;
  
  // Metadata for rich content
  metadata?: Record<string, unknown>;
  
  // Thread support
  parent_id?: string;
  replies?: Comment[];
  
  // Resolution status
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  
  // Audit
  created_at: string;
  updated_at: string;
}

/**
 * Client-facing comment with author info
 */
export interface ClientComment extends Comment {
  author: CommentAuthor;
  is_own: boolean;
  
  // Formatted timecode display (e.g., "1:23")
  timecode_display?: string;
  
  // Reply thread
  replies?: ClientComment[];
}

/**
 * New comment form data
 */
export interface NewCommentData {
  body: string;
  deliverable_id?: string;
  media_asset_id?: string;
  timecode?: number;
  x_position?: number;
  y_position?: number;
  parent_id?: string;
}

// ============================================
// Notification Types
// ============================================

/**
 * Notification types
 */
export type NotificationType =
  | 'deliverable_ready'
  | 'deliverable_approved'
  | 'deliverable_revision_requested'
  | 'comment_added'
  | 'comment_reply'
  | 'due_date_reminder'
  | 'project_status_changed'
  | 'invoice_sent'
  | 'payment_received';

/**
 * Entity types that notifications can link to
 */
export type NotificationEntityType = 
  | 'deliverable' 
  | 'comment' 
  | 'project' 
  | 'invoice';

/**
 * Notification record from DB
 */
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body?: string;
  
  // Link to entity
  entity_type?: NotificationEntityType;
  entity_id?: string;
  
  // Additional payload data
  payload?: Record<string, unknown>;
  
  // Delivery status
  sent_at?: string;
  read_at?: string;
  email_sent: boolean;
  email_sent_at?: string;
  
  // Audit
  created_at: string;
}

/**
 * Client notification with UI helpers
 */
export interface ClientNotification extends Notification {
  // Formatted time display
  time_ago: string;
  
  // UI state
  is_read: boolean;
  
  // Action URL based on entity
  action_url?: string;
}

// ============================================
// API Response Types
// ============================================

/**
 * Project data with deliverables for client API
 */
export interface ClientProjectData {
  project: {
    id: string;
    title: string;
    description?: string;
    status: string;
    project_type?: string;
    shoot_date?: string;
    deadline?: string;
    created_at: string;
    updated_at: string;
    client?: {
      id: string;
      name: string;
      company_name?: string;
    };
  };
  
  deliverables: ClientDeliverable[];
  
  stats: {
    total_deliverables: number;
    needs_review: number;
    approved: number;
    in_progress: number;
    changes_requested: number;
  };
  
  // Project health indicator
  health: 'on_track' | 'action_required' | 'delivered';
}

/**
 * Approve deliverable response
 */
export interface ApproveResponse {
  ok: boolean;
  data: Deliverable;
  notification_id?: string;
}

/**
 * Request change response
 */
export interface RequestChangeResponse {
  ok: boolean;
  data: Deliverable;
  comment_id?: string;
  notification_id?: string;
}

/**
 * Comments list response
 */
export interface CommentsResponse {
  comments: ClientComment[];
  total: number;
  has_more: boolean;
}

// ============================================
// Filter & Sort Types
// ============================================

/**
 * Status filter options for deliverables list
 */
export type StatusFilter = 
  | 'all' 
  | 'needs_review' 
  | 'approved' 
  | 'in_progress' 
  | 'changes_requested';

/**
 * Type filter options for deliverables list
 */
export type TypeFilter = 
  | 'all' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'document';

/**
 * Sort options for deliverables list
 */
export type SortOption = 
  | 'newest' 
  | 'oldest' 
  | 'due_date' 
  | 'status' 
  | 'title';

// ============================================
// Utility Types
// ============================================

/**
 * Format seconds to timecode string (e.g., 123.5 -> "2:03")
 */
export function formatTimecode(seconds?: number): string | undefined {
  if (seconds === undefined || seconds === null) return undefined;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse timecode string to seconds (e.g., "2:03" -> 123)
 */
export function parseTimecode(timecode: string): number | undefined {
  const match = timecode.match(/^(\d+):(\d{2})$/);
  if (!match) return undefined;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

/**
 * Get file type from MIME type
 */
export function getFileType(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text/')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('gzip')) return 'archive';
  return 'other';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
