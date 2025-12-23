/**
 * Client Project Types
 * 
 * Type definitions for client-facing project data
 */

export interface ClientProject {
  id: string;
  title: string;
  description?: string;
  status: string;
  project_type?: string;
  shoot_date?: string;
  deadline?: string;
  project_health: 'on_track' | 'action_required' | 'delivered';
  client?: {
    id: string;
    name: string;
    company_name?: string;
  };
}

export interface ProjectStats {
  total_deliverables: number;
  pending_review: number;
  approved: number;
  in_progress: number;
  revision_requested: number;
  last_update: string;
}

export interface DeliverableAsset {
  id: string;
  title: string;
  caption?: string;
  file_type: 'image' | 'video' | 'document' | 'archive';
  mime_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_url?: string;
  preview_url?: string;
  download_url?: string;
}

export interface ClientDeliverable {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: string;
  status_label: string;
  approved_at?: string;
  revision_requested_at?: string;
  revision_reason?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  assets: DeliverableAsset[];
}

export interface DeliverableComment {
  id: string;
  deliverable_id?: string;
  media_asset_id?: string;
  body: string;
  timecode?: number;
  x_position?: number;
  y_position?: number;
  parent_id?: string;
  resolved: boolean;
  resolved_at?: string;
  created_at: string;
  updated_at?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    is_team: boolean;
  };
  is_own?: boolean;
}

export interface ActivityItem {
  id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  actor: {
    id?: string;
    name: string;
    avatar?: string;
    is_team: boolean;
  };
}

export interface ClientProjectData {
  project: ClientProject;
  stats: ProjectStats;
  deliverables: ClientDeliverable[];
  comments: DeliverableComment[];
  activity: ActivityItem[];
}

// Filter options
export type StatusFilter = 'all' | 'needs_review' | 'approved' | 'in_progress' | 'changes_requested';
export type TypeFilter = 'all' | 'image' | 'video' | 'document';
export type SortOption = 'newest' | 'oldest' | 'last_updated';
