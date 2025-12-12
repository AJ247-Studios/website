/**
 * Portfolio Types
 * 
 * Type definitions for the portfolio system including projects,
 * case studies, and filtering.
 */

export type ProjectCategory = 
  | "sports"
  | "concerts"
  | "weddings"
  | "portraits"
  | "corporate"
  | "events";

export type MediaType = "image" | "video";

export interface ProjectMedia {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl: string;
  blurDataUrl?: string; // Base64 LQIP placeholder
  alt: string;
  width: number;
  height: number;
  // Video specific
  posterUrl?: string;
  duration?: number; // seconds
}

export interface ProjectMetrics {
  impressions?: number;
  leads?: number;
  deliverables?: string;
  timeline?: string;
  customMetric?: {
    label: string;
    value: string;
  };
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  clientLogo?: string;
  description: string;
  shortDescription: string; // For hover overlay
  categories: ProjectCategory[];
  year: number;
  featured: boolean;
  // Media
  heroMedia: ProjectMedia;
  gallery: ProjectMedia[];
  // Results & social proof
  metrics?: ProjectMetrics;
  testimonial?: {
    quote: string;
    author: string;
    role?: string;
  };
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  // Analytics
  viewCount?: number;
  bookingCount?: number;
}

export interface FilterOption {
  value: ProjectCategory | "all";
  label: string;
  count?: number;
}

export interface PortfolioState {
  projects: Project[];
  filteredProjects: Project[];
  activeFilter: ProjectCategory | "all";
  isLightboxOpen: boolean;
  activeProject: Project | null;
  activeMediaIndex: number;
}

// Analytics event types
export interface PortfolioAnalytics {
  onProjectClick: (projectId: string, category: ProjectCategory) => void;
  onCTAClick: (ctaType: "quote" | "book" | "contact", projectId?: string) => void;
  onLightboxOpen: (projectId: string, mediaIndex: number) => void;
  onLightboxClose: (projectId: string, timeSpentMs: number) => void;
  onFilterChange: (filter: ProjectCategory | "all") => void;
}
