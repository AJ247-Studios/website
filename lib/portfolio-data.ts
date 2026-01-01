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
  {
    id: "9",
    slug: "color-powder-festival",
    title: "Color Powder Festival",
    client: "Color Powder Collective",
    clientLogo: PLACEHOLDER_IMG,
    description: "Vibrant color-powder festival coverage capturing crowd moments, portraits, and dust explosions.",
    shortDescription: "Vibrant festival photos with color-dust moments",
    categories: ["events"],
    year: 2024,
    featured: false,
    heroMedia: {
      id: "hero-color",
      type: "image",
      url: "/portfolio/color-powder/Right%20after%20dust%20explosion%201.webp",
      thumbnailUrl: "/portfolio/color-powder/Right%20after%20dust%20explosion%201.webp",
      alt: "Right after dust explosion 1",
      width: 1920,
      height: 1280,
    },
    gallery: [
      { id: "cp-01", type: "image", url: "/portfolio/color-powder/A%20rapper%20shot%201.webp", thumbnailUrl: "/portfolio/color-powder/A%20rapper%20shot%201.webp", alt: "A rapper shot 1", width: 1600, height: 1067 },
      { id: "cp-02", type: "image", url: "/portfolio/color-powder/A%20rapper%20shot%202.webp", thumbnailUrl: "/portfolio/color-powder/A%20rapper%20shot%202.webp", alt: "A rapper shot 2", width: 1600, height: 1067 },
      { id: "cp-03", type: "image", url: "/portfolio/color-powder/Buffman%20smiling.webp", thumbnailUrl: "/portfolio/color-powder/Buffman%20smiling.webp", alt: "Buffman smiling", width: 1600, height: 1067 },
      { id: "cp-04", type: "image", url: "/portfolio/color-powder/Crowd%20before%20dust%20explosion.webp", thumbnailUrl: "/portfolio/color-powder/Crowd%20before%20dust%20explosion.webp", alt: "Crowd before dust explosion", width: 1920, height: 1280 },
      { id: "cp-05", type: "image", url: "/portfolio/color-powder/Crowd%20shot%201.webp", thumbnailUrl: "/portfolio/color-powder/Crowd%20shot%201.webp", alt: "Crowd shot 1", width: 1600, height: 1067 },
      { id: "cp-06", type: "image", url: "/portfolio/color-powder/Crowd%20shot%2010.webp", thumbnailUrl: "/portfolio/color-powder/Crowd%20shot%2010.webp", alt: "Crowd shot 10", width: 1600, height: 1067 },
      { id: "cp-07", type: "image", url: "/portfolio/color-powder/Crowd%20Shot%2011.webp", thumbnailUrl: "/portfolio/color-powder/Crowd%20Shot%2011.webp", alt: "Crowd Shot 11", width: 1600, height: 1067 },
      { id: "cp-08", type: "image", url: "/portfolio/color-powder/Crowd%20shot%202.webp", thumbnailUrl: "/portfolio/color-powder/Crowd%20shot%202.webp", alt: "Crowd shot 2", width: 1600, height: 1067 },
      { id: "cp-09", type: "image", url: "/portfolio/color-powder/Crowd%20shot%203.webp", thumbnailUrl: "/portfolio/color-powder/Crowd%20shot%203.webp", alt: "Crowd shot 3", width: 1600, height: 1067 },
      { id: "cp-10", type: "image", url: "/portfolio/color-powder/Crowd%20shot%204.webp", thumbnailUrl: "/portfolio/color-powder/Crowd%20shot%204.webp", alt: "Crowd shot 4", width: 1600, height: 1067 },
      { id: "cp-11", type: "image", url: "/portfolio/color-powder/Crowd%20shot%205.webp", thumbnailUrl: "/portfolio/color-powder/Crowd%20shot%205.webp", alt: "Crowd shot 5", width: 1600, height: 1067 },
      { id: "cp-12", type: "image", url: "/portfolio/color-powder/Crowd%20shot%208.webp", thumbnailUrl: "/portfolio/color-powder/Crowd%20shot%208.webp", alt: "Crowd shot 8", width: 1600, height: 1067 },
      { id: "cp-13", type: "image", url: "/portfolio/color-powder/Crowd%20shot%209.webp", thumbnailUrl: "/portfolio/color-powder/Crowd%20shot%209.webp", alt: "Crowd shot 9", width: 1600, height: 1067 },
      { id: "cp-14", type: "image", url: "/portfolio/color-powder/Crowd%20shot%20at%2012.webp", thumbnailUrl: "/portfolio/color-powder/Crowd%20shot%20at%2012.webp", alt: "Crowd shot at 12", width: 1600, height: 1067 },
      { id: "cp-15", type: "image", url: "/portfolio/color-powder/Crowdshot%206.webp", thumbnailUrl: "/portfolio/color-powder/Crowdshot%206.webp", alt: "Crowdshot 6", width: 1600, height: 1067 },
      { id: "cp-16", type: "image", url: "/portfolio/color-powder/Crowdshot%207.webp", thumbnailUrl: "/portfolio/color-powder/Crowdshot%207.webp", alt: "Crowdshot 7", width: 1600, height: 1067 },
      { id: "cp-17", type: "image", url: "/portfolio/color-powder/Dude%20posing%20In%20front%20of%20crowd.webp", thumbnailUrl: "/portfolio/color-powder/Dude%20posing%20In%20front%20of%20crowd.webp", alt: "Dude posing in front of crowd", width: 1600, height: 1067 },
      { id: "cp-18", type: "image", url: "/portfolio/color-powder/Family%20shot%201.webp", thumbnailUrl: "/portfolio/color-powder/Family%20shot%201.webp", alt: "Family shot 1", width: 1600, height: 1067 },
      { id: "cp-19", type: "image", url: "/portfolio/color-powder/Girl%20and%20boy%20shot%201.webp", thumbnailUrl: "/portfolio/color-powder/Girl%20and%20boy%20shot%201.webp", alt: "Girl and boy shot 1", width: 1600, height: 1067 },
      { id: "cp-20", type: "image", url: "/portfolio/color-powder/Girl%20holding%20phone%20one.webp", thumbnailUrl: "/portfolio/color-powder/Girl%20holding%20phone%20one.webp", alt: "Girl holding phone one", width: 1600, height: 1067 },
      { id: "cp-21", type: "image", url: "/portfolio/color-powder/Girl%20on%20stage%20o1.webp", thumbnailUrl: "/portfolio/color-powder/Girl%20on%20stage%20o1.webp", alt: "Girl on stage o1", width: 1600, height: 1067 },
      { id: "cp-22", type: "image", url: "/portfolio/color-powder/Girl%20trying%20ice%20cream%201%20%28on%20stage%29.webp", thumbnailUrl: "/portfolio/color-powder/Girl%20trying%20ice%20cream%201%20%28on%20stage%29.webp", alt: "Girl trying ice cream 1 (on stage)", width: 1600, height: 1067 },
      { id: "cp-23", type: "image", url: "/portfolio/color-powder/Girl's%20happy.webp", thumbnailUrl: "/portfolio/color-powder/Girl's%20happy.webp", alt: "Girl's happy", width: 1600, height: 1067 },
      { id: "cp-24", type: "image", url: "/portfolio/color-powder/Girls%20posing%201.webp", thumbnailUrl: "/portfolio/color-powder/Girls%20posing%201.webp", alt: "Girls posing 1", width: 1600, height: 1067 },
      { id: "cp-25", type: "image", url: "/portfolio/color-powder/Girls%20yapping%20to%201.webp", thumbnailUrl: "/portfolio/color-powder/Girls%20yapping%20to%201.webp", alt: "Girls yapping to 1", width: 1600, height: 1067 },
      { id: "cp-26", type: "image", url: "/portfolio/color-powder/Group%20picture%201.webp", thumbnailUrl: "/portfolio/color-powder/Group%20picture%201.webp", alt: "Group picture 1", width: 1600, height: 1067 },
      { id: "cp-27", type: "image", url: "/portfolio/color-powder/Group%20picture%202.webp", thumbnailUrl: "/portfolio/color-powder/Group%20picture%202.webp", alt: "Group picture 2", width: 1600, height: 1067 },
      { id: "cp-28", type: "image", url: "/portfolio/color-powder/Group%20picture%203.webp", thumbnailUrl: "/portfolio/color-powder/Group%20picture%203.webp", alt: "Group picture 3", width: 1600, height: 1067 },
      { id: "cp-29", type: "image", url: "/portfolio/color-powder/Group%20picture%204.webp", thumbnailUrl: "/portfolio/color-powder/Group%20picture%204.webp", alt: "Group picture 4", width: 1600, height: 1067 },
      { id: "cp-30", type: "image", url: "/portfolio/color-powder/Kids%20playing%202.webp", thumbnailUrl: "/portfolio/color-powder/Kids%20playing%202.webp", alt: "Kids playing 2", width: 1600, height: 1067 },
      { id: "cp-31", type: "image", url: "/portfolio/color-powder/Kids%20playing.webp", thumbnailUrl: "/portfolio/color-powder/Kids%20playing.webp", alt: "Kids playing", width: 1600, height: 1067 },
      { id: "cp-32", type: "image", url: "/portfolio/color-powder/Lonely%20dude.webp", thumbnailUrl: "/portfolio/color-powder/Lonely%20dude.webp", alt: "Lonely dude", width: 1600, height: 1067 },
      { id: "cp-33", type: "image", url: "/portfolio/color-powder/Lonely%20girl.webp", thumbnailUrl: "/portfolio/color-powder/Lonely%20girl.webp", alt: "Lonely girl", width: 1600, height: 1067 },
      { id: "cp-34", type: "image", url: "/portfolio/color-powder/Man%20taking%20a%20selfie%20with%20colored%20dust.webp", thumbnailUrl: "/portfolio/color-powder/Man%20taking%20a%20selfie%20with%20colored%20dust.webp", alt: "Man taking a selfie with colored dust", width: 1600, height: 1067 },
      { id: "cp-35", type: "image", url: "/portfolio/color-powder/Man%20trying%20ice%20cream%201%20%28On%20stage%29.webp", thumbnailUrl: "/portfolio/color-powder/Man%20trying%20ice%20cream%201%20%28On%20stage%29.webp", alt: "Man trying ice cream 1 (On stage)", width: 1600, height: 1067 },
      { id: "cp-36", type: "image", url: "/portfolio/color-powder/Men%20covered%20in%20colored%20dust%20laughing.webp", thumbnailUrl: "/portfolio/color-powder/Men%20covered%20in%20colored%20dust%20laughing.webp", alt: "Men covered in colored dust laughing", width: 1600, height: 1067 },
      { id: "cp-37", type: "image", url: "/portfolio/color-powder/Picture%20time.webp", thumbnailUrl: "/portfolio/color-powder/Picture%20time.webp", alt: "Picture time", width: 1600, height: 1067 },
      { id: "cp-38", type: "image", url: "/portfolio/color-powder/Right%20after%20Dust%20Explosion%202.webp", thumbnailUrl: "/portfolio/color-powder/Right%20after%20Dust%20Explosion%202.webp", alt: "Right after Dust Explosion 2", width: 1920, height: 1280 },
      { id: "cp-39", type: "image", url: "/portfolio/color-powder/Sign%20with%20free%20hugs%20and%20kisses.webp", thumbnailUrl: "/portfolio/color-powder/Sign%20with%20free%20hugs%20and%20kisses.webp", alt: "Sign with free hugs and kisses", width: 1600, height: 1067 },
      { id: "cp-40", type: "image", url: "/portfolio/color-powder/Speaker%20on%20stage%201.webp", thumbnailUrl: "/portfolio/color-powder/Speaker%20on%20stage%201.webp", alt: "Speaker on stage 1", width: 1600, height: 1067 },
      { id: "cp-41", type: "image", url: "/portfolio/color-powder/Two%20dudes%20smiling.webp", thumbnailUrl: "/portfolio/color-powder/Two%20dudes%20smiling.webp", alt: "Two dudes smiling", width: 1600, height: 1067 },
      { id: "cp-42", type: "image", url: "/portfolio/color-powder/Two%20dudes%20throwing%20up%20peace%20signs.webp", thumbnailUrl: "/portfolio/color-powder/Two%20dudes%20throwing%20up%20peace%20signs.webp", alt: "Two dudes throwing up peace signs", width: 1600, height: 1067 },
      { id: "cp-43", type: "image", url: "/portfolio/color-powder/Two%20girls%20dancing.webp", thumbnailUrl: "/portfolio/color-powder/Two%20girls%20dancing.webp", alt: "Two girls dancing", width: 1600, height: 1067 },
      { id: "cp-44", type: "image", url: "/portfolio/color-powder/Two%20girls%20playing.webp", thumbnailUrl: "/portfolio/color-powder/Two%20girls%20playing.webp", alt: "Two girls playing", width: 1600, height: 1067 },
      { id: "cp-45", type: "image", url: "/portfolio/color-powder/Two%20girls%20posing%20and%20smiling.webp", thumbnailUrl: "/portfolio/color-powder/Two%20girls%20posing%20and%20smiling.webp", alt: "Two girls posing and smiling", width: 1600, height: 1067 },
      { id: "cp-46", type: "image", url: "/portfolio/color-powder/Two%20girls%20shot%201.webp", thumbnailUrl: "/portfolio/color-powder/Two%20girls%20shot%201.webp", alt: "Two girls shot 1", width: 1600, height: 1067 },
      { id: "cp-47", type: "image", url: "/portfolio/color-powder/Two%20girls%20smiling.webp", thumbnailUrl: "/portfolio/color-powder/Two%20girls%20smiling.webp", alt: "Two girls smiling", width: 1600, height: 1067 },
      { id: "cp-48", type: "image", url: "/portfolio/color-powder/Two%20guys%20playing%20with%20dust%201.webp", thumbnailUrl: "/portfolio/color-powder/Two%20guys%20playing%20with%20dust%201.webp", alt: "Two guys playing with dust 1", width: 1600, height: 1067 },
      { id: "cp-49", type: "image", url: "/portfolio/color-powder/Two%20guys,%20selfie%201.webp", thumbnailUrl: "/portfolio/color-powder/Two%20guys,%20selfie%201.webp", alt: "Two guys, selfie 1", width: 1600, height: 1067 }
    ],
    metrics: {
      deliverables: "40+ festival photos",
      timeline: "Single-day coverage",
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
