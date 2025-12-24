/**
 * DeliverablesPanel Component
 * 
 * Displays a filterable, sortable grid/list of deliverables for client review.
 * Features:
 * - Status/type filtering
 * - Grid/list view toggle
 * - Search functionality
 * - Lazy loading with infinite scroll
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronDown,
  SlidersHorizontal
} from "lucide-react";
import DeliverableCard from "./DeliverableCard";
import type { 
  ClientDeliverable, 
  StatusFilter, 
  TypeFilter, 
  SortOption 
} from "@/lib/types/deliverables";
import { STATUS_CONFIG } from "@/lib/types/deliverables";

interface DeliverablesPanelProps {
  deliverables: ClientDeliverable[];
  onSelect: (deliverable: ClientDeliverable) => void;
  onApprove: (deliverableId: string) => Promise<void>;
  onRequestChange: (deliverableId: string, reason: string) => Promise<void>;
  loading?: boolean;
}

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Items' },
  { value: 'needs_review', label: 'Needs Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'changes_requested', label: 'Changes Requested' },
];

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'video', label: 'Videos' },
  { value: 'image', label: 'Images' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Documents' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'Title A-Z' },
];

export default function DeliverablesPanel({
  deliverables,
  onSelect,
  onApprove,
  onRequestChange,
  loading = false,
}: DeliverablesPanelProps) {
  // View & filter state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Action loading state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter and sort deliverables
  const filteredDeliverables = useMemo(() => {
    let result = [...deliverables];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.title.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const statusMap: Record<StatusFilter, string[]> = {
        all: [],
        needs_review: ['delivered'],
        approved: ['approved'],
        in_progress: ['pending'],
        changes_requested: ['revision_requested'],
      };
      result = result.filter(d => statusMap[statusFilter].includes(d.status));
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(d => 
        d.assets?.some(a => a.file_type === typeFilter)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'status':
          const statusOrder = ['delivered', 'revision_requested', 'pending', 'approved', 'archived'];
          return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [deliverables, searchQuery, statusFilter, typeFilter, sortOption]);

  // Handle approve with loading state
  const handleApprove = useCallback(async (deliverableId: string) => {
    setActionLoading(deliverableId);
    try {
      await onApprove(deliverableId);
    } finally {
      setActionLoading(null);
    }
  }, [onApprove]);

  // Handle request change with loading state
  const handleRequestChange = useCallback(async (deliverableId: string, reason: string) => {
    setActionLoading(deliverableId);
    try {
      await onRequestChange(deliverableId, reason);
    } finally {
      setActionLoading(null);
    }
  }, [onRequestChange]);

  // Stats for filter badges
  const stats = useMemo(() => ({
    total: deliverables.length,
    needs_review: deliverables.filter(d => d.status === 'delivered').length,
    approved: deliverables.filter(d => d.status === 'approved').length,
    in_progress: deliverables.filter(d => d.status === 'pending').length,
    changes_requested: deliverables.filter(d => d.status === 'revision_requested').length,
  }), [deliverables]);

  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search deliverables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* View toggle and filter button */}
        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {(statusFilter !== 'all' || typeFilter !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </button>

          {/* View mode toggle */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
          {/* Status filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm"
            >
              {STATUS_FILTERS.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label} {filter.value !== 'all' && `(${stats[filter.value as keyof typeof stats] || 0})`}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm"
            >
              {TYPE_FILTERS.map(filter => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Sort By</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {(statusFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setSearchQuery('');
              }}
              className="self-end px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Showing {filteredDeliverables.length} of {deliverables.length} deliverables
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredDeliverables.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-400 dark:text-slate-500 mb-2">
            {deliverables.length === 0 
              ? 'No deliverables yet'
              : 'No deliverables match your filters'
            }
          </div>
          {(statusFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setSearchQuery('');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Deliverables grid/list */}
      {!loading && filteredDeliverables.length > 0 && (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'flex flex-col gap-3'
        }>
          {filteredDeliverables.map(deliverable => (
            <DeliverableCard
              key={deliverable.id}
              deliverable={deliverable}
              viewMode={viewMode}
              onSelect={() => onSelect(deliverable)}
              onApprove={() => handleApprove(deliverable.id)}
              onRequestChange={(reason: string) => handleRequestChange(deliverable.id, reason)}
              isLoading={actionLoading === deliverable.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
