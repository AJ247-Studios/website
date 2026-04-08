import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | AJ247 Studios",
  description: "Frequently asked questions about AJ247 Studios photo and video services. Learn about pricing, delivery, booking, and what to expect.",
};

// FAQ data for both display and JSON-LD schema
const faqCategories = [
  {
    id: "pricing",
    title: "Pricing & Packages",
    faqs: [
      {
        q: "How does your pricing work?",
        a: "We offer transparent, package-based pricing for all our services. Each package includes a set number of hours, edited photos/videos, and delivery options. You can view our full pricing on the Services page, or contact us for a custom quote.",
      },
      {
        q: "Are there any hidden fees?",
        a: "No hidden fees. Rush delivery and major revision requests are the only situations where additional costs may apply — and we'll always communicate these upfront before proceeding.",
      },
      {
        q: "Do you require a deposit?",
        a: "Yes, we require a 30% non-refundable deposit to secure your booking date. The remaining balance is due on the day of the event. Once the deposit is paid, your date is locked in.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept bank transfers (preferred). For corporate clients, alternative arrangements can be discussed — contact us to talk through options.",
      },
      {
        q: "Can I customize a package?",
        a: "Absolutely. We specialize in custom packages. Tell us what you need — hours of coverage, number of photos, video length, add-ons — and we'll create a tailored quote.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery & Turnaround",
    faqs: [
      {
        q: "How quickly will I receive my photos/videos?",
        a: "Delivery times vary by service. Photo sessions: 3–5 business days. Events and corporate shoots: 14–16 business days. Weddings: 14–16 business days. Rush delivery is available on request — contact us before booking to discuss availability and pricing.",
      },
      {
        q: "How are photos delivered?",
        a: "All photos are delivered via a private online gallery where you can view, download, and share them. Premium packages also include a USB drive with all high-resolution files.",
      },
      {
        q: "What format are the photos in?",
        a: "You'll receive high-resolution JPEG files optimized for both print and digital use.",
      },
      {
        q: "Can I request additional edits?",
        a: "Yes. Each package includes a set number of edited photos. Additional retouching can be purchased at 10–25 PLN per photo depending on complexity.",
      },
      {
        q: "Do you offer same-day delivery?",
        a: "Same-day delivery is not standard. For urgent turnaround requests, contact us before booking and we'll do our best to accommodate depending on availability and a rush fee agreed in advance.",
      },
    ],
  },
  {
    id: "booking",
    title: "Booking & Scheduling",
    faqs: [
      {
        q: "How far in advance should I book?",
        a: "We recommend booking 2–4 weeks in advance for most events. For weddings and large events, 2–3 months is ideal — especially during peak wedding season (May–September), which fills up fast. We do accommodate last-minute bookings when available.",
      },
      {
        q: "What happens after I submit a quote request?",
        a: "We'll respond within 24 hours with a personalized quote. After you approve, we'll send a contract and deposit invoice. Once the deposit is paid, your date is secured.",
      },
      {
        q: "Can I reschedule my booking?",
        a: "Yes. You can reschedule up to 14 days before the event at no charge. Rescheduling within 14 days may incur a fee depending on availability.",
      },
      {
        q: "What's your cancellation policy?",
        a: "Cancellations 30+ days before the event: full refund of deposit. 14–30 days: 50% refund. Under 14 days: deposit is non-refundable. At our discretion, the deposit value may be applied toward a future booking within 6 months.",
      },
      {
        q: "Do you travel outside Kraków?",
        a: "Yes — we cover all of Poland and travel internationally. Travel fees apply for locations outside Kraków city limits, typically 1.50 PLN/km or a negotiated flat rate for distant locations.",
      },
    ],
  },
  {
    id: "services",
    title: "Services & Coverage",
    faqs: [
      {
        q: "What types of events do you cover?",
        a: "We specialize in sports events, concerts and festivals, weddings, corporate events, and portrait sessions. We've also covered product launches, private parties, and more. If you're unsure, just ask.",
      },
      {
        q: "Do you offer both photo and video?",
        a: "Yes. We offer photo-only, video-only, and combined packages. Our Premium packages typically include both for the best value.",
      },
      {
        q: "What's included in 'edited photos'?",
        a: "All photos receive professional color correction, exposure adjustment, cropping, and light retouching. Premium packages include more advanced skin retouching and creative edits.",
      },
      {
        q: "Can I request specific shots or styles?",
        a: "Absolutely. We encourage you to share Pinterest boards, reference photos, or specific shot lists before the event. We'll work together to achieve your vision.",
      },
      {
        q: "What is your revision policy for videos?",
        a: "Each video project includes one free round of minor revisions. Minor revisions include: text changes, pacing adjustments, clip swaps, and color grade tweaks. Major revisions — such as a full re-edit or music change — are billed separately and agreed upon before work begins.",
      },
    ],
  },
  {
    id: "technical",
    title: "Technical & Equipment",
    faqs: [
      {
        q: "What equipment do you use?",
        a: "We shoot on professional mirrorless cameras including the Panasonic Lumix GH5, paired with cinema lenses, professional lighting, and stabilized gimbals. All equipment is regularly maintained and backed up on-site.",
      },
      {
        q: "Do you bring backup equipment?",
        a: "Always. For every event we bring duplicate memory cards, batteries, and lighting. Equipment failure will never compromise your coverage.",
      },
      {
        q: "How do you handle low-light situations?",
        a: "Our cameras perform well in low light, and we bring professional lighting when needed. Concert and event photography in challenging conditions is something we're experienced in.",
      },
    ],
  },
];

// Generate JSON-LD structured data for FAQ rich snippets in Google
function generateFaqSchema() {
  const allFaqs = faqCategories.flatMap(category => category.faqs);
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };
}

export default function FAQPage() {
  const faqSchema = generateFaqSchema();
  
  return (
    <main>
      {/* JSON-LD Schema for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* Hero */}
      <section className="py-16 sm:py-20 bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Everything you need to know about working with AJ247 Studios. 
              Can&apos;t find your answer? <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact us</Link>.
            </p>
            
            {/* Quick nav */}
            <div className="flex flex-wrap justify-center gap-2">
              {faqCategories.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  {category.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-12 sm:py-16 bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {faqCategories.map((category) => (
              <div key={category.id} id={category.id} className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                  {category.title}
                </h2>
                <div className="space-y-4">
                  {category.faqs.map((faq, idx) => (
                    <details
                      key={idx}
                      className="group bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                      <summary className="flex items-center justify-between cursor-pointer p-5 text-left font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                        <span className="pr-4">{faq.q}</span>
                        <svg
                          className="w-5 h-5 shrink-0 text-slate-500 group-open:rotate-180 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="px-5 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              We&apos;re here to help. Reach out and we&apos;ll get back to you within 2 hours during business hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Contact Us
              </Link>
              <a
                href="tel:+48503685377"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
