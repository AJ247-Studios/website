import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | AJ247 Studios",
  description: "Frequently asked questions about AJ247 Studios photo and video services. Learn about pricing, delivery, booking, and what to expect.",
};

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
        a: "No hidden fees, ever. The price we quote is the price you pay. Additional services (like rush delivery) are clearly listed as optional add-ons with upfront pricing.",
      },
      {
        q: "Do you require a deposit?",
        a: "Yes, we require a 30% deposit to secure your booking date. The remaining balance is due on the day of the event or upon delivery, depending on the service.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept bank transfers (preferred), credit/debit cards, and PayPal. For corporate clients, we can also arrange invoicing with NET 14 or NET 30 terms.",
      },
      {
        q: "Can I customize a package?",
        a: "Absolutely! We specialize in custom packages. Tell us what you need — hours of coverage, number of photos, video length, add-ons — and we'll create a tailored quote.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery & Turnaround",
    faqs: [
      {
        q: "How quickly will I receive my photos/videos?",
        a: "Standard delivery times vary by package: Photo sessions (3-5 days), Events (5-7 days), Weddings (7-14 days). Premium packages include faster delivery, and we offer 48-hour priority delivery as an add-on.",
      },
      {
        q: "How are photos delivered?",
        a: "All photos are delivered via a private online gallery where you can view, download, and share them. Premium packages also include a USB drive with high-resolution files.",
      },
      {
        q: "What format are the photos in?",
        a: "You'll receive high-resolution JPEG files optimized for both print and digital use. RAW files are available upon request for an additional fee.",
      },
      {
        q: "Can I request additional edits?",
        a: "Yes! Each package includes a set number of edited photos. Additional retouching or edits can be purchased at 15-25 PLN per photo, depending on complexity.",
      },
      {
        q: "Do you offer same-day delivery?",
        a: "For events and weddings, we can deliver a small selection of edited photos same-day (great for social media). Full delivery follows standard timelines.",
      },
    ],
  },
  {
    id: "booking",
    title: "Booking & Scheduling",
    faqs: [
      {
        q: "How far in advance should I book?",
        a: "We recommend booking 2-4 weeks in advance for most events. For weddings and large events, 2-3 months is ideal. However, we do accommodate last-minute bookings when available.",
      },
      {
        q: "What happens after I submit a quote request?",
        a: "We'll respond within 2 hours during business hours with a personalized quote. After you approve, we'll send a contract and invoice for the deposit. Once paid, your date is secured.",
      },
      {
        q: "Can I reschedule my booking?",
        a: "Yes, you can reschedule up to 14 days before the event at no charge. Rescheduling within 14 days may incur a small fee depending on availability.",
      },
      {
        q: "What's your cancellation policy?",
        a: "Cancellations 30+ days out receive a full refund. 14-30 days: 50% refund. Under 14 days: deposit is non-refundable but can be applied to a future booking within 6 months.",
      },
      {
        q: "Do you travel outside Kraków?",
        a: "Yes! We cover all of Poland and travel internationally. Travel fees apply for locations outside Kraków city limits — typically 1.50 PLN/km or negotiated flat rate for distant locations.",
      },
    ],
  },
  {
    id: "services",
    title: "Services & Coverage",
    faqs: [
      {
        q: "What types of events do you cover?",
        a: "We specialize in sports events, concerts/festivals, weddings, corporate events, and portrait sessions. We've also covered product launches, conferences, private parties, and more.",
      },
      {
        q: "Do you offer both photo and video?",
        a: "Yes! We offer photo-only, video-only, and combined packages. Our Premium packages typically include both for the best value.",
      },
      {
        q: "What's included in 'edited photos'?",
        a: "All photos receive professional color correction, exposure adjustment, cropping, and light retouching. Premium packages include more advanced skin retouching and creative edits.",
      },
      // Drone coverage FAQ temporarily removed
      // {
      //   q: "Do you provide drone coverage?",
      //   a: "Yes, drone photography and videography is available as an add-on (500-1,500 PLN) or included in Premium packages. We're fully licensed and insured for commercial drone operation.",
      // },
      {
        q: "Can I request specific shots or styles?",
        a: "Absolutely! We encourage you to share Pinterest boards, reference photos, or specific shot lists. We'll work together to achieve your vision.",
      },
    ],
  },
  {
    id: "technical",
    title: "Technical & Equipment",
    faqs: [
      {
        q: "What equipment do you use?",
        a: "We use professional-grade Sony and Canon mirrorless cameras, cinema lenses, Profoto lighting, and stabilized gimbals. All equipment is maintained and backed up.",
      },
      {
        q: "Do you bring backup equipment?",
        a: "Always. For every event, we bring duplicate camera bodies, memory cards, batteries, and lighting. Equipment failure will never ruin your photos.",
      },
      {
        q: "How do you handle low-light situations?",
        a: "Our cameras excel in low light, and we bring professional lighting when needed. Concert and club photography is one of our specialties — we're experienced in challenging conditions.",
      },
      {
        q: "Do you have insurance?",
        a: "Yes, we carry full professional liability insurance and equipment insurance. We can provide certificates of insurance for venue requirements upon request.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main>
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
