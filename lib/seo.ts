/**
 * SEO Utilities & JSON-LD Schema Generation
 * 
 * Provides structured data for rich search results.
 * Follows schema.org specifications for CreativeWork, ImageObject, and Organization.
 */

import { Project } from "@/lib/types/portfolio";

interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  address: {
    "@type": "PostalAddress";
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  contactPoint: {
    "@type": "ContactPoint";
    telephone: string;
    contactType: string;
    availableLanguage: string[];
  };
  sameAs: string[];
}

interface CreativeWorkSchema {
  "@context": "https://schema.org";
  "@type": "CreativeWork";
  name: string;
  description: string;
  creator: {
    "@type": "Organization";
    name: string;
  };
  dateCreated: string;
  image?: string;
  video?: {
    "@type": "VideoObject";
    name: string;
    description: string;
    thumbnailUrl: string;
    contentUrl: string;
    duration?: string;
  };
  keywords: string[];
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
}

interface ImageGallerySchema {
  "@context": "https://schema.org";
  "@type": "ImageGallery";
  name: string;
  description: string;
  image: {
    "@type": "ImageObject";
    contentUrl: string;
    description: string;
    name: string;
  }[];
}

// Site configuration
const SITE_CONFIG = {
  name: "AJ247 Studios",
  url: "https://aj247studios.com",
  logo: "https://aj247studios.com/logo.png",
  description: "Professional photo and video production in Kraków. Sports events, concerts, weddings, portraits & corporate.",
  address: {
    locality: "Kraków",
    region: "Lesser Poland",
    country: "PL",
  },
  phone: "+48 123 456 789",
  social: {
    instagram: "https://instagram.com/aj247studios",
    youtube: "https://youtube.com/@aj247studios",
    facebook: "https://facebook.com/aj247studios",
  },
};

/**
 * Generate Organization schema for the site
 */
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: SITE_CONFIG.logo,
    description: SITE_CONFIG.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_CONFIG.address.locality,
      addressRegion: SITE_CONFIG.address.region,
      addressCountry: SITE_CONFIG.address.country,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE_CONFIG.phone,
      contactType: "customer service",
      availableLanguage: ["English", "Polish"],
    },
    sameAs: [
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.youtube,
      SITE_CONFIG.social.facebook,
    ],
  };
}

/**
 * Generate CreativeWork schema for a project
 */
export function generateProjectSchema(project: Project): CreativeWorkSchema {
  const schema: CreativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    creator: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
    },
    dateCreated: `${project.year}-01-01`,
    keywords: [
      ...project.categories,
      "photography",
      "videography",
      "Kraków",
      project.client,
    ],
  };

  // Add image
  if (project.heroMedia.type === "image") {
    schema.image = `${SITE_CONFIG.url}${project.heroMedia.url}`;
  }

  // Add video if present
  if (project.heroMedia.type === "video") {
    schema.video = {
      "@type": "VideoObject",
      name: project.title,
      description: project.shortDescription,
      thumbnailUrl: `${SITE_CONFIG.url}${project.heroMedia.thumbnailUrl}`,
      contentUrl: `${SITE_CONFIG.url}${project.heroMedia.url}`,
      duration: project.heroMedia.duration 
        ? `PT${Math.floor(project.heroMedia.duration / 60)}M${project.heroMedia.duration % 60}S`
        : undefined,
    };
  }

  return schema;
}

/**
 * Generate ImageGallery schema for portfolio page
 */
export function generatePortfolioGallerySchema(projects: Project[]): ImageGallerySchema {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "AJ247 Studios Portfolio",
    description: "Browse our portfolio of professional photo and video work across sports, concerts, weddings, and corporate events.",
    image: projects
      .filter(p => p.heroMedia.type === "image")
      .slice(0, 20) // Limit for schema size
      .map(p => ({
        "@type": "ImageObject",
        contentUrl: `${SITE_CONFIG.url}${p.heroMedia.url}`,
        description: p.heroMedia.alt,
        name: p.title,
      })),
  };
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

/**
 * Generate LocalBusiness schema for better local SEO
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_CONFIG.url}/#business`,
    name: SITE_CONFIG.name,
    image: SITE_CONFIG.logo,
    url: SITE_CONFIG.url,
    telephone: SITE_CONFIG.phone,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_CONFIG.address.locality,
      addressRegion: SITE_CONFIG.address.region,
      addressCountry: SITE_CONFIG.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 50.0647,
      longitude: 19.9450,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 4.9,
      reviewCount: 127,
    },
  };
}

/**
 * Render schema as script tag content
 */
export function renderSchemaScript(schema: object): string {
  return JSON.stringify(schema);
}
