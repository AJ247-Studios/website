"use client";

import Image from "next/image";
import Link from "next/link";
import { Project } from "@/lib/types/portfolio";

interface FeaturedCaseStudiesProps {
  /** Featured projects to display (1-3 recommended) */
  projects: Project[];
  /** Analytics callback */
  onProjectClick?: (projectId: string) => void;
  /** CTA callback */
  onCtaClick?: (projectId: string) => void;
}

/**
 * FeaturedCaseStudies Component
 * 
 * Displays 1-3 rotating mini case studies with metrics + CTA.
 * Shows outcomes, not just pretty pictures. Builds trust through results.
 */
export default function FeaturedCaseStudies({
  projects,
  onProjectClick,
  onCtaClick,
}: FeaturedCaseStudiesProps) {
  if (!projects.length) return null;

  // Format large numbers (1000000 -> 1M, 150000 -> 150K)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${Math.round(num / 1000)}K`;
    return num.toString();
  };

  return (
    <section id="featured" className="py-16 sm:py-20 bg-white dark:bg-slate-950 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-full mb-4">
            Featured Work
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Case Studies That Prove Results
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Real projects, real outcomes. See how we helped clients achieve their goals.
          </p>
        </div>

        {/* Case Study Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {projects.slice(0, 3).map((project) => (
            <article
              key={project.id}
              className="group relative bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={project.heroMedia.thumbnailUrl}
                  alt={project.heroMedia.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  placeholder={project.heroMedia.blurDataUrl ? "blur" : undefined}
                  blurDataURL={project.heroMedia.blurDataUrl}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent" />
                
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-medium text-white bg-slate-900/70 backdrop-blur-sm rounded-full capitalize">
                    {project.categories[0]}
                  </span>
                </div>

                {/* Client logo (if available) */}
                {project.clientLogo && (
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white rounded-lg p-1.5">
                    <Image
                      src={project.clientLogo}
                      alt={project.client}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}

                {/* Video indicator */}
                {project.heroMedia.type === "video" && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-slate-900/70 backdrop-blur-sm rounded-full">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="text-xs text-white font-medium">Video</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title & Client */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {project.client} · {project.year}
                  </p>
                </div>

                {/* Metrics Row */}
                {project.metrics && (
                  <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    {project.metrics.impressions && (
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {formatNumber(project.metrics.impressions)}+
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Impressions</p>
                      </div>
                    )}
                    {project.metrics.deliverables && (
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {project.metrics.deliverables.split(",")[0]}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Delivered</p>
                      </div>
                    )}
                    {project.metrics.timeline && (
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {project.metrics.timeline}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Timeline</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Testimonial Quote (condensed) */}
                {project.testimonial && (
                  <blockquote className="mb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic line-clamp-2">
                      &ldquo;{project.testimonial.quote}&rdquo;
                    </p>
                    <cite className="text-xs text-slate-500 dark:text-slate-500 not-italic mt-1 block">
                      — {project.testimonial.author}
                    </cite>
                  </blockquote>
                )}

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onProjectClick?.(project.id)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                  >
                    View Project
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <Link
                    href={`/contact?project=${project.slug}`}
                    onClick={() => onCtaClick?.(project.id)}
                    className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Book Similar →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <a
            href="#portfolio"
            className="inline-flex items-center gap-2 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span>See all {projects.length > 3 ? "projects" : "our work"}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
