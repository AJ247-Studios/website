import ServiceLandingPage, { generateServiceMetadata } from "../landing/ServiceLandingPage";

export const metadata = generateServiceMetadata({
  title: "Concert & Event Videographer Poland | AJ247 Studios",
  description: "Professional concert and live event videography in Poland. High-energy coverage for festivals, concerts, and live performances. Starting at 1,499 PLN. Book now.",
  keywords: [
    "concert videographer poland",
    "event videographer kraków",
    "festival coverage poland",
    "live event video kraków",
    "concert photography kraków",
    "music video production poland",
    "event coverage kraków",
  ],
});

export default function ConcertVideographerPage() {
  return (
    <ServiceLandingPage
      service="Concert Videography"
      title="Concert & Event Videographer in Poland"
      subtitle="High-energy photo and video coverage that captures the atmosphere of your live events."
      description="From intimate club shows to major festivals, we deliver cinematic event coverage. Low-light expertise, multi-camera setups, and fast social-ready edits. Available across Poland for concerts, festivals, corporate events, and private parties."
      image="/portfolio/Concert/DSC_5727.webp"
      portfolioExamples={[
        {
          title: "Live Concert Coverage",
          image: "/portfolio/Concert/DSC_5727.webp",
          category: "Concert",
        },
        {
          title: "Festival Documentation",
          image: "/portfolio/Concert/DSC_5727.webp",
          category: "Festival",
        },
        {
          title: "Club Performance",
          image: "/portfolio/Concert/DSC_5727.webp",
          category: "Live Music",
        },
      ]}
      pricing={[
        {
          name: "Show Coverage",
          price: "1,499",
          note: "Single event • 3-4 hours • Social cuts",
          features: [
            "3-4 hours of coverage",
            "80–100+ edited photos",
            "1-2 min highlight reel",
            "Social media cuts",
            "Online gallery delivery",
            "16 business day delivery",
          ],
        },
        {
          name: "Festival Package",
          price: "3,499",
          note: "Multi-day • Full coverage • Fast delivery",
          features: [
            "Full festival coverage",
            "200+ edited photos per day",
            "5-min highlight film",
            "Daily social media cuts",
            "Second photographer",
            "Online gallery + USB",
            "Priority 10-day delivery",
          ],
        },
      ]}
      faqs={[
        {
          q: "Do you shoot in low-light concert venues?",
          a: "Yes, low-light performance is one of our specialties. Our cameras excel in dark venues, and we bring professional lighting when permitted. We've shot in clubs, theaters, and outdoor festivals.",
        },
        {
          q: "How quickly can we get content for social media?",
          a: "Our Show Coverage package includes social media cuts delivered within 48 hours. Perfect for promoting upcoming shows while the energy is still fresh.",
        },
        {
          q: "Can you cover multi-day festivals?",
          a: "Absolutely. Our Festival Package is designed for multi-day events. We provide daily photo dumps and a comprehensive highlight reel covering the entire festival.",
        },
        {
          q: "Do you work with venues directly or artists?",
          a: "Both! We work with venues, event organizers, artists, and promoters. We can also provide content packages that venues use for future marketing.",
        },
        {
          q: "What's included in the highlight reel?",
          a: "A cinematic 1-5 minute video featuring the best moments of your event, set to licensed music. The Festival Package includes a longer form documentary-style edit.",
        },
      ]}
      testimonials={[
        {
          quote: "Didn't really expect much going in, but I was honestly surprised. The photos came out really clean and natural, nothing looked staged. They managed to capture the vibe of the night really well.",
          author: "Piotr",
          role: "Event Organizer",
        },
        {
          quote: "The concert footage was incredible. They captured angles we didn't even know existed. The highlight reel got thousands of views on social media.",
          author: "Band Manager",
          role: "Kraków",
        },
        {
          quote: "Professional, unobtrusive, and the final video was exactly what we needed for our festival recap. Highly recommend.",
          author: "Festival Organizer",
          role: "Poland",
        },
      ]}
      teamMember={{
        name: "Josiah Ennis",
        role: "Event Videography Specialist",
        image: "/portfolio/Josiah-full-res.webp",
        slug: "josiah",
      }}
    />
  );
}
