import Link from "next/link";

export interface PricingFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  priceNote?: string;
  features: PricingFeature[];
  popular?: boolean;
  ctaText?: string;
  ctaHref?: string;
}

export default function PricingCard({
  name,
  description,
  price,
  priceNote,
  features,
  popular = false,
  ctaText = "Get a Quote",
  ctaHref = "/contact",
}: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col h-full rounded-2xl p-6 sm:p-8 border transition-all duration-300 ${
        popular
          ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white shadow-2xl shadow-slate-900/20 dark:shadow-white/20 scale-[1.02]"
          : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      }`}
    >
      {/* Popular badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-linear-to-r from-blue-600 to-emerald-500 text-white shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3
          className={`text-xl font-semibold mb-2 ${
            popular ? "text-white dark:text-slate-900" : "text-slate-900 dark:text-white"
          }`}
        >
          {name}
        </h3>
        <p
          className={`text-sm ${
            popular ? "text-slate-300 dark:text-slate-600" : "text-slate-600 dark:text-slate-400"
          }`}
        >
          {description}
        </p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-4xl font-bold ${
              popular ? "text-white dark:text-slate-900" : "text-slate-900 dark:text-white"
            }`}
          >
            {price}
          </span>
          <span
            className={`text-lg ${
              popular ? "text-slate-300 dark:text-slate-600" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            PLN
          </span>
        </div>
        {priceNote && (
          <p
            className={`text-sm mt-1 ${
              popular ? "text-slate-400 dark:text-slate-500" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {priceNote}
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 grow">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            {feature.included ? (
              <svg
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  popular ? "text-emerald-400" : "text-emerald-500"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  popular ? "text-slate-600 dark:text-slate-400" : "text-slate-300 dark:text-slate-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span
              className={`text-sm ${
                feature.included
                  ? popular
                    ? "text-slate-200 dark:text-slate-700"
                    : "text-slate-700 dark:text-slate-300"
                  : popular
                  ? "text-slate-500 dark:text-slate-400 line-through"
                  : "text-slate-400 dark:text-slate-500 line-through"
              } ${feature.highlight ? "font-semibold" : ""}`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={ctaHref}
        className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-200 ${
          popular
            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
        }`}
      >
        {ctaText}
      </Link>
    </div>
  );
}
