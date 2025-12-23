/**
 * Safe Status Helper
 * 
 * Provides defensive access to media asset status with fallbacks.
 * This prevents crashes when the status column hasn't been migrated yet
 * or when dealing with legacy data.
 */

export type MediaWorkflowStatus = 
  | 'raw' 
  | 'in_progress' 
  | 'deliverable'
  | 'uploaded' 
  | 'processing' 
  | 'ready' 
  | 'failed' 
  | 'skipped'
  | 'unknown';

export interface AssetWithStatus {
  status?: string | null;
  thumbnail_status?: string | null;
  thumbnail_path?: string | null;
}

/**
 * Safely get the status of a media asset with fallbacks
 * 
 * Priority:
 * 1. asset.status (if present)
 * 2. asset.thumbnail_status (legacy field)
 * 3. 'ready' if thumbnail_path exists
 * 4. 'uploaded' as final fallback
 */
export function safeStatus(asset: AssetWithStatus | null | undefined): MediaWorkflowStatus {
  if (!asset) return 'unknown';
  
  // Primary: use status column if present
  if (asset.status && isValidStatus(asset.status)) {
    return asset.status as MediaWorkflowStatus;
  }
  
  // Fallback: use thumbnail_status if present
  if (asset.thumbnail_status && isValidStatus(asset.thumbnail_status)) {
    return asset.thumbnail_status as MediaWorkflowStatus;
  }
  
  // Infer from thumbnail_path
  if (asset.thumbnail_path) {
    return 'ready';
  }
  
  // Default
  return 'uploaded';
}

/**
 * Check if a status value is valid
 */
export function isValidStatus(status: string): boolean {
  const validStatuses = [
    'raw', 'in_progress', 'deliverable',
    'uploaded', 'processing', 'ready', 'failed', 'skipped'
  ];
  return validStatuses.includes(status);
}

/**
 * Status display configuration
 */
export const STATUS_CONFIG: Record<MediaWorkflowStatus, { 
  label: string; 
  color: string;
  description: string;
}> = {
  // Studio workflow statuses
  raw: { 
    label: 'Raw', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'Unprocessed original file'
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    description: 'Currently being edited'
  },
  deliverable: { 
    label: 'Deliverable', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    description: 'Ready for client delivery'
  },
  
  // Pipeline statuses
  uploaded: { 
    label: 'Uploaded', 
    color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    description: 'File uploaded, awaiting processing'
  },
  processing: { 
    label: 'Processing', 
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    description: 'Thumbnail/preview being generated'
  },
  ready: { 
    label: 'Ready', 
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description: 'Fully processed and viewable'
  },
  failed: { 
    label: 'Failed', 
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    description: 'Processing failed'
  },
  skipped: { 
    label: 'Skipped', 
    color: 'bg-zinc-600/20 text-zinc-500 border-zinc-600/30',
    description: 'Processing skipped (unsupported format)'
  },
  
  // Fallback
  unknown: { 
    label: 'Unknown', 
    color: 'bg-zinc-700/20 text-zinc-500 border-zinc-700/30',
    description: 'Status not set'
  },
};

/**
 * Get user-friendly label for a status
 */
export function getStatusLabel(status: MediaWorkflowStatus | string): string {
  const config = STATUS_CONFIG[status as MediaWorkflowStatus];
  return config?.label || status;
}

/**
 * Get color classes for a status badge
 */
export function getStatusColor(status: MediaWorkflowStatus | string): string {
  const config = STATUS_CONFIG[status as MediaWorkflowStatus];
  return config?.color || STATUS_CONFIG.unknown.color;
}

/**
 * All valid status values for filter dropdowns
 */
export const ALL_STATUSES: MediaWorkflowStatus[] = [
  'uploaded',
  'processing', 
  'ready',
  'raw',
  'in_progress',
  'deliverable',
  'failed',
  'skipped',
];

/**
 * Common status groups for simplified filtering
 */
export const STATUS_GROUPS = {
  pipeline: ['uploaded', 'processing', 'ready', 'failed', 'skipped'],
  workflow: ['raw', 'in_progress', 'deliverable'],
  active: ['uploaded', 'processing', 'raw', 'in_progress'],
  complete: ['ready', 'deliverable'],
  error: ['failed'],
};
