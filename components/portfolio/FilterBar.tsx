"use client";

import { useState, useEffect, useRef } from "react";
import { ProjectCategory, FilterOption } from "@/lib/types/portfolio";

interface FilterBarProps {
  /** Available filter options */
  filters: FilterOption[];
  /** Currently active filter */
  activeFilter: ProjectCategory | "all";
  /** Callback when filter changes */
  onFilterChange: (filter: ProjectCategory | "all") => void;
  /** Total project count (optional, for "all" label) */
  totalCount?: number;
  /** Analytics callback */
  onAnalytics?: (filter: string) => void;
}

/**
 * FilterBar Component
 * 
 * Sticky filter bar for portfolio grid. Reduces friction to find relevant examples.
 * Desktop: horizontal scrollable pills. Mobile: compact filter modal.
 * Target: <60ms filter interactions for instant feel.
 */
export default function FilterBar({
  filters,
  activeFilter,
  onFilterChange,
  totalCount,
  onAnalytics,
}: FilterBarProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Sticky behavior with IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-65px 0px 0px 0px" } // Account for header height
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleFilterClick = (filter: ProjectCategory | "all") => {
    // Optimistic update for instant feel
    onFilterChange(filter);
    onAnalytics?.(filter);
    setIsMobileFilterOpen(false);
  };

  const activeLabel = filters.find(f => f.value === activeFilter)?.label || "All Work";

  return (
    <>
      {/* Sentinel element for sticky detection */}
      <div ref={sentinelRef} className="h-0" />

      {/* Filter Bar */}
      <div
        ref={stickyRef}
        className={`
          ${isSticky 
            ? "fixed top-16 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm" 
            : "bg-white dark:bg-slate-950"
          }
          transition-all duration-200
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Desktop Filter Pills */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 shrink-0 mr-2">
              Filter:
            </span>
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleFilterClick(filter.value)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-full shrink-0 transition-all duration-150
                  ${activeFilter === filter.value
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }
                `}
              >
                {filter.label}
                {filter.count !== undefined && (
                  <span className={`ml-1.5 text-xs ${
                    activeFilter === filter.value 
                      ? "text-white/70 dark:text-slate-900/70" 
                      : "text-slate-400 dark:text-slate-500"
                  }`}>
                    ({filter.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Filter Button */}
          <div className="sm:hidden flex items-center justify-between">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>{activeLabel}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {totalCount !== undefined && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {totalCount} {totalCount === 1 ? "project" : "projects"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          
          {/* Modal */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Filter Projects
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                aria-label="Close filter"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleFilterClick(filter.value)}
                  className={`
                    px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 text-left
                    ${activeFilter === filter.value
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }
                  `}
                >
                  <span className="block">{filter.label}</span>
                  {filter.count !== undefined && (
                    <span className={`text-xs ${
                      activeFilter === filter.value 
                        ? "text-white/70 dark:text-slate-900/70" 
                        : "text-slate-400 dark:text-slate-500"
                    }`}>
                      {filter.count} {filter.count === 1 ? "project" : "projects"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add spacer when sticky to prevent content jump */}
      {isSticky && <div className="h-[72px]" />}
    </>
  );
}
