import { Metadata } from "next";
import Link from "next/link";
import PricingTable, { FeatureComparison } from "@/components/PricingTable";
import AddOnsSection from "@/components/AddOnsSection";

export const metadata: Metadata = {
  title: "Services & Pricing | AJ247 Studios",
  description: "Premium photo and video production packages for sports, concerts, weddings, and corporate events in Kraków. Transparent pricing with Standard and Premium options.",
};

// ============================================================================
// PRICING DATA - Based on Kraków market research
// ============================================================================

const sportsPackages = [
  {
    name: "Standard",
    description: "Essential coverage for local sports events and games",
    price: "1,500",
    priceNote: "Starting price • 3-4 hours",
    features: [
      { text: "3-4 hours of coverage", included: true },
      { text: "150+ edited photos", included: true },
      { text: "Online gallery delivery", included: true },
      { text: "1-2 min highlight reel", included: true },
      { text: "5 business day delivery", included: true },
      { text: "Second photographer", included: false },
      { text: "Drone coverage", included: false },
      { text: "Social media cuts", included: false },
    ],
  },
  {
    name: "Premium",
    description: "Comprehensive coverage with cinematic highlights",
    price: "3,500",
    priceNote: "Starting price • 5+ hours",
    popular: true,
    features: [
      { text: "5+ hours of coverage", included: true, highlight: true },
      { text: "400+ edited photos", included: true, highlight: true },
      { text: "Online gallery + USB drive", included: true },
      { text: "5-min highlight film", included: true, highlight: true },
      { text: "48-hour priority delivery", included: true },
      { text: "Second photographer", included: true },
      { text: "Drone coverage included", included: true },
      { text: "3 social media cuts", included: true },
    ],
  },
];

const sportsComparison = [
  { name: "Coverage duration", standard: "3-4 hours", premium: "5+ hours" },
  { name: "Edited photos", standard: "150+", premium: "400+" },
  { name: "Highlight video", standard: "1-2 min", premium: "5 min cinematic" },
  { name: "Delivery time", standard: "5 business days", premium: "48 hours" },
  { name: "Second photographer", standard: false, premium: true },
  { name: "Drone coverage", standard: false, premium: true },
  { name: "Social media cuts", standard: false, premium: "3 included" },
  { name: "USB drive delivery", standard: false, premium: true },
];

const concertPackages = [
  {
    name: "Standard",
    description: "Professional coverage for concerts and live events",
    price: "2,000",
    priceNote: "Starting price • 4 hours",
    features: [
      { text: "4 hours of coverage", included: true },
      { text: "250+ edited photos", included: true },
      { text: "Online gallery delivery", included: true },
      { text: "2-min highlight reel", included: true },
      { text: "7 business day delivery", included: true },
      { text: "Second photographer", included: false },
      { text: "Multi-camera video", included: false },
      { text: "Backstage access coverage", included: false },
    ],
  },
  {
    name: "Premium",
    description: "Full cinematic production for major events",
    price: "5,000",
    priceNote: "Starting price • 6+ hours",
    popular: true,
    features: [
      { text: "6+ hours of coverage", included: true, highlight: true },
      { text: "500+ edited photos", included: true, highlight: true },
      { text: "Online gallery + USB + prints", included: true },
      { text: "5-min cinematic film", included: true, highlight: true },
      { text: "48-hour priority delivery", included: true },
      { text: "Two photographers", included: true },
      { text: "Multi-camera video setup", included: true },
      { text: "Backstage & VIP coverage", included: true },
    ],
  },
];

const concertComparison = [
  { name: "Coverage duration", standard: "4 hours", premium: "6+ hours" },
  { name: "Edited photos", standard: "250+", premium: "500+" },
  { name: "Highlight video", standard: "2 min", premium: "5 min cinematic" },
  { name: "Delivery time", standard: "7 business days", premium: "48 hours" },
  { name: "Photographers", standard: "1", premium: "2" },
  { name: "Multi-camera video", standard: false, premium: true },
  { name: "Backstage coverage", standard: false, premium: true },
  { name: "Print package", standard: false, premium: true },
];

