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

  // TODO: Add dynamic portfolio project pages when implemented
  // const portfolioProjects = await getPortfolioProjects();
  // const projectPages = portfolioProjects.map(project => ({
  //   url: `${baseUrl}/portfolio/${project.slug}`,
  //   lastModified: project.updatedAt,
  //   changeFrequency: "monthly" as const,
  //   priority: 0.6,
  // }));

  return [...staticPages];
}
