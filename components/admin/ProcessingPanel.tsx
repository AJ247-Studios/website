"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  FilmIcon,
  PhotoIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

/**
 * ProcessingPanel
 * 
 * Shows status of background processing jobs:
 * - Thumbnail generation
 * - Video transcoding
 * - Format conversion
 * 
 * Features:
 * - Real-time progress updates
 * - ETA display
 * - Error handling with retry
 * - Expandable/collapsible
 */

interface ProcessingJob {
  id: string;
  media_asset_id: string;
  type: 'thumbnail' | 'transcode' | 'optimize' | 'watermark';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  metadata?: {
    filename?: string;
    mime_type?: string;
    output_format?: string;
    output_path?: string;
    duration_seconds?: number;
  };
}

interface ProcessingPanelProps {
  jobs: ProcessingJob[];
  onRetry?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
  isLoading?: boolean;
  refreshInterval?: number; // ms
  onRefresh?: () => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  if (diffMs < 60000) return 'Just now';
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  return date.toLocaleDateString();
}

function getJobIcon(type: string) {
  switch (type) {
    case 'thumbnail':
      return <PhotoIcon className="w-4 h-4" />;
    case 'transcode':
    case 'optimize':
      return <FilmIcon className="w-4 h-4" />;
    default:
      return <ArrowPathIcon className="w-4 h-4" />;
  }
}

function getJobLabel(type: string): string {
  switch (type) {
    case 'thumbnail': return 'Generating thumbnail';
    case 'transcode': return 'Transcoding video';
    case 'optimize': return 'Optimizing media';
    case 'watermark': return 'Adding watermark';
    default: return 'Processing';
  }
}

function StatusIndicator({ status }: { status: ProcessingJob['status'] }) {
  switch (status) {
    case 'pending':
      return <ClockIcon className="w-5 h-5 text-gray-400" />;
    case 'in_progress':
      return <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />;
    case 'completed':
      return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
    case 'failed':
      return <ExclamationCircleIcon className="w-5 h-5 text-red-400" />;
    case 'cancelled':
      return <XMarkIcon className="w-5 h-5 text-gray-400" />;
    default:
      return null;
  }
}