const weddingPackages = [
  {
    name: "Standard",
    description: "Beautiful coverage for intimate celebrations",
    price: "3,500",
    priceNote: "Starting price • 6 hours",
    features: [
      { text: "6 hours of coverage", included: true },
      { text: "350+ edited photos", included: true },
      { text: "Online gallery delivery", included: true },
      { text: "3-min highlight film", included: true },
      { text: "14 business day delivery", included: true },
      { text: "Second photographer", included: false },
      { text: "Drone coverage", included: false },
      { text: "Same-day edit teaser", included: false },
    ],
  },
  {
    name: "Premium",
    description: "Complete cinematic wedding experience",
    price: "5,600",
    priceNote: "Full day coverage",
    popular: true,
    features: [
      { text: "Full day coverage (10+ hrs)", included: true, highlight: true },
      { text: "750+ edited photos", included: true, highlight: true },
      { text: "Online gallery + USB + album", included: true },
      { text: "10-min cinematic film", included: true, highlight: true },
      { text: "7 business day delivery", included: true },
      { text: "Second photographer included", included: true },
      { text: "Drone coverage included", included: true },
      { text: "Same-day edit for reception", included: true },
    ],
  },
];

const weddingComparison = [
  { name: "Coverage duration", standard: "6 hours", premium: "Full day (10+ hrs)" },
  { name: "Edited photos", standard: "350+", premium: "750+" },
  { name: "Wedding film", standard: "3 min highlight", premium: "10 min cinematic" },
  { name: "Delivery time", standard: "14 business days", premium: "7 business days" },
  { name: "Second photographer", standard: false, premium: true },
  { name: "Drone coverage", standard: false, premium: true },
  { name: "Same-day edit", standard: false, premium: true },
  { name: "Premium album", standard: false, premium: true },
];

const portraitPackages = [
  {
    name: "Mini Session",
    description: "Quick professional headshots",
    price: "450",
    priceNote: "1 hour session",
    features: [
      { text: "1 hour session", included: true },
      { text: "10 edited photos", included: true },
      { text: "Online gallery delivery", included: true },
      { text: "1 outfit/look", included: true },
      { text: "5 business day delivery", included: true },
      { text: "Professional makeup", included: false },
      { text: "Location of choice", included: false },
      { text: "Print package", included: false },
    ],
  },
  {
    name: "Standard",
    description: "Comprehensive portrait session",
    price: "650",
    priceNote: "1.5 hour session",
    features: [
      { text: "1.5 hour session", included: true },
      { text: "20 edited photos", included: true },
      { text: "Online gallery delivery", included: true },
      { text: "2-3 outfits/looks", included: true },
      { text: "3 business day delivery", included: true },
      { text: "Professional makeup", included: false },
      { text: "Location of choice", included: true },
      { text: "Print package", included: false },
    ],
  },
  {
    name: "Premium",
    description: "VIP treatment with full styling",
    price: "950",
    priceNote: "3 hour session",
    popular: true,
    features: [
      { text: "3 hour session", included: true, highlight: true },
      { text: "35+ edited photos", included: true, highlight: true },
      { text: "Online gallery + USB", included: true },
      { text: "Unlimited outfits/looks", included: true },
      { text: "48-hour delivery", included: true },
      { text: "Professional makeup included", included: true, highlight: true },
      { text: "Location of choice", included: true },
      { text: "5 premium prints included", included: true },
    ],
  },
];

