"use client";

import { useState, useCallback } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import type { MediaAsset, AssetType } from "@/lib/types/storage";

export interface FileGalleryProps {
  assets: MediaAsset[];
  isLoading: boolean;
  canUpload: boolean;
  canSelect: boolean;
  selectedAssets: MediaAsset[];
  onUploadClick: () => void;
  onSelectAsset: (asset: MediaAsset) => void;
  onRefresh: () => void;
}

type FilterType = "all" | AssetType;
type ViewMode = "grid" | "list";

/**
 * File Gallery
 * 
 * Features:
 * - Grid/list view toggle
 * - Filter by asset type (raw, deliverable, wip)
 * - Selection for delivery
 * - Download via signed URL
 * - Quick preview
 */
export function FileGallery({
  assets,
  isLoading,
  canUpload,
  canSelect,
  selectedAssets,
  onUploadClick,
  onSelectAsset,
  onRefresh,
}: FileGalleryProps) {
  const { supabase, session } = useSupabase();
  
  const [filter, setFilter] = useState<FilterType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filter assets
  const filteredAssets = filter === "all"
    ? assets
    : assets.filter(a => a.asset_type === filter);

  // Check if asset is selected
  const isSelected = (asset: MediaAsset) => selectedAssets.some(a => a.id === asset.id);

  // Handle download
  const handleDownload = useCallback(async (asset: MediaAsset) => {
    if (!session) return;

    setDownloadingId(asset.id);

    try {
      // Create signed URL
      const { data, error } = await supabase.storage
        .from("media")
        .createSignedUrl(asset.storage_path, 3600);

      if (error) throw error;

      // Open download in new tab
      window.open(data.signedUrl, "_blank");

    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloadingId(null);
    }
  }, [session, supabase]);

  // Format file size
  const formatSize = (bytes: number | null): string => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get asset type badge color
  const getTypeBadgeColor = (type: AssetType): string => {
    switch (type) {
      case "raw": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "deliverable": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "wip": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "avatar": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "portfolio": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  // Get file icon
  const getFileIcon = (mimeType: string | null) => {
    if (mimeType?.startsWith("image/")) {
      return (
        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (mimeType?.startsWith("video/")) {
      return (
        <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  // Count by type
  const counts = {
    all: assets.length,
    raw: assets.filter(a => a.asset_type === "raw").length,
    deliverable: assets.filter(a => a.asset_type === "deliverable").length,
    wip: assets.filter(a => a.asset_type === "wip").length,
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(["all", "raw", "wip", "deliverable"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap
                ${filter === type
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }
              `}
            >
              {type === "all" ? "All" : type === "wip" ? "WIP" : type.charAt(0).toUpperCase() + type.slice(1)}
              <span className="ml-1.5 text-xs opacity-60">
                {counts[type as keyof typeof counts] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${viewMode === "grid" ? "bg-zinc-700 text-white" : "text-zinc-400"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${viewMode === "list" ? "bg-zinc-700 text-white" : "text-zinc-400"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
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
              className="px-3 py-1.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-medium text-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Files
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
        </div>
      ) : filteredAssets.length === 0 ? (
        /* Empty state */
        <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <svg className="w-12 h-12 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No files yet</h3>
          <p className="text-zinc-400 text-sm mb-4">
            {filter === "all"
              ? "Upload files to get started"
              : `No ${filter} files found`}
          </p>
          {canUpload && filter === "all" && (
            <button
              onClick={onUploadClick}
              className="px-4 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-medium"
            >
              Upload Files
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredAssets.map((asset) => {
            const selected = isSelected(asset);
            return (
              <div
                key={asset.id}
                className={`
                  group relative aspect-square bg-zinc-800 rounded-xl overflow-hidden border-2 transition-all cursor-pointer
                  ${selected ? "border-amber-500 ring-2 ring-amber-500/20" : "border-transparent hover:border-zinc-700"}
                `}
                onClick={() => canSelect && onSelectAsset(asset)}
              >
                {/* Thumbnail/Icon */}
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  {getFileIcon(asset.mime_type)}
                </div>

                {/* Selection checkbox */}
                {canSelect && (
                  <div className={`
                    absolute top-2 left-2 w-5 h-5 rounded border-2 transition-all
                    ${selected 
                      ? "bg-amber-500 border-amber-500" 
                      : "border-zinc-600 group-hover:border-zinc-500"
                    }
                  `}>
                    {selected && (
                      <svg className="w-full h-full text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Type badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${getTypeBadgeColor(asset.asset_type)}`}>
                    {asset.asset_type === "wip" ? "WIP" : asset.asset_type}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm text-white truncate mb-1">{asset.filename}</p>
                    <p className="text-xs text-zinc-400">{formatSize(asset.file_size)}</p>
                  </div>

                  {/* Quick actions */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(asset);
                      }}
                      disabled={downloadingId === asset.id}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      title="Download"
                    >
                      {downloadingId === asset.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {canSelect && <th className="w-10 px-4 py-3" />}
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">File</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Size</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Uploaded</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredAssets.map((asset) => {
                const selected = isSelected(asset);
                return (
                  <tr
                    key={asset.id}
                    className={`
                      hover:bg-zinc-800/50 transition-colors
                      ${selected ? "bg-amber-500/10" : ""}
                    `}
                  >
                    {canSelect && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onSelectAsset(asset)}
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
                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                          {getFileIcon(asset.mime_type)}
                        </div>
                        <span className="text-sm text-white truncate max-w-[200px]">{asset.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getTypeBadgeColor(asset.asset_type)}`}>
                        {asset.asset_type === "wip" ? "WIP" : asset.asset_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 hidden md:table-cell">
                      {formatSize(asset.file_size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 hidden lg:table-cell">
                      {formatDate(asset.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDownload(asset)}
                        disabled={downloadingId === asset.id}
                        className="p-2 text-zinc-400 hover:text-white transition-colors"
                        title="Download"
                      >
                        {downloadingId === asset.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FileGallery;
