/**
 * Portfolio Mock Data
 * 
 * Example project data for development and SSG.
 * In production, this would come from a CMS or database.
 */

import { Project, FilterOption } from "@/lib/types/portfolio";

// Placeholder image used for all portfolio items
const PLACEHOLDER_IMG = "/portfolio/placeholder.webp";

export const filterOptions: FilterOption[] = [
  { value: "all", label: "All Work" },
  { value: "sports", label: "Sports" },
  { value: "concerts", label: "Concerts" },
  { value: "weddings", label: "Weddings" },
  { value: "portraits", label: "Portraits" },
  { value: "corporate", label: "Corporate" },
  { value: "events", label: "Events" },
];

export const mockProjects: Project[] = [
  {
    id: "3",
    slug: "paul-precious-wedding",
    title: "Paul & Precious Wedding",
    client: "Paul & Precious",
    description: "Wedding highlight film capturing Paul & Precious' Kraków celebration with an embedded YouTube film plus photo selects.",
    shortDescription: "Kraków wedding highlight film",
    categories: ["weddings"],
    year: 2024,
    featured: true,
    heroMedia: {
      id: "hero-3",
      type: "image",
      url: "/portfolio/Paul%20and%20Precious%20Wedding.jpg",
      thumbnailUrl: "/portfolio/Paul%20and%20Precious%20Wedding.jpg",
      alt: "Paul and Precious wedding portrait",
      width: 1920,
      height: 1080,
    },
    gallery: [
      {
        id: "g3-video",
        type: "video",
        url: "https://www.youtube.com/embed/fnJxTmsU52o",
        thumbnailUrl: "/portfolio/Paul%20and%20Precious%20Wedding.jpg",
        posterUrl: "/portfolio/Paul%20and%20Precious%20Wedding.jpg",
        alt: "Paul & Precious wedding highlight film",
        width: 1920,
        height: 1080,
      },
    ],
    metrics: {
      deliverables: "400+ photos, 8min film",
      timeline: "48hr highlights delivery",
    },
    testimonial: {
      quote: "The video was really good! AJ247 Studios captured our special day perfectly and exceeded all our expectations.",
      author: "Paul & Precious",
      role: "Wedding, Kraków",
    },
  },
  {
    id: "10",
    slug: "fca-krakow-basketball",
    title: "FCA Kraków Basketball Series",
    client: "FCA Kraków",
    clientLogo: undefined,
    description: "Practice and game-day coverage for FCA Kraków basketball with dual highlight films and stills from training and court action.",
    shortDescription: "Practice + game highlights with action photos",
    categories: ["sports"],
    year: 2025,
    featured: true,
    heroMedia: {
      id: "hero-10",
      type: "image",
      url: "/portfolio/FCA/20251129-DSC_2477-2.webp",
      thumbnailUrl: "/portfolio/FCA/20251129-DSC_2477-2.webp",
      alt: "FCA Kraków guard driving to the basket",
      width: 2000,
      height: 1333,
    },
    gallery: [
      {
        id: "fca-practice-video",
        type: "video",
        url: "https://www.youtube.com/embed/S5mBcftAKis",
        thumbnailUrl: "/portfolio/FCA/20251129-DSC_2477-2.webp",
        posterUrl: "/portfolio/FCA/20251129-DSC_2477-2.webp",
        alt: "FCA basketball practice highlight film",
        width: 1920,
        height: 1080,
      },
      {
        id: "fca-game-video",
        type: "video",
        url: "https://www.youtube.com/embed/ki2Vr28ysQs",
        thumbnailUrl: "/portfolio/FCA/20251129-DSC_3455.webp",
        posterUrl: "/portfolio/FCA/20251129-DSC_3455.webp",
        alt: "FCA basketball game highlight film",
        width: 1920,
        height: 1080,
      },
      {
        id: "fca-01",
        type: "image",
        url: "/portfolio/FCA/20251129-DSC_2477-2.webp",
        thumbnailUrl: "/portfolio/FCA/20251129-DSC_2477-2.webp",
        alt: "FCA players celebrating after a win",
        width: 2000,
        height: 1333,
      },
      {
        id: "fca-02",
        type: "image",
        url: "/portfolio/FCA/20251129-DSC_3201-2.webp",
        thumbnailUrl: "/portfolio/FCA/20251129-DSC_3201-2.webp",
        alt: "Guard contesting a layup",
        width: 2000,
        height: 1333,
      },
      {
        id: "fca-03",
        type: "image",
        url: "/portfolio/FCA/20251129-DSC_3455.webp",
        thumbnailUrl: "/portfolio/FCA/20251129-DSC_3455.webp",
        alt: "Paint battle under the rim",
        width: 2000,
        height: 1333,
      },
      {
        id: "fca-04",
        type: "image",
        url: "/portfolio/FCA/20251129-DSC_5717.webp",
        thumbnailUrl: "/portfolio/FCA/20251129-DSC_5717.webp",
        alt: "Players warming up pregame",
        width: 2000,
        height: 1333,
      },
      {
        id: "fca-05",
        type: "image",
        url: "/portfolio/FCA/20251115-DSC_7919.webp",
        thumbnailUrl: "/portfolio/FCA/20251115-DSC_7919.webp",
        alt: "Training session sprint drills",
        width: 2000,
        height: 1333,
      },
      {
        id: "fca-06",
        type: "image",
        url: "/portfolio/FCA/20251115-DSC_7429.webp",
        thumbnailUrl: "/portfolio/FCA/20251115-DSC_7429.webp",
        alt: "Coach giving courtside instructions",
        width: 2000,
        height: 1333,
      },
      {
        id: "fca-07",
        type: "image",
        url: "/portfolio/FCA/20251115-DSC_7308.webp",
        thumbnailUrl: "/portfolio/FCA/20251115-DSC_7308.webp",
        alt: "Defender taking a charge",
        width: 2000,
        height: 1333,
      },
    ],
    metrics: {
      deliverables: "2 highlight films + 60 action photos",
      timeline: "2 shoot days, 4-day delivery",
    },
    testimonial: {
      quote: "We had the opportunity to work with AJ247 Studios on several sports projects, and I’m fully satisfied with the results. With every video, I could see clear progress, and the final outcomes were excellent. These young talents are doing a great job.",
      author: "Dima",
      role: "FCA Krakow, Poland",
    },
  },
  {
    id: "11",
    slug: "krakow-portrait-sessions",
    title: "Kraków Portrait Sessions",
    client: "Multiple Clients",
    description: "Three distinct portrait sessions shot across Kraków — editorial, lifestyle, and studio-inspired looks for different clients.",
    shortDescription: "Three portrait stories around Kraków",
    categories: ["portraits"],
    year: 2025,
    featured: false,
    heroMedia: {
      id: "hero-11",
      type: "image",
      url: "/portfolio/Portraits/Portrait_pre.webp",
      thumbnailUrl: "/portfolio/Portraits/Portrait_pre.webp",
      alt: "Portrait session lead image in Kraków",
      width: 2000,
      height: 1333,
    },
    gallery: [
      { id: "por-01", type: "image", url: "/portfolio/Portraits/Portrait_01.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_01.webp", alt: "Portrait session 1 — candid look", width: 2000, height: 1333 },
      { id: "por-02", type: "image", url: "/portfolio/Portraits/Portrait_02.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_02.webp", alt: "Portrait session 1 — skyline backdrop", width: 2000, height: 1333 },
      { id: "por-03", type: "image", url: "/portfolio/Portraits/Portrait_03.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_03.webp", alt: "Portrait session 1 — close-up", width: 2000, height: 1333 },
      { id: "por-04", type: "image", url: "/portfolio/Portraits/Portrait_04.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_04.webp", alt: "Portrait session 1 — golden hour", width: 2000, height: 1333 },
      { id: "por-05", type: "image", url: "/portfolio/Portraits/Portrait_05.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_05.webp", alt: "Portrait session 1 — street style", width: 2000, height: 1333 },
      { id: "por-06", type: "image", url: "/portfolio/Portraits/Portrait_06.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_06.webp", alt: "Portrait session 1 — casual pose", width: 2000, height: 1333 },
      { id: "por-07", type: "image", url: "/portfolio/Portraits/Portrait_07.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_07.webp", alt: "Portrait session 1 — relaxed expression", width: 2000, height: 1333 },
      { id: "por-08", type: "image", url: "/portfolio/Portraits/Portrait_08.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_08.webp", alt: "Portrait session 2 — moody studio-inspired", width: 2000, height: 1333 },
      { id: "por-09", type: "image", url: "/portfolio/Portraits/Portrait_09.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_09.webp", alt: "Portrait session 2 — dramatic light", width: 2000, height: 1333 },
      { id: "por-10", type: "image", url: "/portfolio/Portraits/Portrait_10.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_10.webp", alt: "Portrait session 2 — side profile", width: 2000, height: 1333 },
      { id: "por-11", type: "image", url: "/portfolio/Portraits/Portrait_11.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_11.webp", alt: "Portrait session 2 — cinematic framing", width: 2000, height: 1333 },
      { id: "por-12", type: "image", url: "/portfolio/Portraits/Portrait_12.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_12.webp", alt: "Portrait session 2 — soft light", width: 2000, height: 1333 },
      { id: "por-13", type: "image", url: "/portfolio/Portraits/Portrait_13.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_13.webp", alt: "Portrait session 2 — thoughtful pose", width: 2000, height: 1333 },
      { id: "por-14", type: "image", url: "/portfolio/Portraits/Portrait_14.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_14.webp", alt: "Portrait session 3 — outdoor courtyard", width: 2000, height: 1333 },
      { id: "por-15", type: "image", url: "/portfolio/Portraits/Portrait_15.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_15.webp", alt: "Portrait session 3 — casual lean", width: 2000, height: 1333 },
      { id: "por-16", type: "image", url: "/portfolio/Portraits/Portrait_16.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_16.webp", alt: "Portrait session 3 — natural light", width: 2000, height: 1333 },
      { id: "por-17", type: "image", url: "/portfolio/Portraits/Portrait_17.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_17.webp", alt: "Portrait session 3 — alleyway framing", width: 2000, height: 1333 },
      { id: "por-18", type: "image", url: "/portfolio/Portraits/Portrait_18.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_18.webp", alt: "Portrait session 3 — soft smile", width: 2000, height: 1333 },
      { id: "por-19", type: "image", url: "/portfolio/Portraits/Portrait_19.webp", thumbnailUrl: "/portfolio/Portraits/Portrait_19.webp", alt: "Portrait session 3 — downtown vibe", width: 2000, height: 1333 },
    ],
    metrics: {
      deliverables: "3 portrait sessions, 50+ selects",
      timeline: "1 week turnaround",
    },
    testimonial: {
      quote: "Three unique looks across Kraków — exactly what each client needed.",
      author: "AJ247 Studios",
      role: "Portraits, Kraków",
    },
  },
  {
    id: "12",
    slug: "krakow-motocross-highlights",
    title: "Kraków Motocross Highlights",
    client: "Motocross Collective",
    description: "High-adrenaline motocross coverage in Kraków with dust, jumps, and race-day energy captured across multiple heats.",
    shortDescription: "Motocross action set in Kraków",
    categories: ["sports", "events"],
    year: 2025,
    featured: false,
    heroMedia: {
      id: "hero-12",
      type: "image",
      url: "/portfolio/motocross/motocross_pre.webp",
      thumbnailUrl: "/portfolio/motocross/motocross_pre.webp",
      alt: "Motocross rider kicking up dust",
      width: 2000,
      height: 1333,
    },
    gallery: [
      { id: "mx-01", type: "image", url: "/portfolio/motocross/motocross_01.webp", thumbnailUrl: "/portfolio/motocross/motocross_01.webp", alt: "Motocross jump 1", width: 2000, height: 1333 },
      { id: "mx-02", type: "image", url: "/portfolio/motocross/motocross_02.webp", thumbnailUrl: "/portfolio/motocross/motocross_02.webp", alt: "Motocross jump 2", width: 2000, height: 1333 },
      { id: "mx-03", type: "image", url: "/portfolio/motocross/motocross_03.webp", thumbnailUrl: "/portfolio/motocross/motocross_03.webp", alt: "Motocross cornering", width: 2000, height: 1333 },
      { id: "mx-04", type: "image", url: "/portfolio/motocross/motocross_04.webp", thumbnailUrl: "/portfolio/motocross/motocross_04.webp", alt: "Motocross over crest", width: 2000, height: 1333 },
      { id: "mx-05", type: "image", url: "/portfolio/motocross/motocross_05.webp", thumbnailUrl: "/portfolio/motocross/motocross_05.webp", alt: "Motocross dust trail", width: 2000, height: 1333 },
      { id: "mx-06", type: "image", url: "/portfolio/motocross/motocross_06.webp", thumbnailUrl: "/portfolio/motocross/motocross_06.webp", alt: "Motocross rider mid-air", width: 2000, height: 1333 },
      { id: "mx-07", type: "image", url: "/portfolio/motocross/motocross_07.webp", thumbnailUrl: "/portfolio/motocross/motocross_07.webp", alt: "Motocross turn kick-up", width: 2000, height: 1333 },
      { id: "mx-08", type: "image", url: "/portfolio/motocross/motocross_08.webp", thumbnailUrl: "/portfolio/motocross/motocross_08.webp", alt: "Motocross rider lead pack", width: 2000, height: 1333 },
      { id: "mx-09", type: "image", url: "/portfolio/motocross/motocross_09.webp", thumbnailUrl: "/portfolio/motocross/motocross_09.webp", alt: "Motocross wheelie", width: 2000, height: 1333 },
      { id: "mx-10", type: "image", url: "/portfolio/motocross/motocross_10.webp", thumbnailUrl: "/portfolio/motocross/motocross_10.webp", alt: "Motocross berm slide", width: 2000, height: 1333 },
      { id: "mx-11", type: "image", url: "/portfolio/motocross/motocross_11.webp", thumbnailUrl: "/portfolio/motocross/motocross_11.webp", alt: "Motocross roost", width: 2000, height: 1333 },
      { id: "mx-12", type: "image", url: "/portfolio/motocross/motocross_12.webp", thumbnailUrl: "/portfolio/motocross/motocross_12.webp", alt: "Motocross duo battle", width: 2000, height: 1333 },
      { id: "mx-13", type: "image", url: "/portfolio/motocross/motocross_13.webp", thumbnailUrl: "/portfolio/motocross/motocross_13.webp", alt: "Motocross jump 3", width: 2000, height: 1333 },
      { id: "mx-14", type: "image", url: "/portfolio/motocross/motocross_14.webp", thumbnailUrl: "/portfolio/motocross/motocross_14.webp", alt: "Motocross jump 4", width: 2000, height: 1333 },
      { id: "mx-15", type: "image", url: "/portfolio/motocross/motocross_15.webp", thumbnailUrl: "/portfolio/motocross/motocross_15.webp", alt: "Motocross final lap", width: 2000, height: 1333 },
    ],
    metrics: {
      deliverables: "15 action photos",
      timeline: "Event-day delivery",
    },
  },
];

// Helper to get featured projects
export const getFeaturedProjects = (): Project[] => 
  mockProjects.filter(p => p.featured);

// Helper to filter projects by category
export const filterProjects = (
  projects: Project[], 
  category: string
): Project[] => {
  if (category === "all") return projects;
  return projects.filter(p => p.categories.includes(category as any));
};

// Helper to get category counts
export const getCategoryCounts = (projects: Project[]): Record<string, number> => {
  const counts: Record<string, number> = { all: projects.length };
  projects.forEach(p => {
    p.categories.forEach(cat => {
      counts[cat] = (counts[cat] || 0) + 1;
    });
  });
  return counts;
};
