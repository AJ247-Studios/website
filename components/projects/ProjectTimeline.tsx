"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/components/SupabaseProvider";

export interface ProjectTimelineProps {
  projectId: string;
}

interface ActivityItem {
  id: string;
  type: string;
  actor_name: string;
  description: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

/**
 * Project Timeline / Activity Feed
 * 
 * Shows audit log of:
 * - File uploads
 * - Deliveries
 * - Approvals
 * - Status changes
 * - Member additions
 */
export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  const { supabase, session } = useSupabase();
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load activities
  useEffect(() => {
    async function loadActivities() {
      if (!session) return;

      setIsLoading(true);

      try {
        // In a real app, this would fetch from an audit_logs table
        // For now, we'll generate some placeholder activities based on media_assets
        const { data: assets } = await supabase
          .from("media_assets")
          .select("id, filename, created_at, uploaded_by, asset_type")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(20);

        // Transform to activity items
        const activityItems: ActivityItem[] = (assets || []).map((asset) => ({
          id: asset.id,
          type: "file_uploaded",
          actor_name: "Team Member", // Would join with user_profiles in real app
          description: `Uploaded ${asset.filename}`,
          created_at: asset.created_at,
          metadata: { asset_type: asset.asset_type },
        }));

        setActivities(activityItems);
      } catch (err) {
        console.error("Failed to load activities:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadActivities();
  }, [projectId, session, supabase]);

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "file_uploaded":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
        );
      case "deliverable_created":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        );
      case "approved":
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case "revision_requested":
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      case "member_added":
        return (
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <svg className="w-12 h-12 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-white mb-2">No activity yet</h3>
        <p className="text-zinc-400 text-sm">
          Activity will appear here as you work on this project
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
      <h2 className="text-lg font-semibold text-white mb-6">Activity</h2>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-800" />
        
        {/* Activity items */}
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative flex gap-4 pl-1">
              {/* Icon */}
              <div className="relative z-10">
                {getActivityIcon(activity.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-white">
                      <span className="font-medium">{activity.actor_name}</span>
                      {" "}
                      <span className="text-zinc-400">{activity.description}</span>
                    </p>
                    {(() => {
                      const assetType = activity.metadata?.asset_type;
                      return typeof assetType === 'string' ? (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded">
                          {assetType}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <span className="text-xs text-zinc-500 whitespace-nowrap">
                    {formatRelativeTime(activity.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectTimeline;
