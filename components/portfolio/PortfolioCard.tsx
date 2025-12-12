"use client";

import Image from "next/image";
import { Project } from "@/lib/types/portfolio";

interface PortfolioCardProps {
  /** Project data */
  project: Project;
  /** Click handler to open lightbox */
  onClick: () => void;
  /** Book CTA click handler */
  onBookClick?: () => void;
  /** Priority loading for above-fold images */
  priority?: boolean;
  /** Card size variant */
  size?: "default" | "large" | "small";
}

/**
 * PortfolioCard Component
 * 
 * Thumbnail + hover overlay + quick meta + CTA.
 * Fast hover affordances reveal quick info without slow animations.
 * Follows UX research: visual-first, minimal friction.
 */
export default function PortfolioCard({
  project,
  onClick,
  onBookClick,
  priority = false,
  size = "default",
}: PortfolioCardProps) {
  const aspectRatio = size === "large" ? "aspect-[4/5]" : size === "small" ? "aspect-square" : "aspect-[4/3]";

  return (
    <article
      className="group relative cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View ${project.title} project`}
    >
      {/* Image Container */}
      <div className={`relative ${aspectRatio} rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800`}>
        <Image
          src={project.heroMedia.thumbnailUrl}
          alt={project.heroMedia.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          placeholder={project.heroMedia.blurDataUrl ? "blur" : undefined}
          blurDataURL={project.heroMedia.blurDataUrl}
        />

        {/* Gradient Overlay - always visible on mobile, hover on desktop */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />

        {/* Video indicator */}
        {project.heroMedia.type === "video" && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/70 backdrop-blur-sm rounded-full">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-xs text-white font-medium">
              {project.heroMedia.duration ? `${Math.floor(project.heroMedia.duration / 60)}:${(project.heroMedia.duration % 60).toString().padStart(2, '0')}` : "Video"}
            </span>
          </div>
        )}

        {/* Category badge - top left */}
        <div className="absolute top-3 left-3 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
          <span className="px-2.5 py-1 text-xs font-medium text-white bg-blue-600/90 backdrop-blur-sm rounded-full capitalize">
            {project.categories[0]}
          </span>
        </div>

        {/* Hover Content - Bottom */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 transition-transform duration-300">
          {/* Title & Client */}
          <h3 className="text-base font-semibold text-white mb-0.5 line-clamp-1">
            {project.title}
          </h3>
          <p className="text-sm text-white/70 mb-2">
            {project.client} · {project.year}
          </p>

          {/* Short description - desktop hover only */}
          <p className="hidden sm:block text-sm text-white/80 line-clamp-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
            {project.shortDescription}
          </p>

          {/* Quick Actions - desktop hover only */}
          <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-white/90">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </span>
            <span className="text-white/40">·</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookClick?.();
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-white/90 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Similar
            </button>
          </div>
        </div>

        {/* Client Logo (if available, subtle bottom-right) */}
        {project.clientLogo && (
          <div className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg p-1 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
            <Image
              src={project.clientLogo}
              alt={project.client}
              fill
              className="object-contain p-0.5"
            />
          </div>
        )}

        {/* Metrics badge (if has impressions) */}
        {project.metrics?.impressions && (
          <div className="absolute top-3 right-3 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {project.heroMedia.type !== "video" && (
              <span className="px-2.5 py-1 text-xs font-medium text-white bg-emerald-600/90 backdrop-blur-sm rounded-full">
                {project.metrics.impressions >= 1000000 
                  ? `${(project.metrics.impressions / 1000000).toFixed(1)}M reach`
                  : `${Math.round(project.metrics.impressions / 1000)}K reach`
                }
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mobile-only: Always visible title below image */}
      <div className="sm:hidden mt-2">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
          {project.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {project.client}
        </p>
      </div>
    </article>
  );
}
