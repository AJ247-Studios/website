"use client";

import { useState } from "react";
import PricingCard, { PricingCardProps } from "./PricingCard";

interface PricingTableProps {
  title: string;
  description: string;
  packages: PricingCardProps[];
  id?: string;
}

export default function PricingTable({ title, description, packages, id }: PricingTableProps) {
  return (
    <section id={id} className="scroll-mt-24">
      {/* Section header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
          {title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>

      {/* Pricing cards */}
      <div className={`grid gap-6 lg:gap-8 ${
        packages.length === 2 
          ? "md:grid-cols-2 max-w-4xl mx-auto" 
          : packages.length === 3 
          ? "md:grid-cols-3" 
          : "md:grid-cols-2 lg:grid-cols-4"
      }`}>
        {packages.map((pkg, idx) => (
          <PricingCard key={idx} {...pkg} />
        ))}
      </div>
    </section>
  );
}

// Feature comparison table component
interface ComparisonFeature {
  name: string;
  standard: string | boolean;
  premium: string | boolean;
  tooltip?: string;
}

interface FeatureComparisonProps {
  features: ComparisonFeature[];
  standardLabel?: string;
  premiumLabel?: string;
}

export function FeatureComparison({ 
  features, 
  standardLabel = "Standard", 
  premiumLabel = "Premium" 
}: FeatureComparisonProps) {
  return (
    <div className="mt-12 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50">
            <th className="py-4 px-6 text-left text-sm font-semibold text-slate-900 dark:text-white">
              Feature
            </th>
            <th className="py-4 px-6 text-center text-sm font-semibold text-slate-900 dark:text-white">
              {standardLabel}
            </th>
            <th className="py-4 px-6 text-center text-sm font-semibold text-slate-900 dark:text-white bg-blue-50 dark:bg-blue-900/20">
              {premiumLabel}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {features.map((feature, idx) => (
            <tr key={idx} className="bg-white dark:bg-slate-800/30">
              <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300">
                {feature.name}
              </td>
              <td className="py-4 px-6 text-center">
                {typeof feature.standard === "boolean" ? (
                  feature.standard ? (
                    <svg className="w-5 h-5 mx-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mx-auto text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )
                ) : (
                  <span className="text-sm text-slate-600 dark:text-slate-400">{feature.standard}</span>
                )}
              </td>
              <td className="py-4 px-6 text-center bg-blue-50/50 dark:bg-blue-900/10">
                {typeof feature.premium === "boolean" ? (
                  feature.premium ? (
                    <svg className="w-5 h-5 mx-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mx-auto text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )
                ) : (
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{feature.premium}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
