import ServiceLandingPage, { generateServiceMetadata } from "../landing/ServiceLandingPage";

export const metadata = generateServiceMetadata({
  title: "Wedding Photographer Kraków | AJ247 Studios",
  description: "Professional wedding photography and videography in Kraków, Poland. Cinematic coverage, 150+ edited photos, 48h delivery. Starting at 2,999 PLN. Book your date now.",
  keywords: [
    "wedding photographer kraków",
    "wedding videographer kraków",
    "wedding photography poland",
    "kraków wedding photographer",
    "wedding photo packages kraków",
    "best wedding photographer kraków",
    "wedding video production kraków",
  ],
});

export default function WeddingPhotographerPage() {
  return (
    <ServiceLandingPage
      service="Wedding Photography"
      title="Wedding Photographer in Kraków"
      subtitle="Cinematic wedding photography & videography that captures every special moment of your big day."
      description="From intimate ceremonies to grand celebrations, we document your wedding with a natural, editorial style. Based in Kraków, available throughout Poland and internationally. Our team has covered 50+ weddings with an average rating of 4.9/5."
      image="/portfolio/Wedding/20070110_DSC_1186.webp"
      portfolioExamples={[
        {
          title: "Mark & Roxi Wedding",
          image: "/portfolio/Wedding/20070110_DSC_1186.webp",
          category: "Wedding",
        },
        {
          title: "Kraków Church Ceremony",
          image: "/portfolio/Wedding/20070110_DSC_1186.webp",
          category: "Ceremony",
        },
        {
          title: "Outdoor Reception",
          image: "/portfolio/Wedding/20070110_DSC_1186.webp",
          category: "Reception",
        },
      ]}
      pricing={[
        {
          name: "Essential",
          price: "2,999",
          note: "6 hours coverage • Perfect for intimate weddings",
          features: [
            "6 hours of coverage",
            "200+ edited photos",
            "Online gallery delivery",
            "1 photographer",
            "14-day delivery",
          ],
        },
        {
          name: "Premium",
          price: "4,999",
          note: "10 hours • Photo + Video • Most popular",
          features: [
            "10 hours of coverage",
            "400+ edited photos",
            "Cinematic highlight film (5-7 min)",
            "2 photographers + videographer",
            "Online gallery + USB drive",
            "14-day delivery",
          ],
        },
      ]}
      faqs={[
        {
          q: "How far in advance should we book our wedding photographer?",
          a: "We recommend booking 3–6 months in advance, especially for peak season (May–September). Popular dates fill up quickly. Last-minute bookings are possible depending on availability.",
        },
        {
          q: "Do you travel outside Kraków for weddings?",
          a: "Yes, we cover all of Poland and travel internationally. Travel fees apply for locations outside Kraków city limits — contact us for a quote.",
        },
        {
          q: "What happens if it rains on our wedding day?",
          a: "We always have a backup plan! We scout indoor locations beforehand and bring professional lighting equipment. Some of our most stunning photos were taken in the rain.",
        },
        {
          q: "How many photos will we receive?",
          a: "The Essential package includes 200+ edited photos. The Premium package includes 400+ edited photos. All photos are professionally color-graded and retouched.",
        },
        {
          q: "Can we request specific shots or styles?",
          a: "Absolutely. We encourage you to share Pinterest boards, reference photos, or a shot list before the wedding. We'll work together to achieve your vision.",
        },
      ]}
      testimonials={[
        {
          quote: "We're really glad we went with AJ247Studios for our wedding. Nothing felt forced, they just captured everything as it happened. Looking through the photos brought the whole day back.",
          author: "Mark & Roxi",
          role: "Wedding Client",
        },
        {
          quote: "The photos came out really clean and natural, nothing looked staged or awkward. They managed to capture the vibe of the night really well.",
          author: "Piotr",
          role: "Wedding Guest",
        },
        {
          quote: "Professional, creative, and captured every special moment. Highly recommend!",
          author: "Happy Client",
          role: "Wedding",
        },
      ]}
      teamMember={{
        name: "Anthony Certeza",
        role: "Wedding Photography Specialist",
        image: "/portfolio/Anthony-full-res.webp",
        slug: "anthony",
      }}
    />
  );
}
