"use client";

import { usePathname } from "next/navigation";

interface JsonLdProps {
  data: Record<string, any> | Record<string, any>[];
}

/**
 * JSON-LD Structured Data Component
 * 
 * Injects schema.org structured data as a script tag.
 * This is the #1 signal for AI bots (GPT, Claude, Perplexity, Google AI Overviews)
 * to understand your content and business.
 * 
 * Usage:
 *   <JsonLd data={localBusinessSchema} />
 */
export default function JsonLd({ data }: JsonLdProps) {
  const pathname = usePathname();
  
  // Add @context if not present
  const enrichedData = Array.isArray(data) 
    ? data.map(item => ({
        "@context": "https://schema.org",
        ...item,
      }))
    : {
        "@context": "https://schema.org",
        ...data,
      };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(enrichedData) }}
    />
  );
}
