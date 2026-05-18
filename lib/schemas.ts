/**
 * Schema.org Structured Data Definitions
 * 
 * These schemas are CRITICAL for AI/LLM optimization.
 * AI bots (ChatGPT, Claude, Perplexity, Google AI Overviews) 
 * read structured data to understand and reference businesses.
 * 
 * Key schemas:
 * - Organization: Defines the business entity
 * - LocalBusiness: Location + services for local SEO
 * - Service: Specific services offered
 * - FAQPage: Questions AI can answer directly
 * - HowTo: Process steps AI can reference
 * - Review: Social proof signals
 * - Person: Team member profiles
 * - WebSite: Site structure + search
 */

const BASE_URL = "https://aj247studios.com";

// ─── Organization Schema ───
export const organizationSchema = {
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: "AJ247 Studios",
  alternateName: "AJ247",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/logo.png`,
    width: 512,
    height: 512,
    caption: "AJ247 Studios Logo",
  },
  image: `${BASE_URL}/og-image.jpg`,
  description:
    "Premium photo and video production studio in Kraków, Poland. Specializing in sports events, concerts, weddings, portraits, and corporate media.",
  foundingDate: "2023",
  founders: [
    {
      "@type": "Person",
      name: "Josiah Ennis",
      jobTitle: "Videographer / Co-founder",
    },
    {
      "@type": "Person",
      name: "Anthony Certeza",
      jobTitle: "Photographer / Co-founder",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kraków",
    addressRegion: "Lesser Poland",
    addressCountry: "PL",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+48-503-685-377",
    contactType: "Booking",
    availableLanguage: ["English", "Polish"],
  },
  sameAs: [
    "https://www.instagram.com/aj247studios",
    "https://wa.me/48503685377",
  ],
  priceRange: "$$",
};

// ─── LocalBusiness Schema ───
export const localBusinessSchema = {
  "@type": ["LocalBusiness", "Photographer", "ProfessionalService"],
  "@id": `${BASE_URL}/#localbusiness`,
  name: "AJ247 Studios",
  image: `${BASE_URL}/og-image.jpg`,
  url: BASE_URL,
  telephone: "+48-503-685-377",
  email: "contact@aj247studios.com",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kraków",
    addressLocality: "Kraków",
    addressRegion: "Lesser Poland",
    postalCode: "30-001",
    addressCountry: "PL",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "50.0647",
    longitude: "19.9450",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "16:00",
    },
  ],
  areaServed: {
    "@type": "City",
    name: "Kraków",
    containedInPlace: {
      "@type": "Country",
      name: "Poland",
    },
  },
  serviceArea: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: "50.0647",
      longitude: "19.9450",
    },
    geoRadius: "50000",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Photo & Video Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Sports Photography & Videography",
          description: "Professional coverage of sports events, tournaments, and athletic competitions.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Concert & Event Coverage",
          description: "High-energy photo and video coverage for concerts, festivals, and live events.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Wedding Photography & Videography",
          description: "Cinematic wedding coverage capturing every special moment.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Portrait Photography",
          description: "Professional portraits for individuals, couples, and families.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Corporate Video Production",
          description: "Professional video content for businesses, brands, and marketing.",
        },
      },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "150",
    bestRating: "5",
    worstRating: "1",
  },
};

