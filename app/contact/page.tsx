import { Metadata } from "next";
import Script from "next/script";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact Us | AJ247 Studios",
  description: "Get in touch for professional photo and video production in Kraków. WhatsApp available for instant response.",
  openGraph: {
    title: "Contact Us | AJ247 Studios",
    description: "Professional photo & video production in Kraków. Contact us via WhatsApp or email.",
    url: "https://aj247studios.com/contact",
  },
};

// JSON-LD for ContactPoint (improves local SEO)
const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  mainEntity: {
    "@type": "Organization",
    name: "AJ247 Studios",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+48-503-685-377",
        contactType: "bookings",
        availableLanguage: ["English", "Polish"],
        areaServed: "PL",
      },
      {
        "@type": "ContactPoint",
        telephone: "+48-503-685-377",
        contactType: "customer service",
        contactOption: "TollFree",
        availableLanguage: ["English", "Polish"],
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <Script
        id="contact-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <ContactPageClient />
    </>
  );
}
