"use client";

import type { Project } from "@/lib/types/storage";
import type { MediaAsset } from "@/lib/types/storage";
import type { ProjectMember } from "./ProjectPage";

export interface ProjectOverviewProps {
  project: Project;
  members: ProjectMember[];
  recentAssets: MediaAsset[];
}

/**
 * Project Overview Tab
 * 
 * Shows summary, upcoming dates, team members, recent activity
 */
export function ProjectOverview({ project, members, recentAssets }: ProjectOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Project Details Card */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Project Details</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Status</label>
              <p className="text-white mt-1 capitalize">{project.status.replace(/_/g, " ")}</p>
            </div>
            
            {project.shoot_date && (
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Shoot Date</label>
                <p className="text-white mt-1">
                  {new Date(project.shoot_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
            
            {project.delivery_date && (
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Delivery Date</label>
                <p className="text-white mt-1">
                  {new Date(project.delivery_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
            
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Created</label>
              <p className="text-white mt-1">
                {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {project.description && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Description</label>
              <p className="text-zinc-300 mt-2">{project.description}</p>
            </div>
          )}
        </div>

        {/* Recent Files Preview */}
        {recentAssets.length > 0 && (
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Files</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {recentAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="aspect-square bg-zinc-800 rounded-lg overflow-hidden relative group"
                >
                  {asset.mime_type?.startsWith("image/") ? (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  ) : asset.mime_type?.startsWith("video/") ? (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Overlay with filename */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-xs text-white truncate w-full">
                      {asset.filename}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Team Members Card */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Team</h2>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-medium">
                  {member.user_profiles?.display_name?.[0]?.toUpperCase() || 
                   member.user_profiles?.email?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {member.user_profiles?.display_name || member.user_profiles?.email || "Unknown"}
                  </p>
                  <p className="text-xs text-zinc-500 capitalize">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">Total Files</span>
              <span className="text-white font-medium">{recentAssets.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">Team Members</span>
              <span className="text-white font-medium">{members.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">Deliverables</span>
              <span className="text-white font-medium">
                {recentAssets.filter(a => a.asset_type === "deliverable").length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectOverview;
