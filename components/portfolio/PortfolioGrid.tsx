"use client";

import { useMemo } from "react";
import { Project, ProjectCategory } from "@/lib/types/portfolio";
import PortfolioCard from "./PortfolioCard";

interface PortfolioGridProps {
  /** All projects (pre-filtered or full list) */
  projects: Project[];
  /** Currently active filter */
  activeFilter: ProjectCategory | "all";
  /** Callback when project is clicked */
  onProjectClick: (project: Project, index: number) => void;
  /** Callback for book CTA */
  onBookClick?: (project: Project) => void;
  /** Number of projects to show initially */
  initialCount?: number;
  /** Whether to show all projects */
  showAll?: boolean;
}

/**
 * PortfolioGrid Component
 * 
 * Masonry-style grid with lazy-loading thumbnails.
 * Prioritizes first 6 images for LCP. Semantic HTML for SEO.
 * Filter interactions target <60ms perceived latency.
 */
export default function PortfolioGrid({
  projects,
  activeFilter,
  onProjectClick,
  onBookClick,
  initialCount = 12,
  showAll = false,
}: PortfolioGridProps) {
  // Filter projects (memoized for performance)
  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") return projects;
    return projects.filter(p => p.categories.includes(activeFilter));
  }, [projects, activeFilter]);

  // Limit display count
  const displayedProjects = showAll 
    ? filteredProjects 
    : filteredProjects.slice(0, initialCount);

  const hasMore = filteredProjects.length > displayedProjects.length;

  // Empty state
  if (filteredProjects.length === 0) {
    return (
      <section id="portfolio" className="py-12 bg-white dark:bg-slate-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              No projects match the selected filter. Try selecting a different category.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-8 sm:py-12 bg-white dark:bg-slate-950 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayedProjects.map((project, index) => {
            return (
              <article
                key={project.id}
                className="w-full"
              >
                <PortfolioCard
                  project={project}
                  onClick={() => onProjectClick(project, index)}
                  onBookClick={() => onBookClick?.(project)}
                  priority={index < 6} // Priority load first 6 for LCP
                  size="default"
                />
              </article>
            );
          })}
        </div>

        {/* Load More indicator */}
        {hasMore && (
          <div className="text-center mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Showing {displayedProjects.length} of {filteredProjects.length} projects
            </p>
            {/* Note: In production, implement "Load More" or infinite scroll */}
          </div>
        )}

        {/* Results count */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}
            {activeFilter !== "all" && ` in ${activeFilter}`}
          </p>
        </div>
      </div>
    </section>
  );
}
