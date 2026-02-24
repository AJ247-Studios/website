"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PortfolioHero,
  FeaturedCaseStudies,
  FilterBar,
  PortfolioGrid,
  Lightbox,
} from "@/components/portfolio";
import CTASection from "@/components/CTASection";
import { 
  mockProjects, 
  filterOptions, 
  getFeaturedProjects,
  getCategoryCounts,
} from "@/lib/portfolio-data";
import { Project, ProjectCategory } from "@/lib/types/portfolio";

/**
 * Portfolio Page
 * 
 * Visual-first, performance-obsessed, and story-driven portfolio.
 * Follows UX research: large hero, filterable grid, case studies with results,
 * lightbox with context, and persuasive CTAs that push to booking.
 */
export default function PortfolioPage() {
  const router = useRouter();
  
  // State
  const [activeFilter, setActiveFilter] = useState<ProjectCategory | "all">("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Data
  const liveProjects = mockProjects.filter(p => 
    ["paul-precious-wedding", "color-powder-festival", "fca-krakow-basketball", "krakow-portrait-sessions", "krakow-motocross-highlights", "football-game-coverage", "prom-2026"].includes(p.slug)
  );
  const featuredProjects = getFeaturedProjects();
  const categoryCounts = getCategoryCounts(liveProjects);
  
  // Enrich filter options with counts
  const filtersWithCounts = filterOptions.map(f => ({
    ...f,
    count: categoryCounts[f.value] || 0,
  }));

  // Handlers
  const handleProjectClick = useCallback((project: Project, index: number) => {
    setActiveProject(project);
    setActiveMediaIndex(0);
    setLightboxOpen(true);
    // Analytics: track project click
  }, []);

  const handleBookClick = useCallback((project: Project) => {
    router.push(`/contact?project=${project.slug}&service=${project.categories[0]}`);
  }, [router]);

  const handleLightboxClose = useCallback(() => {
    setLightboxOpen(false);
    // Keep project in state briefly for exit animation
    setTimeout(() => {
      setActiveProject(null);
      setActiveMediaIndex(0);
    }, 300);
  }, []);

  const handleLightboxNavigate = useCallback((index: number) => {
    setActiveMediaIndex(index);
  }, []);

  const handleFilterChange = useCallback((filter: ProjectCategory | "all") => {
    setActiveFilter(filter);
    // Analytics: track filter change
  }, []);

  // Analytics callbacks (stub for implementation)
  const analyticsCallbacks = {
    onMediaView: (projectId: string, mediaIndex: number) => {
      // TODO: Implement analytics tracking
      console.log("Media view:", projectId, mediaIndex);
    },
    onCtaClick: (ctaType: string, projectId: string) => {
      // TODO: Implement analytics tracking
      console.log("CTA click:", ctaType, projectId);
    },
  };

  return (
    <main>
      {/* Hero Section - Big, contextual hero with striking visual */}
      <PortfolioHero
        headline="Our Work Speaks for Itself"
        subheadline="150+ projects delivered across sports, concerts, weddings, and corporate events. See what we can create for you."
        imageUrl="/portfolio/Concert1.webp"
        ctaText="Get a Free Quote"
        ctaHref="/contact"
        secondaryCtaText="View Case Studies"
        secondaryCtaHref="#featured"
        onCtaClick={(type) => {
          // Analytics: track hero CTA click
          console.log("Hero CTA click:", type);
        }}
      />

      {/* Featured Case Studies - 1-3 rotating projects with metrics */}
      <FeaturedCaseStudies
        projects={featuredProjects}
        onProjectClick={(projectId) => {
          const project = mockProjects.find(p => p.id === projectId);
          if (project) {
            handleProjectClick(project, 0);
          }
        }}
        onCtaClick={(projectId) => {
          const project = mockProjects.find(p => p.id === projectId);
          if (project) {
            handleBookClick(project);
          }
        }}
      />

      {/* Filter Bar - Sticky, reduces friction to find relevant work */}
      <FilterBar
        filters={filtersWithCounts}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        totalCount={liveProjects.length}
        sticky={false}
        onAnalytics={(filter) => {
          // Analytics: track filter selection
          console.log("Filter selected:", filter);
        }}
      />

      {/* Portfolio Grid - Clean, image-first grid with hover states */}
      <PortfolioGrid
        projects={liveProjects}
        activeFilter={activeFilter}
        onProjectClick={handleProjectClick}
        onBookClick={handleBookClick}
        showAll
      />

      {/* Secondary CTA Section */}
      <CTASection />

      {/* Lightbox - Photo/video viewer with context panel */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={handleLightboxClose}
        project={activeProject}
        currentIndex={activeMediaIndex}
        onNavigate={handleLightboxNavigate}
        onBookClick={handleBookClick}
        analytics={analyticsCallbacks}
      />
    </main>
  );
}
