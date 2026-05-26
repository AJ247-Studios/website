import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "2026 Pricing Guide | AJ247 Studios",
  description: "Complete 2026 pricing for sports, concert, wedding, portrait, and corporate photo & video packages in Kraków. Transparent rates, no hidden fees.",
  robots: "noindex, follow", // Keep it exclusive to subscribers but allow link sharing
};

const packages = [
  {
    category: "Portrait Photography",
    items: [
      { name: "Mini Session", detail: "1 hour • 10 edited photos", price: "450 PLN" },
      { name: "Standard Session", detail: "1.5 hours • 20 edited photos", price: "649 PLN" },
      { name: "Premium Session", detail: "3 hours • 35+ edited photos + styling consult", price: "949 PLN" },
    ],
  },
  {
    category: "Sports & Events",
    items: [
      { name: "Customized", detail: "3–4 hours • 80–100+ photos • 1–2 min highlight", price: "1,499 PLN" },
      { name: "Premium", detail: "5+ hours • 150–200+ photos • 5-min film • second shooter", price: "3,499 PLN" },
    ],
  },
  {
    category: "Concert & Live Events",
    items: [
      { name: "Customized", detail: "4 hours • 100–150+ photos • 2-min highlight", price: "1,999 PLN" },
      { name: "Premium", detail: "6+ hours • 200–250+ photos • 5-min cinematic • backstage", price: "4,999 PLN" },
    ],
  },
  {
    category: "Wedding Coverage",
    items: [
      { name: "Customized", detail: "6 hours • 150–200+ photos • 4–5 min highlight film", price: "3,499 PLN" },
      { name: "Premium", detail: "Full day (10+ hrs) • 250–300+ photos • 6–8 min film • album", price: "5,599 PLN" },
    ],
  },
  {
    category: "Corporate Events",
    items: [
      { name: "Half Day", detail: "4 hours • 80–100+ photos • corporate-ready edits", price: "1,199 PLN" },
      { name: "Full Day", detail: "8 hours • 150–200+ photos • 2-min highlight video", price: "2,199 PLN" },
      { name: "Premium", detail: "Full day + video • 200–250+ photos • 5-min film • headshot station", price: "4,499 PLN" },
    ],
  },
];

const addOns = [
  { name: "Extra hour of coverage", price: "350 PLN" },
  { name: "Rush delivery (48h)", price: "500 PLN" },
  { name: "Social media cut pack (3)", price: "300 PLN" },
  { name: "USB drive delivery", price: "80 PLN" },
  { name: "Premium print package (10 prints)", price: "250 PLN" },
  { name: "Second photographer", price: "800 PLN" },
];

const tips = [
  {
    title: "Book 3–4 months ahead",
    body: "The best Kraków venues and dates fill up fast, especially May–September wedding season and autumn sports leagues. Early booking also locks in current pricing.",
  },
  {
    title: "Send a shot list 48 hours before",
    body: "Even for candid events, a short list of 'must-have' moments ensures nothing important gets missed. Group shots, key speakers, specific details — write them down.",
  },
  {
    title: "Schedule golden hour portraits",
    body: "If your event has a break, use it. 30 minutes before sunset gives the most flattering natural light, especially in Kraków's Old Town and Planty Park.",
  },
  {
    title: "Designate a family 'spotter'",
    body: "At big events, assign one person who knows both families to help gather people for group shots. This alone can save 20+ minutes of shooting time.",
  },
  {
    title: "Plan video interviews early",
    body: "If you want testimonials or messages on camera, capture them before the event energy drops. Post-ceremony or pre-event is usually when people are most composed.",
  },
];

export default function PricingGuidePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-blue-300 text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            2026 Edition
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            AJ247 Studios Pricing Guide
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Transparent pricing for photo and video production in Kraków. 
            No hidden fees. All packages include edited deliverables and online gallery.
          </p>
        </div>
      </section>

      {/* Pricing Tables */}
      <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {packages.map((section) => (
            <div key={section.category}>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-200 dark:border-slate-700">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{item.detail}</div>
                    </div>
                    <div className="mt-3 sm:mt-0 text-xl font-bold text-slate-900 dark:text-white">
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add-Ons */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-200 dark:border-slate-700">
            Add-Ons
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addOns.map((addon) => (
              <div
                key={addon.name}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <span className="text-sm text-slate-700 dark:text-slate-300">{addon.name}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{addon.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Policies */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Booking Policy</h3>
          <ul className="space-y-3 text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>30% deposit</strong> required to secure your date. Non-refundable.</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Balance due</strong> on the day of the event unless otherwise agreed.</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Delivery times:</strong> Portraits 3–5 business days. Events & weddings 14–16 business days.</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Travel:</strong> Included within Kraków city limits. Outside Kraków quoted separately.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 5 Insider Tips */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              5 Insider Tips for Better Event Photos
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Straight from our Kraków shooting experience — use these at your next event.
            </p>
          </div>

          <div className="space-y-6">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{tip.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to Book?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Dates fill up fast. Secure your event with a 30% deposit and let's create something amazing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Book Now
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Full Service Details
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
