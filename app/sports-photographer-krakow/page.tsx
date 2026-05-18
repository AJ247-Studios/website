import ServiceLandingPage, { generateServiceMetadata } from "../landing/ServiceLandingPage";

export const metadata = generateServiceMetadata({
  title: "Sports Photographer Kraków | AJ247 Studios",
  description: "Professional sports photography and videography in Kraków, Poland. Coverage of tournaments, matches, and athletic events. Starting at 1,499 PLN. Fast turnaround.",
  keywords: [
    "sports photographer kraków",
    "sports photography poland",
    "event photographer kraków",
    "tournament coverage kraków",
    "sports videographer kraków",
    "athletic photography poland",
    "sports photo packages kraków",
  ],
});

export default function SportsPhotographerPage() {
  return (
    <ServiceLandingPage
      service="Sports Photography"
      title="Sports Photographer in Kraków"
      subtitle="Dynamic sports photography & videography that captures the energy and intensity of every moment."
      description="From local tournaments to professional matches, we deliver high-impact sports coverage. Fast-paced action, dramatic angles, and instant social-ready edits. We've covered 80+ sports events across Poland."
      image="/portfolio/FCA/20251129-DSC_2477-2.webp"
      portfolioExamples={[
        {
          title: "FCA Basketball Tournament",
          image: "/portfolio/FCA/20251129-DSC_2477-2.webp",
          category: "Basketball",
        },
        {
          title: "Football Match Coverage",
          image: "/portfolio/football/football_pre.webp",
          category: "Football",
        },
        {
          title: "Motocross Action",
          image: "/portfolio/motocross/motocross_pre.webp",
          category: "Motocross",
        },
      ]}
      pricing={[
        {
          name: "Game Day",
          price: "1,499",
          note: "3-4 hours • Perfect for single matches",
          features: [
            "3-4 hours of coverage",
            "80–100+ edited photos",
            "1-2 min highlight reel",
            "Online gallery delivery",
            "16 business day delivery",
          ],
        },
        {
          name: "Tournament",
          price: "3,499",
          note: "Full day • Photo + Video • Social cuts",
          features: [
            "5+ hours of coverage",
            "150–200+ edited photos",
            "5-min highlight film",
            "3 social media cuts",
            "Second photographer",
            "Online gallery + USB",
            "16 business day delivery",
          ],
        },
      ]}
      faqs={[
        {
          q: "What types of sports events do you cover?",
          a: "We cover basketball, football, volleyball, motocross, athletics, martial arts, and more. If your sport isn't listed, just ask — we adapt to any athletic event.",
        },
        {
          q: "How quickly can we get the photos after the event?",
          a: "Standard delivery is 16 business days. Rush delivery (48 hours) is available for an additional fee — perfect when you need content for social media immediately after the event.",
        },
        {
          q: "Do you provide social media-ready edits?",
          a: "Yes! Our Tournament package includes 3 social media cuts — short, high-impact videos optimized for Instagram Reels, TikTok, and Facebook.",
        },
        {
          q: "Can you cover multiple games in one day?",
          a: "Absolutely. The Tournament package is designed for full-day coverage. We can split time between different matches or courts as needed.",
        },
        {
          q: "Do you shoot indoor sports with low lighting?",
          a: "Yes, our cameras perform excellently in low light, and we bring professional lighting when needed. Indoor sports photography is one of our specialties.",
        },
      ]}
      testimonials={[
        {
          quote: "We had the opportunity to work with AJ247 Studios on several sports projects, and I'm fully satisfied. With every video, I could see clear progress. These young talents are doing a great job.",
          author: "Dima",
          role: "FCA Kraków",
        },
        {
          quote: "Worked with them on a few events already and they've been consistent every time. Quick delivery, good communication, and they always manage to catch the key moments.",
          author: "mjakmalopolska",
          role: "Sports & Press",
        },
        {
          quote: "Solid work overall. They captured the energy of the tournament perfectly.",
          author: "Tournament Organizer",
          role: "Kraków",
        },
      ]}
      teamMember={{
        name: "Josiah Ennis",
        role: "Sports Videography Specialist",
        image: "/portfolio/Josiah-full-res.webp",
        slug: "josiah",
      }}
    />
  );
}
