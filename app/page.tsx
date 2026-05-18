import HeroSection from "@/components/HeroSection";
import ServicesGrid from "@/components/ServicesGrid";
import SocialProof from "@/components/SocialProof";
import CTASection from "@/components/CTASection";
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  heroVideoSchema,
} from "@/lib/schemas";

export default function Home() {
  // Combine all homepage schemas
  const homeSchemas = [
    organizationSchema,
    localBusinessSchema,
    websiteSchema,
    heroVideoSchema,
  ];

  return (
    <>
      {/* JSON-LD Structured Data — CRITICAL for AI bots */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            homeSchemas.map((s) => ({ "@context": "https://schema.org", ...s }))
          ),
        }}
      />

      {/* Hero - Value proposition + primary CTAs */}
      <HeroSection />

      {/* Services - What we offer with pricing anchors */}
      <ServicesGrid />

      {/* Social Proof - Testimonials, client logos, stats */}
      <SocialProof />

      {/* Final CTA - Conversion push with urgency */}
      <CTASection />
    </>
  );
}