// ─── WebSite Schema with SearchAction ───
export const websiteSchema = {
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: "AJ247 Studios",
  description: "Premium photo and video production in Kraków, Poland",
  publisher: {
    "@id": `${BASE_URL}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/services?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// ─── BreadcrumbList Schema ───
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

// ─── Service Schema for Services Page ───
export const servicesSchema = {
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Service",
        name: "Sports Photography & Videography",
        description: "Professional coverage of sports events, tournaments, and athletic competitions in Kraków and across Poland.",
        provider: { "@id": `${BASE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "Poland" },
        serviceType: "Photography",
        offers: {
          "@type": "Offer",
          price: "1499",
          priceCurrency: "PLN",
          priceValidUntil: "2026-12-31",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Service",
        name: "Concert & Event Coverage",
        description: "High-energy photo and video coverage for concerts, festivals, and live events.",
        provider: { "@id": `${BASE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "Poland" },
        serviceType: "Videography",
        offers: {
          "@type": "Offer",
          price: "1499",
          priceCurrency: "PLN",
          priceValidUntil: "2026-12-31",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Service",
        name: "Wedding Photography & Videography",
        description: "Cinematic wedding coverage capturing every special moment in Kraków and surrounding areas.",
        provider: { "@id": `${BASE_URL}/#organization` },
        areaServed: { "@type": "City", name: "Kraków" },
        serviceType: "Wedding Photography",
        offers: {
          "@type": "Offer",
          price: "2999",
          priceCurrency: "PLN",
          priceValidUntil: "2026-12-31",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 4,
      item: {
        "@type": "Service",
        name: "Portrait Photography",
        description: "Professional portraits for individuals, couples, and families.",
        provider: { "@id": `${BASE_URL}/#organization` },
        areaServed: { "@type": "City", name: "Kraków" },
        serviceType: "Portrait Photography",
        offers: {
          "@type": "Offer",
          price: "599",
          priceCurrency: "PLN",
          priceValidUntil: "2026-12-31",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 5,
      item: {
        "@type": "Service",
        name: "Corporate Video Production",
        description: "Professional video content for businesses, brands, and marketing campaigns.",
        provider: { "@id": `${BASE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "Poland" },
        serviceType: "Corporate Video",
        offers: {
          "@type": "Offer",
          price: "1999",
          priceCurrency: "PLN",
          priceValidUntil: "2026-12-31",
        },
      },
    },
  ],
};

// ─── FAQPage Schema ───
export const faqSchema = {
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What services does AJ247 Studios offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AJ247 Studios offers professional photo and video production services in Kraków, Poland. Our services include sports photography and videography, concert and event coverage, wedding photography and videography, portrait sessions, and corporate video production.",
      },
    },
    {
      "@type": "Question",
      name: "How much does it cost to hire AJ247 Studios?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our pricing starts at 599 PLN for portrait sessions. Sports and event coverage starts at 1,499 PLN. Wedding packages start at 2,999 PLN. Corporate video production starts at 1,999 PLN. We offer customized packages based on your specific needs. A 30% deposit is required to confirm your booking.",
      },
    },
    {
      "@type": "Question",
      name: "Where is AJ247 Studios located?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AJ247 Studios is based in Kraków, Poland. We serve clients throughout Kraków and surrounding areas, and we also travel for events across Poland. We primarily work in the Lesser Poland region but are available for bookings nationwide.",
      },
    },
    {
      "@type": "Question",
      name: "How do I book a shoot with AJ247 Studios?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can book a shoot directly through our website at aj247studios.com/book. Select your service type, choose your preferred team member, provide event details, and submit your booking. You can also contact us via WhatsApp at +48 503 685 377 for inquiries.",
      },
    },
    {
      "@type": "Question",
      name: "What is the turnaround time for photo and video delivery?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer 48-hour priority delivery on most packages. Standard delivery is typically within 5-7 business days. Rush delivery options are available for urgent projects. All edited photos and videos are delivered digitally via a secure download link.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer both photography and videography for the same event?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we offer combined photo and video packages for events. Our team includes both photographers and videographers who can work together to capture your event from every angle. This is particularly popular for weddings and corporate events.",
      },
    },
    {
      "@type": "Question",
      name: "What equipment does AJ247 Studios use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We use professional-grade equipment including Lumix GH5, Nikon D500, Nikon D3, and Nikon D7000 cameras. We also have professional lighting and audio equipment. All gear is regularly maintained and updated to ensure the highest quality results.",
      },
    },
    {
      "@type": "Question",
      name: "Can I see examples of your previous work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can view our portfolio at aj247studios.com/portfolio. We showcase our best work across all service categories including sports, concerts, weddings, portraits, and corporate projects. Each team member also has an individual portfolio page.",
      },
    },
  ],
};

// ─── HowTo Schema (Booking Process) ───
export const howToBookSchema = {
  "@type": "HowTo",
  name: "How to Book a Photo or Video Shoot with AJ247 Studios",
  description: "Step-by-step guide to booking professional photo and video services with AJ247 Studios in Kraków.",
  totalTime: "PT5M",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "PLN",
    value: "599-5599",
  },
  supply: [
    {
      "@type": "HowToSupply",
      name: "Event date and location",
    },
    {
      "@type": "HowToSupply",
      name: "Type of service needed",
    },
  ],
  tool: [
    {
      "@type": "HowToTool",
      name: "Internet connection",
    },
    {
      "@type": "HowToTool",
      name: "WhatsApp (optional)",
    },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Choose Your Service",
      text: "Select the type of photo or video service you need. We offer sports coverage, event photography, wedding packages, portrait sessions, and corporate video production.",
      url: `${BASE_URL}/book`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Select Your Team Member",
      text: "Choose your preferred photographer or videographer from our team. Each member has their own specialty and portfolio.",
      url: `${BASE_URL}/book`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Provide Event Details",
      text: "Enter your event date, location, and any special requirements or notes for the shoot.",
      url: `${BASE_URL}/book`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Review and Submit",
      text: "Review your booking details and submit. You'll receive a confirmation with next steps.",
      url: `${BASE_URL}/book`,
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Pay Deposit",
      text: "Pay the 30% deposit to confirm your booking. The remaining balance is due before or on the event date.",
      url: `${BASE_URL}/book`,
    },
  ],
};

// ─── Person Schema (Team Members) ───
export function getPersonSchema(member: {
  name: string;
  role: string;
  bio: string;
  image: string;
  url: string;
}) {
  return {
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    image: `${BASE_URL}${member.image}`,
    url: `${BASE_URL}${member.url}`,
    worksFor: { "@id": `${BASE_URL}/#organization` },
  };
}

// ─── Review Schema ───
export const reviewSchema = {
  "@type": "Review",
  itemReviewed: { "@id": `${BASE_URL}/#organization` },
  author: {
    "@type": "Person",
    name: "Happy Client",
  },
  reviewRating: {
    "@type": "Rating",
    ratingValue: "5",
    bestRating: "5",
  },
  reviewBody:
    "AJ247 Studios delivered incredible photos for our wedding. The team was professional, creative, and captured every special moment. Highly recommend!",
};

// ─── VideoObject Schema (Hero Video) ───
export const heroVideoSchema = {
  "@type": "VideoObject",
  name: "AJ247 Studios Showreel",
  description: "Showreel of photo and video production work by AJ247 Studios in Kraków, Poland.",
  thumbnailUrl: `${BASE_URL}/og-image.jpg`,
  uploadDate: "2024-01-01",
  contentUrl: `${BASE_URL}/portfolio/AJ_001.mp4`,
  embedUrl: `${BASE_URL}`,
  author: { "@id": `${BASE_URL}/#organization` },
};
