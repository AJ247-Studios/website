import { Metadata } from "next";
import PortfolioPageClient from "./PortfolioPageClient";
import { getBreadcrumbSchema } from "@/lib/schemas";

export const metadata: Metadata = {
  title: "Portfolio | AJ247 Studios",
  description: "View 150+ photo and video projects by AJ247 Studios. Sports events, concerts, weddings, portraits, and corporate work in Kraków, Poland.",
  keywords: [
    "AJ247 Studios portfolio",
    "photo portfolio Kraków",
    "video portfolio Poland",
    "wedding photography examples",
    "sports photography portfolio",
    "concert videography work",
    "corporate video examples Kraków",
  ],
  openGraph: {
    title: "Portfolio | AJ247 Studios",
    description: "150+ projects delivered. See our best work in sports, weddings, concerts, and corporate video.",
    url: "https://aj247studios.com/portfolio",
    type: "website",
    images: [{
      url: "https://aj247studios.com/portfolio/Concert1.webp",
      width: 1200,
      height: 630,
      alt: "AJ247 Studios Portfolio - Concert Photography",
    }],
  },
};

const portfolioBreadcrumb = getBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Portfolio", url: "/portfolio" },
]);

// Image gallery schema for portfolio
const imageGallerySchema = {
  "@type": "ImageGallery",
  name: "AJ247 Studios Portfolio",
  description: "Photo and video portfolio showcasing work across sports, concerts, weddings, portraits, and corporate events.",
  url: "https://aj247studios.com/portfolio",
  image: [
    "https://aj247studios.com/portfolio/Concert1.webp",
    "https://aj247studios.com/portfolio/Sport1.webp",
    "https://aj247studios.com/portfolio/Wedding1.webp",
  ],
};

export default function PortfolioPage() {
  return (
    <main>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            { "@context": "https://schema.org", ...portfolioBreadcrumb },
            { "@context": "https://schema.org", ...imageGallerySchema },
          ]),
        }}
      />

      <PortfolioPageClient />
    </main>
  );
}
