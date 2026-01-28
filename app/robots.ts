import { MetadataRoute } from "next";

/**
 * Robots.txt Generator
 * 
 * Tells search engines which pages to crawl and which to ignore.
 * Critical for SEO and preventing indexing of admin/auth pages.
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://aj247studios.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/admin",
          "/api/",
          "/login",
          "/signup",
          "/profile",
          "/portal/",
          "/client/",
          "/auth/",
          "/_dev/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
