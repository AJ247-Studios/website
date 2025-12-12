import { Metadata } from "next";
import Script from "next/script";
import { 
  generateOrganizationSchema, 
  generatePortfolioGallerySchema,
  generateBreadcrumbSchema,
  renderSchemaScript,
} from "@/lib/seo";
import { mockProjects } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Browse AJ247 Studios portfolio of professional photo and video work. Sports events, concerts, weddings, portraits & corporate projects in Kraków.",
  openGraph: {
    title: "Portfolio | AJ247 Studios",
    description: "Browse our portfolio of professional photo and video work across sports, concerts, weddings, and corporate events.",
    url: "https://aj247studios.com/portfolio",
    images: [
      {
        url: "/portfolio/og-portfolio.jpg",
        width: 1200,
        height: 630,
        alt: "AJ247 Studios Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio | AJ247 Studios",
    description: "Professional photo and video production portfolio. Sports, concerts, weddings & corporate.",
  },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Generate schema data
  const organizationSchema = generateOrganizationSchema();
  const gallerySchema = generatePortfolioGallerySchema(mockProjects);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Portfolio", url: "/portfolio" },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderSchemaScript(organizationSchema) }}
      />
      <Script
        id="gallery-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderSchemaScript(gallerySchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderSchemaScript(breadcrumbSchema) }}
      />
      
      {children}
    </>
  );
}
