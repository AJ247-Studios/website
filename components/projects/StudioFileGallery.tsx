"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import type { MediaAsset, AssetType, MediaStatus } from "@/lib/types/storage";
import { FilterPanel, FilterState, FilterCounts, SortOption } from "./FilterPanel";
import { MediaGrid, ViewMode, ThumbnailSize } from "./MediaGrid";
import { AssetDetailDrawer } from "./AssetDetailDrawer";

export interface StudioFileGalleryProps {
  projectId: string;
  canUpload: boolean;
  canSelect: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onUploadClick: () => void;
  onSelectionChange?: (assets: MediaAsset[]) => void;
}

const DEFAULT_FILTERS: FilterState = {
  assetTypes: [],
  statuses: [],
  tags: [],
  uploaders: [],
  search: "",
};

/**
 * StudioFileGallery - Professional media gallery component
 * 
 * Features:
 * - Grid/List/Timeline views with configurable thumbnail sizes
 * - Faceted filtering with counts (type, status, tags, uploader, date)
 * - Server-side pagination with infinite scroll
 * - Asset detail drawer with edit capabilities
 * - Bulk selection and actions
 * - Keyboard navigation
 * - Responsive design
 */
export function StudioFileGallery({
  projectId,
  canUpload,
  canSelect,
  canEdit = false,
  canDelete = false,
  onUploadClick,
  onSelectionChange,
}: StudioFileGalleryProps) {
  const { supabase, session } = useSupabase();
  
  // State
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // View settings
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [thumbnailSize, setThumbnailSize] = useState<ThumbnailSize>("md");
  
  // Filters
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [counts, setCounts] = useState<FilterCounts>({
    byType: {},
    byStatus: {},
    byTag: {},
    byUploader: {},
    total: 0,
    filtered: 0,
  });
  const [uploaderNames, setUploaderNames] = useState<Record<string, string>>({});
  
  // Pagination
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 48;
  
  // Selection
  const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);
  
  // Detail drawer
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Mobile filter collapse
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);

  // Fetch assets from API
  const fetchAssets = useCallback(async (
    newOffset: number = 0,
    append: boolean = false
  ) => {
    if (!session) return;
    
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.assetTypes.length > 0) {
        params.set('asset_types', filters.assetTypes.join(','));
      }
      if (filters.statuses.length > 0) {
        params.set('statuses', filters.statuses.join(','));
      }
      if (filters.tags.length > 0) {
        params.set('tags', filters.tags.join(','));
      }
      if (filters.uploaders.length > 0) {
        params.set('uploaders', filters.uploaders.join(','));
      }
      if (filters.search) {
        params.set('search', filters.search);
      }
      if (filters.dateFrom) {
        params.set('date_from', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.set('date_to', filters.dateTo);
      }
      
      params.set('sort', sortBy);
      params.set('limit', LIMIT.toString());
      params.set('offset', newOffset.toString());

      const res = await fetch(`/api/projects/${projectId}/assets?${params}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch assets');
      }

      const data = await res.json();
      
      if (append) {
        setAssets(prev => [...prev, ...(data.assets || [])]);
      } else {
        setAssets(data.assets || []);
      }
      
      setCounts(data.counts || {
        byType: {},
        byStatus: {},
        byTag: {},
        byUploader: {},
        total: 0,
        filtered: 0,
      });
      setUploaderNames(data.uploaderNames || {});
      setHasMore(data.pagination?.hasMore || false);
      setOffset(newOffset);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [projectId, session, filters, sortBy]);

  // Initial load and filter changes
  useEffect(() => {
    fetchAssets(0, false);
  }, [fetchAssets]);

  // Handle selection change callback
  useEffect(() => {
    onSelectionChange?.(selectedAssets);
  }, [selectedAssets, onSelectionChange]);

  // Load more
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchAssets(offset + LIMIT, true);
    }
  }, [fetchAssets, offset, isLoadingMore, hasMore]);

  // Toggle asset selection
  const handleSelectAsset = useCallback((asset: MediaAsset) => {
    setSelectedAssets(prev => {
      const exists = prev.find(a => a.id === asset.id);
      if (exists) {
        return prev.filter(a => a.id !== asset.id);
      }
      return [...prev, asset];
    });
  }, []);

  // Open asset detail
  const handleAssetClick = useCallback((asset: MediaAsset) => {
    setSelectedAsset(asset);
    setIsDrawerOpen(true);
  }, []);

  // Close drawer
  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedAsset(null), 300); // Wait for animation
  }, []);

  // Download asset
  const handleDownload = useCallback(async (asset: MediaAsset) => {
    if (!session) return;

    try {
      const { data, error } = await supabase.storage
        .from("media")
        .createSignedUrl(asset.storage_path, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (err) {
      console.error("Download failed:", err);
    }
  }, [session, supabase]);

  // Update asset
  const handleUpdateAsset = useCallback(async (assetId: string, updates: Partial<MediaAsset>) => {
    if (!session) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/assets`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          assetIds: [assetId],
          updates,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }

      // Refresh the list
      fetchAssets(0, false);
      
      // Update selected asset if it's the one being edited
      if (selectedAsset?.id === assetId) {
        setSelectedAsset(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      console.error('Update failed:', err);
      throw err;
    }
  }, [projectId, session, fetchAssets, selectedAsset]);

  // Delete asset
  const handleDeleteAsset = useCallback(async (assetId: string) => {
    if (!session) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/assets?ids=${assetId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      // Remove from selected assets
      setSelectedAssets(prev => prev.filter(a => a.id !== assetId));
      
      // Refresh the list
      fetchAssets(0, false);
    } catch (err) {
      console.error('Delete failed:', err);
      throw err;
    }
  }, [projectId, session, fetchAssets]);

  // Add to deliverable selection
  const handleAddToDeliverable = useCallback((asset: MediaAsset) => {
    if (!selectedAssets.find(a => a.id === asset.id)) {
      setSelectedAssets(prev => [...prev, asset]);
    }
    handleCloseDrawer();
  }, [selectedAssets, handleCloseDrawer]);

  // Select all visible
  const handleSelectAll = useCallback(() => {
    setSelectedAssets(assets);
  }, [assets]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedAssets([]);
  }, []);

  // Bulk actions
  const handleBulkDownload = useCallback(async () => {
    // Download selected assets one by one (or use a zip endpoint if available)
    for (const asset of selectedAssets) {
      await handleDownload(asset);
    }
  }, [selectedAssets, handleDownload]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Left: Search + Quick actions */}
          <div className="flex items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search files..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setFiltersCollapsed(!filtersCollapsed)}
              className="lg:hidden p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>

          {/* Right: View controls + Upload */}
          <div className="flex items-center gap-2">
            {/* Selection info */}
            {selectedAssets.length > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-sm text-amber-400">
                  {selectedAssets.length} selected
                </span>
                <button
                  onClick={handleClearSelection}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Clear
                </button>
                <button
                  onClick={handleBulkDownload}
                  className="p-1.5 text-zinc-400 hover:text-white"
                  title="Download selected"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            )}

            {/* View toggle */}
            <div className="flex items-center bg-zinc-800 rounded-lg p-1">
              {(['grid', 'list', 'timeline'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded transition-colors ${viewMode === mode ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"}`}
                  title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                >
                  {mode === 'grid' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  )}
                  {mode === 'list' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                  {mode === 'timeline' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Thumbnail size */}
            {viewMode !== 'list' && (
              <div className="flex items-center bg-zinc-800 rounded-lg p-1">
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setThumbnailSize(size)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${thumbnailSize === size ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"}`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={() => fetchAssets(0, false)}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Upload button */}
            {canUpload && (
              <button
                onClick={onUploadClick}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Upload</span>
              </button>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
            <button
              onClick={() => fetchAssets(0, false)}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Grid */}
        <MediaGrid
          assets={assets}
          isLoading={isLoading}
          viewMode={viewMode}
          thumbnailSize={thumbnailSize}
          canSelect={canSelect}
          selectedAssets={selectedAssets}
          onSelectAsset={handleSelectAsset}
          onAssetClick={handleAssetClick}
          onDownload={handleDownload}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
        />
      </div>

      {/* Filters sidebar */}
      <div className={`lg:w-72 shrink-0 ${filtersCollapsed ? 'hidden lg:block' : ''}`}>
        <div className="lg:sticky lg:top-4">
          <FilterPanel
            counts={counts}
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            uploaderNames={uploaderNames}
            isCollapsed={filtersCollapsed}
            onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
          />
        </div>
      </div>

      {/* Asset detail drawer */}
      <AssetDetailDrawer
        asset={selectedAsset}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onDownload={handleDownload}
        onUpdate={canEdit ? handleUpdateAsset : undefined}
        onDelete={canDelete ? handleDeleteAsset : undefined}
        onAddToDeliverable={canSelect ? handleAddToDeliverable : undefined}
        canEdit={canEdit}
        canDelete={canDelete}
        uploaderName={selectedAsset ? uploaderNames[selectedAsset.uploaded_by || ''] : undefined}
      />
    </div>
  );
}

export default StudioFileGallery;
