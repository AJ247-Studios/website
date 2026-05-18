import { MetadataRoute } from "next";

/**
 * Dynamic Sitemap Generator
 * 
 * Generates a sitemap for search engines to discover all pages.
 * This is critical for SEO - without it, Google may miss pages.
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://aj247studios.com";
  const currentDate = new Date();

  // Static pages with their priority and change frequency
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  // Team member pages
  const teamMembers = ["anthony", "josiah", "ivan", "tomek"];
  const teamPages = teamMembers.map((slug) => ({
    url: `${baseUrl}/team/${slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Booking page
  const bookingPage = {
    url: `${baseUrl}/book`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  };

  return [...staticPages, bookingPage, ...teamPages];
}
