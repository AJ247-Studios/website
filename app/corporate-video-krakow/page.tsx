import ServiceLandingPage, { generateServiceMetadata } from "../landing/ServiceLandingPage";

export const metadata = generateServiceMetadata({
  title: "Corporate Video Production Kraków | AJ247 Studios",
  description: "Professional corporate video production in Kraków, Poland. Brand videos, commercials, event coverage, and marketing content. Starting at 1,999 PLN. Fast delivery.",
  keywords: [
    "corporate video production kraków",
    "business video kraków",
    "commercial video poland",
    "brand video production kraków",
    "marketing video kraków",
    "corporate videographer kraków",
    "company video production poland",
  ],
});

export default function CorporateVideoPage() {
  return (
    <ServiceLandingPage
      service="Corporate Video"
      title="Corporate Video Production in Kraków"
      subtitle="Professional video content that elevates your brand and drives real business results."
      description="From brand stories to product launches, we create corporate videos that communicate your message with clarity and impact. Serving businesses in Kraków and across Poland with fast turnarounds and transparent pricing."
      image="/portfolio/background_photo.webp"
      portfolioExamples={[
        {
          title: "Brand Story Film",
          image: "/portfolio/background_photo.webp",
          category: "Corporate",
        },
        {
          title: "Product Launch Video",
          image: "/portfolio/background_photo.webp",
          category: "Commercial",
        },
        {
          title: "Event Coverage",
          image: "/portfolio/background_photo.webp",
          category: "Corporate Event",
        },
      ]}
      pricing={[
        {
          name: "Business Essential",
          price: "1,999",
          note: "Half-day shoot • Perfect for testimonials & promos",
          features: [
            "4 hours of filming",
            "1-2 min final video",
            "Professional color grading",
            "Licensed music",
            "2 revision rounds",
            "14-day delivery",
          ],
        },
        {
          name: "Commercial Package",
          price: "4,999",
          note: "Full-day • Multi-location • Social cuts included",
          features: [
            "8 hours of filming",
            "3-5 min main video",
            "3 social media cuts",
            "Multi-location coverage",
            "Script consultation",
            "Professional voiceover",
            "Unlimited revisions",
            "10-day delivery",
          ],
        },
      ]}
      faqs={[
        {
          q: "What types of corporate videos do you produce?",
          a: "We produce brand stories, product videos, testimonials, event coverage, training videos, social media content, and commercials. Tell us your goal and we'll recommend the best format.",
        },
        {
          q: "How long does corporate video production take?",
          a: "Typical turnaround is 10-14 days from shoot to final delivery. Rush projects (5-7 days) are available for an additional fee. We always communicate timelines upfront.",
        },
        {
          q: "Do you help with script and storyboard?",
          a: "Yes! Our Commercial Package includes script consultation and storyboarding. We'll work with you to refine your message before filming begins.",
        },
        {
          q: "Can you film at our office or venue?",
          a: "Absolutely. We bring portable lighting and audio equipment to any location. We've filmed in offices, factories, studios, and outdoor venues across Poland.",
        },
        {
          q: "What about music licensing?",
          a: "All our packages include licensed music. We use royalty-free libraries or can source specific tracks. You'll never have copyright issues with our videos.",
        },
      ]}
      testimonials={[
        {
          quote: "AJ247 Studios delivered a brand video that perfectly captured our company's spirit. Professional, creative, and delivered on time.",
          author: "Business Client",
          role: "Kraków",
        },
        {
          quote: "The product launch video exceeded our expectations. The social media cuts drove real engagement and sales.",
          author: "Marketing Director",
          role: "Corporate Client",
        },
        {
          quote: "Fast turnaround, great communication, and the final video was exactly what we needed. Will definitely work with them again.",
          author: "Startup Founder",
          role: "Kraków",
        },
      ]}
      teamMember={{
        name: "Josiah Ennis",
        role: "Commercial Video Specialist",
        image: "/portfolio/Josiah-full-res.webp",
        slug: "josiah",
      }}
    />
  );
}