function JobRow({ 
  job, 
  onRetry, 
  onCancel 
}: { 
  job: ProcessingJob; 
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Estimate ETA based on progress and time elapsed
  const getETA = () => {
    if (job.status !== 'in_progress' || !job.started_at || !job.progress) return null;
    
    const elapsed = Date.now() - new Date(job.started_at).getTime();
    const estimatedTotal = (elapsed / job.progress) * 100;
    const remaining = estimatedTotal - elapsed;
    
    if (remaining > 0) {
      return formatDuration(remaining);
    }
    return null;
  };

  const eta = getETA();

  return (
    <div className={`
      rounded-lg border transition
      ${job.status === 'failed' ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/5'}
    `}>
      <div className="p-4 flex items-center gap-4">
        {/* Status indicator */}
        <div className="shrink-0">
          <StatusIndicator status={job.status} />
        </div>

        {/* Job info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {getJobIcon(job.type)}
            <span className="text-white font-medium truncate">
              {job.metadata?.filename || getJobLabel(job.type)}
            </span>
          </div>
          
          {/* Progress bar for in_progress */}
          {job.status === 'in_progress' && job.progress !== undefined && (
            <div className="mt-2">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400 transition-all duration-300"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>{job.progress}%</span>
                {eta && <span>~{eta} remaining</span>}
              </div>
            </div>
          )}

          {/* Error message */}
          {job.status === 'failed' && job.error_message && (
            <p className="text-sm text-red-400 mt-1">{job.error_message}</p>
          )}

          {/* Timing info */}
          <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
            <span>Created {formatTimeAgo(job.created_at)}</span>
            {job.completed_at && (
              <span>Completed {formatTimeAgo(job.completed_at)}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center gap-2">
          {job.status === 'failed' && onRetry && (
            <button
              onClick={() => onRetry(job.id)}
              className="px-3 py-1.5 text-sm bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] rounded-lg transition"
            >
              Retry
            </button>
          )}
          {(job.status === 'pending' || job.status === 'in_progress') && onCancel && (
            <button
              onClick={() => onCancel(job.id)}
              className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-white/70 rounded-lg transition"
            >
              Cancel
            </button>
          )}
          
          {/* Expand/collapse */}
          {job.metadata && Object.keys(job.metadata).length > 1 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1.5 text-white/50 hover:text-white transition"
            >
              {showDetails ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {showDetails && job.metadata && (
        <div className="px-4 pb-4 pt-2 border-t border-white/10">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {job.metadata.mime_type && (
              <>
                <dt className="text-white/50">Input Type</dt>
                <dd className="text-white">{job.metadata.mime_type}</dd>
              </>
            )}
            {job.metadata.output_format && (
              <>
                <dt className="text-white/50">Output Format</dt>
                <dd className="text-white">{job.metadata.output_format}</dd>
              </>
            )}
            {job.metadata.duration_seconds && (
              <>
                <dt className="text-white/50">Duration</dt>
                <dd className="text-white">{formatDuration(job.metadata.duration_seconds * 1000)}</dd>
              </>
            )}
            {job.metadata.output_path && (
              <>
                <dt className="text-white/50">Output</dt>
                <dd className="text-white truncate">{job.metadata.output_path}</dd>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

export default function ProcessingPanel({
  jobs,
  onRetry,
  onCancel,
  isLoading = false,
  refreshInterval = 5000,
  onRefresh,
  collapsible = true,
  defaultExpanded = true,
}: ProcessingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Auto-refresh for active jobs
  useEffect(() => {
    const hasActiveJobs = jobs.some(j => 
      j.status === 'pending' || j.status === 'in_progress'
    );

    if (!hasActiveJobs || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
      setLastRefresh(Date.now());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [jobs, refreshInterval, onRefresh]);

  // Group jobs by status
  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const activeJobs = jobs.filter(j => j.status === 'in_progress');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const failedJobs = jobs.filter(j => j.status === 'failed');

  const totalActive = pendingJobs.length + activeJobs.length;

  if (jobs.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="bg-[#1a1a2e]/50 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div 
        className={`
          p-4 flex items-center justify-between
          ${collapsible ? 'cursor-pointer hover:bg-white/5' : ''}
        `}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ArrowPathIcon className={`w-5 h-5 text-white/60 ${totalActive > 0 ? 'animate-spin' : ''}`} />
            {totalActive > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalActive}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-white">Processing Queue</h3>
            <p className="text-sm text-white/50">
              {totalActive > 0 
                ? `${activeJobs.length} active, ${pendingJobs.length} pending`
                : `${completedJobs.length} completed`
              }
              {failedJobs.length > 0 && `, ${failedJobs.length} failed`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={(e) => { e.stopPropagation(); onRefresh(); }}
              className="p-2 text-white/50 hover:text-white transition"
              title="Refresh"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          {collapsible && (
            <button className="p-1 text-white/50">
              {isExpanded ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Job List */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-3 max-h-[400px] overflow-y-auto">
          {/* Loading state */}
          {isLoading && jobs.length === 0 && (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse bg-white/5 rounded-lg h-16" />
              ))}
            </div>
          )}

          {/* Failed jobs first */}
          {failedJobs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-red-400 uppercase tracking-wide">Failed</h4>
              {failedJobs.map(job => (
                <JobRow key={job.id} job={job} onRetry={onRetry} onCancel={onCancel} />
              ))}
            </div>
          )}

          {/* Active jobs */}
          {activeJobs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-blue-400 uppercase tracking-wide">In Progress</h4>
              {activeJobs.map(job => (
                <JobRow key={job.id} job={job} onRetry={onRetry} onCancel={onCancel} />
              ))}
            </div>
          )}

          {/* Pending jobs */}
          {pendingJobs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pending</h4>
              {pendingJobs.map(job => (
                <JobRow key={job.id} job={job} onRetry={onRetry} onCancel={onCancel} />
              ))}
            </div>
          )}

          {/* Recent completed jobs (show last 5) */}
          {completedJobs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-green-400 uppercase tracking-wide">
                Recently Completed
              </h4>
              {completedJobs.slice(0, 5).map(job => (
                <JobRow key={job.id} job={job} onRetry={onRetry} onCancel={onCancel} />
              ))}
              {completedJobs.length > 5 && (
                <p className="text-xs text-white/40 text-center py-2">
                  +{completedJobs.length - 5} more completed
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Summary bar when collapsed */}
      {!isExpanded && totalActive > 0 && (
        <div className="px-4 pb-4">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-400 transition-all duration-500"
              style={{ 
                width: `${(completedJobs.length / jobs.length) * 100}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export type { ProcessingJob };
