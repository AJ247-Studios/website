import HeroSection from "@/components/HeroSection";
import ServicesGrid from "@/components/ServicesGrid";
import SocialProof from "@/components/SocialProof";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <>
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
