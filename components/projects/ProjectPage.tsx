"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { useProjectMedia } from "@/hooks/useProjectMedia";
import type { Project, ProjectRole } from "@/lib/types/storage";
import type { MediaAsset } from "@/lib/types/storage";

// Sub-components (will be created separately)
import { ProjectHeader } from "./ProjectHeader";
import { ProjectTabs, TabId } from "./ProjectTabs";
import { ProjectOverview } from "./ProjectOverview";
import { StudioFileGallery } from "./StudioFileGallery";
import { ProjectTimeline } from "./ProjectTimeline";
import { ProjectMembers } from "./ProjectMembers";
import { UploadModal } from "./UploadModal";
import { DeliveryModal } from "./DeliveryModal";

export interface ProjectMember {
  id: string;
  user_id: string;
  role: ProjectRole;
  created_at: string;
  user_profiles?: {
    display_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export interface ProjectPageProps {
  projectId: string;
  initialProject?: Project;
}

/**
 * Project Page - Single source of truth
 * 
 * Sections:
 * 1. Overview - summary, upcoming date, contact
 * 2. Files / Gallery - raw, edited, deliverables filters
 * 3. Timeline / Activity - audit log
 * 4. Members / Settings (admin only)
 */
export function ProjectPage({ projectId, initialProject }: ProjectPageProps) {
  const { supabase, session, role: userRole } = useSupabase();
  
  // State
  const [project, setProject] = useState<Project | null>(initialProject || null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("files");
  const [isLoading, setIsLoading] = useState(!initialProject);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);
  
  // Media hook
  const { 
    assets, 
    loadAssets, 
    isLoading: isLoadingAssets,
    uploadFile,
    isUploading,
    uploadProgress,
  } = useProjectMedia();

  // Check permissions
  const isAdmin = userRole === "admin";
  const isTeam = userRole === "team" || isAdmin;
  const canUpload = isTeam;
  const canManageMembers = isAdmin;
  const canDeliver = isTeam;

  // Load project data
  const loadProject = useCallback(async () => {
    if (!session) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const token = session.access_token;
      
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load project");
      }

      const data = await res.json();
      setProject(data.project);
      setMembers(data.members || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, session]);

  // Initial load
  useEffect(() => {
    if (!initialProject) {
      loadProject();
    }
    loadAssets(projectId);
  }, [projectId, initialProject, loadProject, loadAssets]);

  // Handle upload complete
  const handleUploadComplete = useCallback(() => {
    loadAssets(projectId);
    setShowUploadModal(false);
  }, [projectId, loadAssets]);

  // Handle delivery
  const handleDeliveryComplete = useCallback(() => {
    loadAssets(projectId);
    setShowDeliveryModal(false);
    setSelectedAssets([]);
  }, [projectId, loadAssets]);

  // Handle asset selection for delivery
  const handleSelectForDelivery = useCallback((asset: MediaAsset) => {
    setSelectedAssets(prev => {
      const exists = prev.find(a => a.id === asset.id);
      if (exists) {
        return prev.filter(a => a.id !== asset.id);
      }
      return [...prev, asset];
    });
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Unable to load project</h2>
        <p className="text-zinc-400 mb-4">{error || "Project not found"}</p>
        <button
          onClick={loadProject}
          className="px-4 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <ProjectHeader
        project={project}
        memberCount={members.length}
        assetCount={assets.length}
        canUpload={canUpload}
        canDeliver={canDeliver && selectedAssets.length > 0}
        onUploadClick={() => setShowUploadModal(true)}
        onDeliverClick={() => setShowDeliveryModal(true)}
        selectedCount={selectedAssets.length}
      />

      {/* Tabs */}
      <ProjectTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showMembersTab={canManageMembers}
        counts={{
          files: assets.length,
          members: members.length,
        }}
      />

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <ProjectOverview
            project={project}
            members={members}
            recentAssets={assets.slice(0, 6)}
          />
        )}

        {activeTab === "files" && (
          <StudioFileGallery
            projectId={projectId}
            canUpload={canUpload}
            canSelect={canDeliver}
            canEdit={isTeam}
            canDelete={isAdmin}
            onUploadClick={() => setShowUploadModal(true)}
            onSelectionChange={setSelectedAssets}
          />
        )}

        {activeTab === "timeline" && (
          <ProjectTimeline projectId={projectId} />
        )}

        {activeTab === "members" && canManageMembers && (
          <ProjectMembers
            projectId={projectId}
            members={members}
            onMembersChange={loadProject}
          />
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          projectId={projectId}
          onClose={() => setShowUploadModal(false)}
          onComplete={handleUploadComplete}
        />
      )}

      {/* Delivery Modal */}
      {showDeliveryModal && selectedAssets.length > 0 && (
        <DeliveryModal
          projectId={projectId}
          assets={selectedAssets}
          onClose={() => setShowDeliveryModal(false)}
          onComplete={handleDeliveryComplete}
        />
      )}
    </div>
  );
}

export default ProjectPage;
