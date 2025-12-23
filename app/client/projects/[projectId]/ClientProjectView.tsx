/**
 * Client Project View Component
 * 
 * Main client-facing component for viewing and interacting with project deliverables.
 * Features:
 * - Project header with status chip
 * - Quick stats cards
 * - Filterable deliverables grid
 * - Lightbox for asset preview
 * - Approve/request-change workflow
 * - Activity feed
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { 
  ClientProjectData, 
  ClientDeliverable, 
  DeliverableAsset,
  StatusFilter,
  TypeFilter,
  SortOption 
} from "./types";
import DeliverableDetailModal from "./DeliverableDetailModal";

interface ClientProjectViewProps {
  projectId: string;
}

// Status colors and labels
const STATUS_CONFIG = {
  delivered: { 
    label: 'Needs Review', 
    bg: 'bg-amber-100 dark:bg-amber-900/30', 
    text: 'text-amber-800 dark:text-amber-200',
    dot: 'bg-amber-500'
  },
  approved: { 
    label: 'Approved', 
    bg: 'bg-emerald-100 dark:bg-emerald-900/30', 
    text: 'text-emerald-800 dark:text-emerald-200',
    dot: 'bg-emerald-500'
  },
  pending: { 
    label: 'In Progress', 
    bg: 'bg-blue-100 dark:bg-blue-900/30', 
    text: 'text-blue-800 dark:text-blue-200',
    dot: 'bg-blue-500'
  },
  revision_requested: { 
    label: 'Changes Requested', 
    bg: 'bg-orange-100 dark:bg-orange-900/30', 
    text: 'text-orange-800 dark:text-orange-200',
    dot: 'bg-orange-500'
  },
};

const PROJECT_HEALTH_CONFIG = {
  on_track: {
    label: 'On Track',
    bg: 'bg-emerald-500',
    icon: '✓',
  },
  action_required: {
    label: 'Action Required',
    bg: 'bg-amber-500',
    icon: '!',
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-blue-500',
    icon: '★',
  },
};

export default function ClientProjectView({ projectId }: ClientProjectViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ClientProjectData | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [selectedDeliverable, setSelectedDeliverable] = useState<ClientDeliverable | null>(null);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
  
  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch project data
  const fetchData = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/login');
        return;
      }
      
      const res = await fetch(`/api/client/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to load project');
      }
      
      const projectData = await res.json();
      setData(projectData);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter and sort deliverables
  const filteredDeliverables = data?.deliverables
    .filter(d => {
      // Status filter
      if (statusFilter !== 'all') {
        const statusMap: Record<StatusFilter, string[]> = {
          all: [],
          needs_review: ['delivered'],
          approved: ['approved'],
          in_progress: ['pending'],
          changes_requested: ['revision_requested'],
        };
        if (!statusMap[statusFilter].includes(d.status)) return false;
      }
      
      // Type filter
      if (typeFilter !== 'all') {
        const hasType = d.assets.some(a => a.file_type === typeFilter);
        if (!hasType) return false;
      }
      
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = d.title.toLowerCase().includes(query);
        const matchesAsset = d.assets.some(a => a.title?.toLowerCase().includes(query));
        if (!matchesTitle && !matchesAsset) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'last_updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    }) || [];

  // Handle approve
  const handleApprove = async (deliverableId: string) => {
    setActionLoading(deliverableId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Not authenticated');
      
      const res = await fetch(`/api/client/deliverables/${deliverableId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to approve');
      }
      
      // Refresh data
      await fetchData();
      setSelectedDeliverable(null);
    } catch (err: any) {
      alert(err.message || 'Failed to approve deliverable');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle request change
  const handleRequestChange = async (deliverableId: string, reason: string, timecode?: number) => {
    setActionLoading(deliverableId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Not authenticated');
      
      const res = await fetch(`/api/client/deliverables/${deliverableId}/request-change`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, timecode }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to request change');
      }
      
      // Refresh data
      await fetchData();
      setSelectedDeliverable(null);
    } catch (err: any) {
      alert(err.message || 'Failed to request change');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle download
  const handleDownload = (asset: DeliverableAsset) => {
    if (asset.download_url) {
      window.open(asset.download_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Unable to load project</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/portal')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Portal
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { project, stats } = data;
  const healthConfig = PROJECT_HEALTH_CONFIG[project.project_health];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push('/portal')}
                  className="p-1 -ml-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
                  {project.title}
                </h1>
                <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${healthConfig.bg} text-white`}>
                  <span>{healthConfig.icon}</span>
                  {healthConfig.label}
                </span>
              </div>
              {project.description && (
                <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
            <button
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message Team
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Deliverables"
            value={stats.total_deliverables}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
          <StatCard
            label="Pending Review"
            value={stats.pending_review}
            highlight={stats.pending_review > 0}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Last Update"
            value={formatTimeAgo(stats.last_update)}
            isText
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search deliverables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="needs_review">Needs Review</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="changes_requested">Changes Requested</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="image">Photos</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>

            {/* Sort */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="last_updated">Last Updated</option>
            </select>
          </div>
        </div>

        {/* Deliverables Grid */}
        {filteredDeliverables.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No deliverables found</h3>
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Deliverables will appear here once uploaded'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="deliverables">
            {filteredDeliverables.map((deliverable) => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
                onOpen={() => {
                  setSelectedDeliverable(deliverable);
                  setSelectedAssetIndex(0);
                }}
                onApprove={() => handleApprove(deliverable.id)}
                onDownload={() => deliverable.assets[0] && handleDownload(deliverable.assets[0])}
                isLoading={actionLoading === deliverable.id}
              />
            ))}
          </div>
        )}

        {/* Activity Feed */}
        {data.activity.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {data.activity.slice(0, 10).map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Deliverable Detail Modal */}
      {selectedDeliverable && (
        <DeliverableDetailModal
          deliverable={selectedDeliverable}
          comments={data.comments.filter(c => c.deliverable_id === selectedDeliverable.id)}
          selectedAssetIndex={selectedAssetIndex}
          onAssetChange={setSelectedAssetIndex}
          onClose={() => setSelectedDeliverable(null)}
          onApprove={() => handleApprove(selectedDeliverable.id)}
          onRequestChange={(reason, timecode) => handleRequestChange(selectedDeliverable.id, reason, timecode)}
          onDownload={handleDownload}
          isLoading={actionLoading === selectedDeliverable.id}
          projectId={projectId}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  icon, 
  highlight = false,
  isText = false 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode;
  highlight?: boolean;
  isText?: boolean;
}) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border p-4 ${
      highlight 
        ? 'border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/10' 
        : 'border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          highlight 
            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
        }`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className={`font-semibold text-slate-900 dark:text-white ${isText ? 'text-sm' : 'text-xl'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// Deliverable Card Component
function DeliverableCard({
  deliverable,
  onOpen,
  onApprove,
  onDownload,
  isLoading,
}: {
  deliverable: ClientDeliverable;
  onOpen: () => void;
  onApprove: () => void;
  onDownload: () => void;
  isLoading: boolean;
}) {
  const statusConfig = STATUS_CONFIG[deliverable.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const thumbnail = deliverable.assets[0]?.thumbnail_url;
  const isVideo = deliverable.assets.some(a => a.file_type === 'video');
  const canApprove = deliverable.status === 'delivered';

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <button
        onClick={onOpen}
        className="w-full aspect-4/3 relative bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={deliverable.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Video indicator */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </div>

        {/* Asset count */}
        {deliverable.assets.length > 1 && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 text-xs font-medium bg-black/50 text-white rounded-full backdrop-blur-sm">
              {deliverable.assets.length} items
            </span>
          </div>
        )}
      </button>

      {/* Info & Actions */}
      <div className="p-4">
        <h3 className="font-medium text-slate-900 dark:text-white truncate mb-1">
          {deliverable.title}
        </h3>
        {deliverable.due_date && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Due: {new Date(deliverable.due_date).toLocaleDateString()}
          </p>
        )}

        {/* Action buttons */}
        {canApprove ? (
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              disabled={isLoading}
              className="flex-1 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Approving...' : 'Approve'}
            </button>
            <button
              onClick={onOpen}
              className="flex-1 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Review
            </button>
          </div>
        ) : deliverable.status === 'approved' ? (
          <button
            onClick={onDownload}
            className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            Download
          </button>
        ) : (
          <button
            onClick={onOpen}
            className="w-full py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}

// Activity Row Component
function ActivityRow({ activity }: { activity: any }) {
  const getActivityIcon = (action: string) => {
    const icons: Record<string, { icon: React.ReactNode; color: string }> = {
      deliverable_approved: {
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
        color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
      },
      deliverable_revision_requested: {
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
        color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
      },
      comment_added: {
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>,
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
      },
    };
    return icons[action] || {
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
    };
  };

  const { icon, color } = getActivityIcon(activity.action);
  const verb = activity.action.replace(/_/g, ' ');

  return (
    <div className="flex items-start gap-3 p-4">
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 dark:text-white">
          <span className="font-medium">{activity.actor.name}</span>
          {' '}{verb}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {formatTimeAgo(activity.created_at)}
        </p>
      </div>
    </div>
  );
}

// Utility function
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
