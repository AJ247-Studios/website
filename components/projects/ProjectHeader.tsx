"use client";

import type { Project } from "@/lib/types/storage";

export interface ProjectHeaderProps {
  project: Project;
  memberCount: number;
  assetCount: number;
  canUpload: boolean;
  canDeliver: boolean;
  onUploadClick: () => void;
  onDeliverClick: () => void;
  selectedCount: number;
}

/**
 * Project Header
 * 
 * Shows: title, client, status, quick stats, action buttons
 */
export function ProjectHeader({
  project,
  memberCount,
  assetCount,
  canUpload,
  canDeliver,
  onUploadClick,
  onDeliverClick,
  selectedCount,
}: ProjectHeaderProps) {
  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    review: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    completed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusColor = statusColors[project.status] || statusColors.active;

  return (
    <header className="bg-zinc-900/50 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Title & Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white truncate">
                {project.title}
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusColor}`}>
                {project.status.replace(/_/g, " ")}
              </span>
            </div>
            
            {project.description && (
              <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                {project.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {memberCount} member{memberCount !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {assetCount} file{assetCount !== 1 ? "s" : ""}
              </span>
              {project.shoot_date && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(project.shoot_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {selectedCount > 0 && (
              <span className="text-sm text-amber-400">
                {selectedCount} selected
              </span>
            )}
            
            {canDeliver && (
              <button
                onClick={onDeliverClick}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Prepare Deliverable
              </button>
            )}
            
            {canUpload && (
              <button
                onClick={onUploadClick}
                className="px-4 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Add Files
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default ProjectHeader;
