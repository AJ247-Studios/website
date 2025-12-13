/**
 * Portfolio Mock Data
 * 
 * Example project data for development and SSG.
 * In production, this would come from a CMS or database.
 */

import { Project, FilterOption } from "@/lib/types/portfolio";

// Placeholder image used for all portfolio items
const PLACEHOLDER_IMG = "/portfolio/placeholder.jpg";

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
    id: "1",
    slug: "wisla-krakow-championship",
    title: "Wisła Kraków Championship Season",
    client: "Wisła Kraków",
    clientLogo: PLACEHOLDER_IMG,
    description: "Full season coverage of Wisła Kraków's championship run, capturing every crucial moment from training sessions to the final trophy lift. Our team embedded with the club to deliver real-time content for social media and premium archival footage.",
    shortDescription: "Full season sports coverage with 500+ deliverables",
    categories: ["sports"],
    year: 2024,
    featured: true,
    heroMedia: {
      id: "hero-1",
      type: "image",
      url: PLACEHOLDER_IMG,
      thumbnailUrl: PLACEHOLDER_IMG,
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAAMAAAAAAAAAAAAAAAAAAQIDITH/2gAMAwEAAhEDEQA/ANB6d1W+1C9uop5YmjhCbAkZXnOc5yT9FKUqhJcSp0z/2Q==",
      alt: "Wisła Kraków players celebrating championship victory",
      width: 1920,
      height: 1080,
    },
    gallery: [
      {
        id: "g1-1",
        type: "image",
        url: PLACEHOLDER_IMG,
        thumbnailUrl: PLACEHOLDER_IMG,
        alt: "Team training session",
        width: 1200,
        height: 800,
      },
      {
        id: "g1-2",
        type: "image",
        url: PLACEHOLDER_IMG,
        thumbnailUrl: PLACEHOLDER_IMG,
        alt: "Season highlights",
        width: 1920,
        height: 1080,
      },
    ],
    metrics: {
      impressions: 2400000,
      deliverables: "500+ photos, 45 videos",
      timeline: "9 months",
    },
    testimonial: {
      quote: "AJ247 became part of our family. Their work captured our spirit perfectly.",
      author: "Marek Kowalski",
      role: "Marketing Director, Wisła Kraków",
    },
  },
  {
    id: "2",
    slug: "tauron-arena-festivals",
    title: "Tauron Arena Summer Festivals",
    client: "Tauron Arena",
    clientLogo: PLACEHOLDER_IMG,
    description: "Complete photo and video coverage of three major music festivals at Tauron Arena, including artist backstage content, crowd moments, and promotional material for next year's events.",
    shortDescription: "Multi-festival coverage with 2.4M+ social reach",
    categories: ["concerts", "events"],
    year: 2024,
    featured: true,
    heroMedia: {
      id: "hero-2",
      type: "image",
      url: PLACEHOLDER_IMG,
      thumbnailUrl: PLACEHOLDER_IMG,
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAAMAAAAAAAAAAAAAAAAAAQIDITH/2gAMAwEAAhEDEQA/ANB6d1W+1C9uop5YmjhCbAkZXnOc5yT9FKUqhJcSp0z/2Q==",
      alt: "Crowd at Tauron Arena concert with stage lights",
      width: 1920,
      height: 1080,
    },
    gallery: [
      {
        id: "g2-1",
        type: "image",
        url: PLACEHOLDER_IMG,
        thumbnailUrl: PLACEHOLDER_IMG,
        alt: "Artist performing on main stage",
        width: 1200,
        height: 1800,
      },
      {
        id: "g2-2",
        type: "image",
        url: PLACEHOLDER_IMG,
        thumbnailUrl: PLACEHOLDER_IMG,
        alt: "Festival crowd aerial view",
        width: 1200,
        height: 800,
      },
    ],
    metrics: {
      impressions: 2400000,
      deliverables: "300+ photos, 25 videos",
      timeline: "3 events, 6 days",
    },
    testimonial: {
      quote: "The footage drove our ticket pre-sales up 24% for next year.",
      author: "Anna Nowak",
      role: "Events Manager, Tauron Arena",
    },
  },
  {
    id: "3",
    slug: "kasia-tomasz-wedding",
    title: "Kasia & Tomasz Wedding",
    client: "Private",
    description: "An intimate vineyard wedding in the Polish countryside. We captured every moment from the morning preparations to the late-night celebrations, delivering a cinematic highlight film and complete photo collection.",
    shortDescription: "Cinematic vineyard wedding with 48hr highlights",
    categories: ["weddings"],
    year: 2024,
    featured: true,
    heroMedia: {
      id: "hero-3",
      type: "image",
      url: PLACEHOLDER_IMG,
      thumbnailUrl: PLACEHOLDER_IMG,
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAAMAAAAAAAAAAAAAAAAAAQIDITH/2gAMAwEAAhEDEQA/ANB6d1W+1C9uop5YmjhCbAkZXnOc5yT9FKUqhJcSp0z/2Q==",
      alt: "Bride and groom at vineyard sunset",
      width: 1200,
      height: 1800,
    },
    gallery: [
      {
        id: "g3-1",
        type: "image",
        url: PLACEHOLDER_IMG,
        thumbnailUrl: PLACEHOLDER_IMG,
        alt: "Wedding highlights",
        width: 1920,
        height: 1080,
      },
    ],
    metrics: {
      deliverables: "400+ photos, 8min film",
      timeline: "48hr highlights delivery",
    },
    testimonial: {
      quote: "We cried watching the highlights. Absolutely perfect.",
      author: "Kasia & Tomasz",
    },
  },
  {
    id: "4",
    slug: "tech-startup-headshots",
    title: "TechFlow Startup Team",
    client: "TechFlow",
    clientLogo: PLACEHOLDER_IMG,
    description: "Professional headshots and brand photography for a 50-person tech startup. Consistent, modern style across all team members with quick turnaround for their website launch.",
    shortDescription: "50+ professional headshots in one day",
    categories: ["portraits", "corporate"],
    year: 2024,
    featured: false,
    heroMedia: {
      id: "hero-4",
      type: "image",
      url: PLACEHOLDER_IMG,
      thumbnailUrl: PLACEHOLDER_IMG,
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAAMAAAAAAAAAAAAAAAAAAQIDITH/2gAMAwEAAhEDEQA/ANB6d1W+1C9uop5YmjhCbAkZXnOc5yT9FKUqhJcSp0z/2Q==",
      alt: "Professional headshot grid of tech team",
      width: 1200,
      height: 800,
    },
    gallery: [],
    metrics: {
      deliverables: "50 headshots, 20 team photos",
      timeline: "1-day shoot, 3-day delivery",
    },
  },
  {
    id: "5",
    slug: "corporate-conference-2024",
    title: "Annual Tech Summit 2024",
    client: "Innovation Hub",
    clientLogo: PLACEHOLDER_IMG,
    description: "Two-day conference coverage including keynote presentations, panel discussions, networking events, and promotional content for social media and press releases.",
    shortDescription: "2-day conference with livestream support",
    categories: ["corporate", "events"],
    year: 2024,
    featured: false,
    heroMedia: {
      id: "hero-5",
      type: "image",
      url: PLACEHOLDER_IMG,
      thumbnailUrl: PLACEHOLDER_IMG,
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAAMAAAAAAAAAAAAAAAAAAQIDITH/2gAMAwEAAhEDEQA/ANB6d1W+1C9uop5YmjhCbAkZXnOc5yT9FKUqhJcSp0z/2Q==",
      alt: "Conference keynote speaker on stage",
      width: 1920,
      height: 1080,
    },
    gallery: [],
    metrics: {
      impressions: 150000,
      deliverables: "200+ photos, 12 videos",
      timeline: "Same-day social delivery",
    },
  },
  {
    id: "6",
    slug: "marathon-krakow",
    title: "Kraków Marathon 2024",
    client: "Kraków City Sports",
    description: "Complete coverage of the Kraków Marathon from start to finish line, capturing elite runners, amateur participants, and the electric atmosphere of the city.",
    shortDescription: "15,000 runners, 500+ finish line photos",
    categories: ["sports", "events"],
    year: 2024,
    featured: false,
    heroMedia: {
      id: "hero-6",
      type: "image",
      url: PLACEHOLDER_IMG,
      thumbnailUrl: PLACEHOLDER_IMG,
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAAMAAAAAAAAAAAAAAAAAAQIDITH/2gAMAwEAAhEDEQA/ANB6d1W+1C9uop5YmjhCbAkZXnOc5yT9FKUqhJcSp0z/2Q==",
      alt: "Marathon runners crossing the finish line",
      width: 1200,
      height: 800,
    },
    gallery: [],
    metrics: {
      deliverables: "500+ photos, drone footage",
      timeline: "Same-day delivery",
    },
  },
  {
    id: "7",
    slug: "portrait-session-influencer",
    title: "Lifestyle Portrait Session",
    client: "Marta K.",
    description: "Personal branding shoot for a lifestyle influencer, creating content for Instagram, YouTube, and press materials.",
    shortDescription: "Personal brand content for 100K+ influencer",
    categories: ["portraits"],
    year: 2024,
    featured: false,
    heroMedia: {
      id: "hero-7",
      type: "image",
      url: PLACEHOLDER_IMG,
      thumbnailUrl: PLACEHOLDER_IMG,
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAAMAAAAAAAAAAAAAAAAAAQIDITH/2gAMAwEAAhEDEQA/ANB6d1W+1C9uop5YmjhCbAkZXnOc5yT9FKUqhJcSp0z/2Q==",
      alt: "Lifestyle portrait in urban setting",
      width: 800,
      height: 1200,
    },
    gallery: [],
    metrics: {
      deliverables: "75 photos, 3 locations",
      timeline: "5-day delivery",
    },
  },
  {
    id: "8",
    slug: "music-video-production",
    title: "Music Video: 'Electric Dreams'",
    client: "DJ Elektra",
    description: "Full music video production including concept development, filming across 3 locations, and final edit with color grading and VFX.",
    shortDescription: "Full music video with 1M+ YouTube views",
    categories: ["concerts"],
    year: 2023,
    featured: false,
    heroMedia: {
      id: "hero-8",
      type: "image",
      url: PLACEHOLDER_IMG,
      thumbnailUrl: PLACEHOLDER_IMG,
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAAMAAAAAAAAAAAAAAAAAAQIDITH/2gAMAwEAAhEDEQA/ANB6d1W+1C9uop5YmjhCbAkZXnOc5yT9FKUqhJcSp0z/2Q==",
      alt: "Music video still with neon lights",
      width: 1920,
      height: 1080,
    },
    gallery: [],
    metrics: {
      impressions: 1200000,
      deliverables: "4-minute video, BTS content",
      timeline: "2-week production",
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
