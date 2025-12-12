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
  const featuredProjects = getFeaturedProjects();
  const categoryCounts = getCategoryCounts(mockProjects);
  
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
        subheadline="500+ projects delivered across sports, concerts, weddings, and corporate events. See what we can create for you."
        imageUrl="/portfolio/hero-default.jpg"
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
        totalCount={mockProjects.length}
        onAnalytics={(filter) => {
          // Analytics: track filter selection
          console.log("Filter selected:", filter);
        }}
      />

      {/* Portfolio Grid - Clean, image-first grid with hover states */}
      <PortfolioGrid
        projects={mockProjects}
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
