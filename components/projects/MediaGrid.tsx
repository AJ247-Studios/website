"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { MediaAsset, AssetType } from "@/lib/types/storage";
import { getPreviewUrl, formatFileSize, formatDuration, getFileTypeFromMime } from "@/utils/getPreviewUrl";

export type ViewMode = 'grid' | 'list' | 'timeline';
export type ThumbnailSize = 'sm' | 'md' | 'lg';

export interface MediaGridProps {
  assets: MediaAsset[];
  isLoading: boolean;
  viewMode: ViewMode;
  thumbnailSize: ThumbnailSize;
  canSelect: boolean;
  selectedAssets: MediaAsset[];
  onSelectAsset: (asset: MediaAsset) => void;
  onAssetClick: (asset: MediaAsset) => void;
  onDownload: (asset: MediaAsset) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

const ASSET_TYPE_COLORS: Record<AssetType, string> = {
  raw: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  deliverable: "bg-green-500/20 text-green-400 border-green-500/30",
  wip: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  avatar: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  portfolio: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const GRID_COLUMNS: Record<ThumbnailSize, string> = {
  sm: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8",
  md: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
  lg: "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
};

/**
 * MediaGrid Component
 * 
 * Professional media grid with:
 * - Grid/List/Timeline views
 * - Configurable thumbnail sizes
 * - Lazy loading with LQIP placeholders
 * - Hover overlay with quick actions
 * - Keyboard navigation
 * - Selection for bulk operations
 */
export function MediaGrid({
  assets,
  isLoading,
  viewMode,
  thumbnailSize,
  canSelect,
  selectedAssets,
  onSelectAsset,
  onAssetClick,
  onDownload,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: MediaGridProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Check if asset is selected
  const isSelected = useCallback((asset: MediaAsset) => 
    selectedAssets.some(a => a.id === asset.id), 
  [selectedAssets]);

  // Handle image load
  const handleImageLoad = useCallback((assetId: string) => {
    setLoadedImages(prev => new Set(prev).add(assetId));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!assets.length) return;
      
      const cols = viewMode === 'list' ? 1 : 
        thumbnailSize === 'sm' ? 8 : 
        thumbnailSize === 'md' ? 6 : 5;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, assets.length - 1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + cols, assets.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - cols, 0));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < assets.length) {
            if (e.shiftKey && canSelect) {
              onSelectAsset(assets[focusedIndex]);
            } else {
              onAssetClick(assets[focusedIndex]);
            }
          }
          break;
        case 'Escape':
          setFocusedIndex(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [assets, focusedIndex, viewMode, thumbnailSize, canSelect, onSelectAsset, onAssetClick]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !onLoadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoadingMore]);

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get file icon
  const FileIcon = ({ mimeType, className }: { mimeType: string | null; className?: string }) => {
    const type = getFileTypeFromMime(mimeType);
    
    if (type === 'image') {
      return (
        <svg className={className || "w-8 h-8 text-blue-400"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (type === 'video') {
      return (
        <svg className={className || "w-8 h-8 text-purple-400"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    if (type === 'audio') {
      return (
        <svg className={className || "w-8 h-8 text-green-400"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    }
    return (
      <svg className={className || "w-8 h-8 text-zinc-400"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  // Loading skeleton
  if (isLoading && assets.length === 0) {
    return (
      <div className={`grid ${GRID_COLUMNS[thumbnailSize]} gap-4`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i} 
            className="aspect-square bg-zinc-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (!isLoading && assets.length === 0) {
    return (
      <div className="text-center py-16 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <svg className="w-16 h-16 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-white mb-2">No files found</h3>
        <p className="text-zinc-400 text-sm">
          Try adjusting your filters or upload new files
        </p>
      </div>
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div ref={gridRef} className="space-y-4">
        <div className={`grid ${GRID_COLUMNS[thumbnailSize]} gap-4`}>
          {assets.map((asset, index) => {
            const selected = isSelected(asset);
            const focused = index === focusedIndex;
            const isImage = asset.mime_type?.startsWith('image/');
            const isVideo = asset.mime_type?.startsWith('video/');
            const previewUrl = getPreviewUrl(asset);
            const isLoaded = loadedImages.has(asset.id);

            return (
              <div
                key={asset.id}
                data-index={index}
                tabIndex={0}
                onFocus={() => setFocusedIndex(index)}
                onClick={() => onAssetClick(asset)}
                className={`
                  group relative aspect-square bg-zinc-800 rounded-xl overflow-hidden cursor-pointer
                  transition-all duration-200 ease-out
                  ${focused ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-zinc-950' : ''}
                  ${selected ? 'ring-2 ring-amber-500' : ''}
                  hover:scale-[1.02] hover:shadow-xl hover:shadow-black/50
                `}
                role="button"
                aria-selected={selected}
                aria-label={`${asset.title || asset.filename}${selected ? ', selected' : ''}`}
              >
                {/* Thumbnail / Icon */}
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  {(isImage || isVideo) && asset.thumbnail_path ? (
                    <>
                      {/* LQIP Placeholder */}
                      {!isLoaded && (
                        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
                      )}
                      <img
                        src={previewUrl}
                        alt={asset.title || asset.filename}
                        loading="lazy"
                        onLoad={() => handleImageLoad(asset.id)}
                        className={`
                          w-full h-full object-cover transition-opacity duration-300
                          ${isLoaded ? 'opacity-100' : 'opacity-0'}
                        `}
                      />
                    </>
                  ) : (
                    <FileIcon mimeType={asset.mime_type} />
                  )}
                </div>

                {/* Video duration badge */}
                {isVideo && asset.duration_seconds && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-medium rounded">
                    {formatDuration(asset.duration_seconds)}
                  </div>
                )}

                {/* Selection checkbox */}
                {canSelect && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAsset(asset);
                    }}
                    className={`
                      absolute top-2 left-2 w-5 h-5 rounded border-2 transition-all z-10
                      ${selected 
                        ? "bg-amber-500 border-amber-500" 
                        : "border-zinc-400/50 bg-black/30 group-hover:border-zinc-300"
                      }
                    `}
                    aria-label={selected ? 'Deselect' : 'Select'}
                  >
                    {selected && (
                      <svg className="w-full h-full text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Type badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${ASSET_TYPE_COLORS[asset.asset_type]}`}>
                    {asset.asset_type === "wip" ? "WIP" : asset.asset_type}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm text-white truncate font-medium mb-0.5">
                      {asset.title || asset.filename}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {formatFileSize(asset.file_size)}
                    </p>
                  </div>

                  {/* Quick actions */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssetClick(asset);
                      }}
                      className="p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      title="View details"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(asset);
                      }}
                      className="p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      title="Download"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load more */}
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isLoadingMore ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
            ) : (
              <button
                onClick={onLoadMore}
                className="px-6 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // List View
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                {canSelect && <th className="w-12 px-4 py-3" />}
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">File</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Size</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Uploaded</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {assets.map((asset, index) => {
                const selected = isSelected(asset);
                const focused = index === focusedIndex;
                const previewUrl = getPreviewUrl(asset);

                return (
                  <tr
                    key={asset.id}
                    tabIndex={0}
                    onFocus={() => setFocusedIndex(index)}
                    onClick={() => onAssetClick(asset)}
                    className={`
                      cursor-pointer transition-colors
                      ${focused ? 'bg-amber-500/10' : ''}
                      ${selected ? 'bg-amber-500/10' : 'hover:bg-zinc-800/50'}
                    `}
                  >
                    {canSelect && (
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAsset(asset);
                          }}
                          className={`
                            w-5 h-5 rounded border-2 transition-all
                            ${selected 
                              ? "bg-amber-500 border-amber-500" 
                              : "border-zinc-600 hover:border-zinc-500"
                            }
                          `}
                        >
                          {selected && (
                            <svg className="w-full h-full text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          {(asset.mime_type?.startsWith('image/') || asset.mime_type?.startsWith('video/')) && asset.thumbnail_path ? (
                            <img
                              src={previewUrl}
                              alt={asset.filename}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileIcon mimeType={asset.mime_type} className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate max-w-[200px] font-medium">
                            {asset.title || asset.filename}
                          </p>
                          {asset.tags && asset.tags.length > 0 && (
                            <p className="text-xs text-zinc-500 truncate">
                              {asset.tags.slice(0, 3).join(', ')}
                              {asset.tags.length > 3 && ` +${asset.tags.length - 3}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded border ${ASSET_TYPE_COLORS[asset.asset_type]}`}>
                        {asset.asset_type === "wip" ? "WIP" : asset.asset_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 hidden md:table-cell">
                      {formatFileSize(asset.file_size)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        asset.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                        asset.status === 'processing' ? 'bg-amber-500/20 text-amber-400' :
                        asset.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 hidden lg:table-cell">
                      {formatDate(asset.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssetClick(asset);
                          }}
                          className="p-2 text-zinc-400 hover:text-white transition-colors"
                          title="View details"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownload(asset);
                          }}
                          className="p-2 text-zinc-400 hover:text-white transition-colors"
                          title="Download"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Load more */}
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isLoadingMore ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
            ) : (
              <button
                onClick={onLoadMore}
                className="px-6 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Timeline View
  return (
    <div className="space-y-6">
      {/* Group assets by date */}
      {Object.entries(
        assets.reduce((acc, asset) => {
          const date = new Date(asset.created_at).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          if (!acc[date]) acc[date] = [];
          acc[date].push(asset);
          return acc;
        }, {} as Record<string, MediaAsset[]>)
      ).map(([date, dateAssets]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-zinc-400 mb-3 sticky top-0 bg-zinc-950 py-2 z-10">
            {date}
          </h3>
          <div className={`grid ${GRID_COLUMNS[thumbnailSize]} gap-4`}>
            {dateAssets.map((asset) => {
              const selected = isSelected(asset);
              const isImage = asset.mime_type?.startsWith('image/');
              const isVideo = asset.mime_type?.startsWith('video/');
              const previewUrl = getPreviewUrl(asset);

              return (
                <div
                  key={asset.id}
                  onClick={() => onAssetClick(asset)}
                  className={`
                    group relative aspect-square bg-zinc-800 rounded-xl overflow-hidden cursor-pointer
                    transition-all duration-200 ease-out
                    ${selected ? 'ring-2 ring-amber-500' : ''}
                    hover:scale-[1.02] hover:shadow-xl hover:shadow-black/50
                  `}
                >
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                    {(isImage || isVideo) && asset.thumbnail_path ? (
                      <img
                        src={previewUrl}
                        alt={asset.title || asset.filename}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileIcon mimeType={asset.mime_type} />
                    )}
                  </div>

                  {canSelect && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAsset(asset);
                      }}
                      className={`
                        absolute top-2 left-2 w-5 h-5 rounded border-2 transition-all z-10
                        ${selected 
                          ? "bg-amber-500 border-amber-500" 
                          : "border-zinc-400/50 bg-black/30 group-hover:border-zinc-300"
                        }
                      `}
                    >
                      {selected && (
                        <svg className="w-full h-full text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )}

                  <div className="absolute top-2 right-2">
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${ASSET_TYPE_COLORS[asset.asset_type]}`}>
                      {asset.asset_type === "wip" ? "WIP" : asset.asset_type}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm text-white truncate font-medium mb-0.5">
                        {asset.title || asset.filename}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {new Date(asset.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Load more */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoadingMore ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
          ) : (
            <button
              onClick={onLoadMore}
              className="px-6 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MediaGrid;