const corporatePackages = [
  {
    name: "Half Day",
    description: "Conference or event coverage",
    price: "1,200",
    priceNote: "4 hours",
    features: [
      { text: "4 hours of coverage", included: true },
      { text: "100+ edited photos", included: true },
      { text: "Online gallery delivery", included: true },
      { text: "Corporate-ready edits", included: true },
      { text: "3 business day delivery", included: true },
      { text: "Video coverage", included: false },
      { text: "Headshot station", included: false },
      { text: "Social media cuts", included: false },
    ],
  },
  {
    name: "Full Day",
    description: "Comprehensive corporate coverage",
    price: "2,200",
    priceNote: "8 hours",
    features: [
      { text: "8 hours of coverage", included: true },
      { text: "250+ edited photos", included: true },
      { text: "Online gallery + USB", included: true },
      { text: "Corporate-ready edits", included: true },
      { text: "Next business day delivery", included: true },
      { text: "2-min highlight video", included: true },
      { text: "Headshot station", included: false },
      { text: "Social media cuts", included: false },
    ],
  },
  {
    name: "Premium",
    description: "Full photo + video production",
    price: "4,500",
    priceNote: "Full day + video",
    popular: true,
    features: [
      { text: "Full day coverage", included: true, highlight: true },
      { text: "400+ edited photos", included: true, highlight: true },
      { text: "Online gallery + USB + prints", included: true },
      { text: "5-min highlight film", included: true, highlight: true },
      { text: "Same-day photo delivery", included: true },
      { text: "Multi-camera video", included: true },
      { text: "Headshot station included", included: true },
      { text: "5 social media cuts", included: true },
    ],
  },
];

export default function ServicesPage() {
  return (
    <main>
      {/* Hero section */}
      <section className="relative py-20 sm:py-28 bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Services & Pricing
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8">
              Transparent pricing for premium photo and video production. 
              Choose a package or build your own — all prices are in Polish złoty (PLN).
            </p>
            
            {/* Quick nav */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {[
                { label: "Sports", href: "#sports" },
                { label: "Concerts", href: "#concerts" },
                { label: "Weddings", href: "#weddings" },
                { label: "Portraits", href: "#portraits" },
                { label: "Corporate", href: "#corporate" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <section className="py-20 sm:py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingTable
            id="sports"
            title="Sports Coverage"
            description="Dynamic action shots and highlight reels that capture every winning moment. Perfect for teams, leagues, and individual athletes."
            packages={sportsPackages}
          />
          <FeatureComparison features={sportsComparison} />
        </div>
      </section>

      {/* Concerts Section */}
      <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingTable
            id="concerts"
            title="Concert & Event Coverage"
            description="Immersive concert photography and cinematic video that brings the energy to life. From intimate shows to festival stages."
            packages={concertPackages}
          />
          <FeatureComparison features={concertComparison} />
        </div>
      </section>

      {/* Weddings Section */}
      <section className="py-20 sm:py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingTable
            id="weddings"
            title="Wedding Coverage"
            description="Timeless wedding photography and films that tell your love story beautifully. Every moment preserved with cinematic elegance."
            packages={weddingPackages}
          />
          <FeatureComparison features={weddingComparison} />
        </div>
      </section>

      {/* Portraits Section */}
      <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingTable
            id="portraits"
            title="Photo Sessions"
            description="Professional portraits for personal branding, headshots, and creative projects. Studio or on-location options available."
            packages={portraitPackages}
          />
        </div>
      </section>

      {/* Corporate Section */}
      <section className="py-20 sm:py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingTable
            id="corporate"
            title="Corporate Events"
            description="Professional coverage for conferences, product launches, and corporate gatherings. Brand-aligned content delivered fast."
            packages={corporatePackages}
          />
        </div>
      </section>

      {/* Add-Ons Section */}
      <AddOnsSection />

      {/* Final CTA */}
      <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-12 lg:p-16 text-center">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Not Sure Which Package?
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Tell us about your project and we&apos;ll recommend the perfect solution. 
                Free consultation, no commitment required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 bg-white rounded-xl hover:bg-slate-100 transition-all duration-200"
                >
                  Get a Free Quote
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <a
                  href="tel:+48123456789"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-200"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Common Questions
            </h2>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: "What's included in 'edited photos'?",
                a: "All photos receive professional color correction, exposure adjustment, and light retouching. Premium packages include advanced skin retouching and creative edits.",
              },
              {
                q: "Can I mix services from different packages?",
                a: "Absolutely! We specialize in custom packages. Tell us what you need and we'll create a tailored quote with the best value.",
              },
              {
                q: "How quickly can I get my photos/videos?",
                a: "Standard delivery is 5-14 business days depending on the package. Priority delivery (48 hours) is available as an add-on or included in Premium packages.",
              },
              {
                q: "Do you travel outside Kraków?",
                a: "Yes! We cover all of Poland and travel internationally. Travel fees apply for locations outside Kraków city limits.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {faq.q}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
