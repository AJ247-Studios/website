"use client";

import { useState, useCallback, useMemo } from "react";
import type { AssetType } from "@/lib/types/storage";
import { 
  MediaWorkflowStatus, 
  STATUS_CONFIG as SAFE_STATUS_CONFIG,
  ALL_STATUSES,
  safeStatus 
} from "@/utils/safeStatus";

export type SortOption = 'newest' | 'oldest' | 'largest' | 'smallest' | 'name_asc' | 'name_desc';

export interface FilterCounts {
  // Asset types
  byType: Record<string, number>;
  // Status
  byStatus: Record<string, number>;
  // Tags
  byTag: Record<string, number>;
  // Uploaders
  byUploader: Record<string, number>;
  // Total
  total: number;
  filtered: number;
}

export interface FilterState {
  assetTypes: AssetType[];
  statuses: string[]; // Using string to allow all status values
  tags: string[];
  uploaders: string[];
  search: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface FilterPanelProps {
  counts: FilterCounts;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  uploaderNames?: Record<string, string>; // userId -> display name
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ASSET_TYPE_CONFIG: Record<AssetType, { label: string; color: string }> = {
  raw: { label: "Raw", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  deliverable: { label: "Deliverable", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  wip: { label: "In Progress", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  avatar: { label: "Avatar", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  portfolio: { label: "Portfolio", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
};

// Use the safe status config with all status values
const STATUS_CONFIG: Record<string, { label: string; color: string }> = Object.fromEntries(
  Object.entries(SAFE_STATUS_CONFIG).map(([key, val]) => [key, { label: val.label, color: val.color }])
);

// Filter to show only relevant statuses in the UI (skip 'unknown')
const DISPLAY_STATUSES: MediaWorkflowStatus[] = ALL_STATUSES;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'largest', label: 'Largest First' },
  { value: 'smallest', label: 'Smallest First' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
];

/**
 * FilterPanel Component
 * 
 * Faceted filtering for media assets with:
 * - Asset type filter (multi-select)
 * - Status filter (multi-select)
 * - Tags filter (searchable)
 * - Uploader filter
 * - Date range
 * - Sort control
 * 
 * Shows counts next to each option (Algolia-style)
 */
export function FilterPanel({
  counts,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  uploaderNames = {},
  isCollapsed = false,
  onToggleCollapse,
}: FilterPanelProps) {
  const [tagSearch, setTagSearch] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);

  // Toggle asset type filter
  const toggleAssetType = useCallback((type: AssetType) => {
    const newTypes = filters.assetTypes.includes(type)
      ? filters.assetTypes.filter(t => t !== type)
      : [...filters.assetTypes, type];
    onFiltersChange({ ...filters, assetTypes: newTypes });
  }, [filters, onFiltersChange]);

  // Toggle status filter
  const toggleStatus = useCallback((status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  }, [filters, onFiltersChange]);

  // Toggle tag filter
  const toggleTag = useCallback((tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  }, [filters, onFiltersChange]);

  // Toggle uploader filter
  const toggleUploader = useCallback((uploaderId: string) => {
    const newUploaders = filters.uploaders.includes(uploaderId)
      ? filters.uploaders.filter(u => u !== uploaderId)
      : [...filters.uploaders, uploaderId];
    onFiltersChange({ ...filters, uploaders: newUploaders });
  }, [filters, onFiltersChange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    onFiltersChange({
      assetTypes: [],
      statuses: [],
      tags: [],
      uploaders: [],
      search: "",
      dateFrom: undefined,
      dateTo: undefined,
    });
  }, [onFiltersChange]);

  // Filter tags by search
  const filteredTags = useMemo(() => {
    const allTags = Object.entries(counts.byTag);
    if (!tagSearch) return allTags;
    return allTags.filter(([tag]) => 
      tag.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [counts.byTag, tagSearch]);

  const visibleTags = showAllTags ? filteredTags : filteredTags.slice(0, 8);
  const hasMoreTags = filteredTags.length > 8;

  // Check if any filters are active
  const hasActiveFilters = 
    filters.assetTypes.length > 0 ||
    filters.statuses.length > 0 ||
    filters.tags.length > 0 ||
    filters.uploaders.length > 0 ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium text-white">Filters</span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 text-zinc-400 hover:text-white transition-colors lg:hidden"
            >
              <svg 
                className={`w-4 h-4 transform transition-transform ${isCollapsed ? '' : 'rotate-180'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible content */}
      <div className={`${isCollapsed ? 'hidden lg:block' : ''}`}>
        {/* Results summary */}
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/30">
          <p className="text-sm text-zinc-400">
            Showing <span className="text-white font-medium">{counts.filtered}</span> of{' '}
            <span className="text-white font-medium">{counts.total}</span> files
          </p>
        </div>

        {/* Sort */}
        <div className="px-4 py-3 border-b border-zinc-800">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Asset Type */}
        <div className="px-4 py-3 border-b border-zinc-800">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Type
          </label>
          <div className="space-y-2">
            {(Object.keys(ASSET_TYPE_CONFIG) as AssetType[]).map(type => {
              const config = ASSET_TYPE_CONFIG[type];
              const count = counts.byType[type] || 0;
              const isActive = filters.assetTypes.includes(type);
              
              return (
                <button
                  key={type}
                  onClick={() => toggleAssetType(type)}
                  disabled={count === 0 && !isActive}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all
                    ${isActive 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : count > 0
                        ? 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 border border-transparent'
                        : 'bg-zinc-800/30 text-zinc-600 cursor-not-allowed border border-transparent'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    {isActive && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {config.label}
                  </span>
                  <span className={`text-xs ${isActive ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="px-4 py-3 border-b border-zinc-800">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Status
          </label>
          <div className="space-y-2">
            {DISPLAY_STATUSES.map(status => {
              const config = STATUS_CONFIG[status] || { label: status, color: 'bg-zinc-500/20 text-zinc-400' };
              const count = counts.byStatus[status] || 0;
              const isActive = filters.statuses.includes(status);
              
              // Only show statuses that have count > 0 OR are currently active
              if (count === 0 && !isActive) return null;
              
              return (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all
                    ${isActive 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 border border-transparent'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    {isActive && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {config.label}
                  </span>
                  <span className={`text-xs ${isActive ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        {Object.keys(counts.byTag).length > 0 && (
          <div className="px-4 py-3 border-b border-zinc-800">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Tags
            </label>
            
            {/* Tag search */}
            <div className="relative mb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search tags..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {visibleTags.map(([tag, count]) => {
                const isActive = filters.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`
                      px-2.5 py-1 rounded-full text-xs font-medium transition-all
                      ${isActive 
                        ? 'bg-amber-500 text-black' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }
                    `}
                  >
                    {tag}
                    <span className={`ml-1 ${isActive ? 'text-black/60' : 'text-zinc-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {hasMoreTags && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                {showAllTags ? 'Show less' : `+${filteredTags.length - 8} more`}
              </button>
            )}
          </div>
        )}

        {/* Uploaders */}
        {Object.keys(counts.byUploader).length > 0 && (
          <div className="px-4 py-3 border-b border-zinc-800">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Uploaded by
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(counts.byUploader).map(([uploaderId, count]) => {
                const isActive = filters.uploaders.includes(uploaderId);
                const name = uploaderNames[uploaderId] || 'Unknown';
                
                return (
                  <button
                    key={uploaderId}
                    onClick={() => toggleUploader(uploaderId)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all
                      ${isActive 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                        : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 border border-transparent'
                      }
                    `}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {isActive && (
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span className="truncate">{name}</span>
                    </span>
                    <span className={`text-xs shrink-0 ml-2 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Date Range */}
        <div className="px-4 py-3">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              placeholder="From"
            />
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              placeholder="To"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
