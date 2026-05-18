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

export default function PortfolioPageClient() {
  const router = useRouter();
  
  const [activeFilter, setActiveFilter] = useState<ProjectCategory | "all">("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const liveProjects = mockProjects;
  const featuredProjects = getFeaturedProjects();
  const categoryCounts = getCategoryCounts(liveProjects);
  
  const filtersWithCounts = filterOptions.map(f => ({
    ...f,
    count: categoryCounts[f.value] || 0,
  }));

  const handleProjectClick = useCallback((project: Project, index: number) => {
    setActiveProject(project);
    setActiveMediaIndex(0);
    setLightboxOpen(true);
  }, []);

  const handleBookClick = useCallback((project: Project) => {
    router.push(`/contact?project=${project.slug}&service=${project.categories[0]}`);
  }, [router]);

  const handleLightboxClose = useCallback(() => {
    setLightboxOpen(false);
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
  }, []);

  const analyticsCallbacks = {
    onMediaView: (projectId: string, mediaIndex: number) => {
      console.log("Media view:", projectId, mediaIndex);
    },
    onCtaClick: (ctaType: string, projectId: string) => {
      console.log("CTA click:", ctaType, projectId);
    },
  };

  return (
    <>
      <PortfolioHero
        headline="Our Work Speaks for Itself"
        subheadline="150+ projects delivered across sports, concerts, weddings, and corporate events. See what we can create for you."
        imageUrl="/portfolio/Concert1.webp"
        ctaText="Get a Free Quote"
        ctaHref="/contact"
        secondaryCtaText="View Case Studies"
        secondaryCtaHref="#featured"
      />

      <FeaturedCaseStudies
        projects={featuredProjects}
        onProjectClick={(projectId) => {
          const project = mockProjects.find(p => p.id === projectId);
          if (project) handleProjectClick(project, 0);
        }}
        onCtaClick={(projectId) => {
          const project = mockProjects.find(p => p.id === projectId);
          if (project) handleBookClick(project);
        }}
      />

      <FilterBar
        filters={filtersWithCounts}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        totalCount={liveProjects.length}
        sticky={false}
      />

      <PortfolioGrid
        projects={liveProjects}
        activeFilter={activeFilter}
        onProjectClick={handleProjectClick}
        onBookClick={handleBookClick}
        showAll
      />

      <CTASection />

      <Lightbox
        isOpen={lightboxOpen}
        onClose={handleLightboxClose}
        project={activeProject}
        currentIndex={activeMediaIndex}
        onNavigate={handleLightboxNavigate}
        onBookClick={handleBookClick}
        analytics={analyticsCallbacks}
      />
    </>
  );
}
