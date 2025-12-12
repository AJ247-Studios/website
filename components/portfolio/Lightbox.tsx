"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Project, ProjectMedia } from "@/lib/types/portfolio";

interface LightboxProps {
  /** Whether lightbox is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Active project */
  project: Project | null;
  /** Current media index in gallery */
  currentIndex: number;
  /** Navigate to specific index */
  onNavigate: (index: number) => void;
  /** Book CTA click handler */
  onBookClick?: (project: Project) => void;
  /** Analytics callbacks */
  analytics?: {
    onMediaView?: (projectId: string, mediaIndex: number) => void;
    onCtaClick?: (ctaType: string, projectId: string) => void;
  };
}

/**
 * Lightbox Component
 * 
 * Photo viewer + side panel with context + 'Book this style' CTA.
 * Persisted context while viewing. Keyboard accessible with focus trap.
 * Follows UX research: seamless media experience with minimal friction.
 */
export default function Lightbox({
  isOpen,
  onClose,
  project,
  currentIndex,
  onNavigate,
  onBookClick,
  analytics,
}: LightboxProps) {
  const [showInfo, setShowInfo] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const openTimeRef = useRef<number>(0);

  // All media (hero + gallery)
  const allMedia: ProjectMedia[] = project 
    ? [project.heroMedia, ...project.gallery] 
    : [];
  
  const currentMedia = allMedia[currentIndex];
  const hasNext = currentIndex < allMedia.length - 1;
  const hasPrev = currentIndex > 0;

  // Track open time for analytics
  useEffect(() => {
    if (isOpen) {
      openTimeRef.current = Date.now();
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "Escape":
        onClose();
        break;
      case "ArrowRight":
        if (hasNext) onNavigate(currentIndex + 1);
        break;
      case "ArrowLeft":
        if (hasPrev) onNavigate(currentIndex - 1);
        break;
      case "i":
        setShowInfo(!showInfo);
        break;
    }
  }, [isOpen, hasNext, hasPrev, currentIndex, onNavigate, onClose, showInfo]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (isOpen && lightboxRef.current) {
      lightboxRef.current.focus();
    }
  }, [isOpen]);

  // Track media views
  useEffect(() => {
    if (isOpen && project && currentMedia) {
      analytics?.onMediaView?.(project.id, currentIndex);
    }
  }, [isOpen, project, currentIndex, currentMedia, analytics]);

  // Handle close with analytics
  const handleClose = () => {
    if (project && openTimeRef.current) {
      const timeSpent = Date.now() - openTimeRef.current;
      // Could track time spent here
    }
    onClose();
  };

  if (!isOpen || !project || !currentMedia) return null;

  return (
    <div
      ref={lightboxRef}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing ${project.title}`}
      tabIndex={-1}
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-linear-to-b from-slate-950/80 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={handleClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="hidden sm:block">
            <h2 className="text-white font-medium">{project.title}</h2>
            <p className="text-sm text-white/60">{project.client}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Counter */}
          <span className="text-sm text-white/60 mr-2">
            {currentIndex + 1} / {allMedia.length}
          </span>
          
          {/* Toggle info panel */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-lg transition-colors ${
              showInfo ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            aria-label={showInfo ? "Hide info" : "Show info"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="h-full flex">
        {/* Media Viewer */}
        <div className={`flex-1 flex items-center justify-center p-4 pt-20 pb-20 transition-all duration-300 ${
          showInfo ? "lg:pr-96" : ""
        }`}>
          {/* Navigation - Previous */}
          {hasPrev && (
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Media */}
          <div className="relative max-w-full max-h-full w-full h-full flex items-center justify-center">
            {currentMedia.type === "video" ? (
              <div className="relative w-full max-w-4xl aspect-video">
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  poster={currentMedia.posterUrl}
                  className="w-full h-full object-contain rounded-lg"
                  controls
                  playsInline
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={currentMedia.url}
                  alt={currentMedia.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                  placeholder={currentMedia.blurDataUrl ? "blur" : undefined}
                  blurDataURL={currentMedia.blurDataUrl}
                />
              </div>
            )}
          </div>

          {/* Navigation - Next */}
          {hasNext && (
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10 lg:right-[calc(1rem+24rem)]"
              style={{ right: showInfo ? undefined : "1rem" }}
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Info Side Panel */}
        <aside
          className={`
            fixed lg:absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-slate-900 border-l border-slate-800
            transform transition-transform duration-300 ease-out z-20
            ${showInfo ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <div className="h-full overflow-y-auto p-6 pt-20">
            {/* Mobile close */}
            <button
              onClick={() => setShowInfo(false)}
              className="lg:hidden absolute top-4 right-4 p-2 text-white/70 hover:text-white"
              aria-label="Close info panel"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Project Info */}
            <div className="space-y-6">
              <div>
                <span className="inline-block px-2.5 py-1 text-xs font-medium text-blue-400 bg-blue-500/10 rounded-full capitalize mb-3">
                  {project.categories[0]}
                </span>
                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-sm text-slate-400">{project.client} · {project.year}</p>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-sm leading-relaxed">
                {project.description}
              </p>

              {/* Metrics */}
              {project.metrics && (
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800">
                  {project.metrics.impressions && (
                    <div>
                      <p className="text-lg font-bold text-white">
                        {project.metrics.impressions >= 1000000 
                          ? `${(project.metrics.impressions / 1000000).toFixed(1)}M`
                          : `${Math.round(project.metrics.impressions / 1000)}K`
                        }
                      </p>
                      <p className="text-xs text-slate-500">Impressions</p>
                    </div>
                  )}
                  {project.metrics.deliverables && (
                    <div>
                      <p className="text-sm font-semibold text-white">{project.metrics.deliverables.split(",")[0]}</p>
                      <p className="text-xs text-slate-500">Delivered</p>
                    </div>
                  )}
                  {project.metrics.timeline && (
                    <div>
                      <p className="text-sm font-semibold text-white">{project.metrics.timeline}</p>
                      <p className="text-xs text-slate-500">Timeline</p>
                    </div>
                  )}
                </div>
              )}

              {/* Testimonial */}
              {project.testimonial && (
                <blockquote className="border-l-2 border-blue-500 pl-4">
                  <p className="text-sm text-slate-300 italic mb-2">
                    &ldquo;{project.testimonial.quote}&rdquo;
                  </p>
                  <cite className="text-xs text-slate-500 not-italic">
                    — {project.testimonial.author}
                    {project.testimonial.role && `, ${project.testimonial.role}`}
                  </cite>
                </blockquote>
              )}

              {/* Gallery Thumbnails */}
              {allMedia.length > 1 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Gallery</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {allMedia.map((media, idx) => (
                      <button
                        key={media.id}
                        onClick={() => onNavigate(idx)}
                        className={`
                          relative aspect-square rounded-lg overflow-hidden
                          ${idx === currentIndex 
                            ? "ring-2 ring-blue-500" 
                            : "opacity-60 hover:opacity-100"
                          }
                          transition-all duration-200
                        `}
                      >
                        <Image
                          src={media.thumbnailUrl}
                          alt={media.alt}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                        {media.type === "video" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="space-y-3 pt-4">
                <Link
                  href={`/contact?project=${project.slug}`}
                  onClick={() => {
                    analytics?.onCtaClick?.("book", project.id);
                    onBookClick?.(project);
                  }}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-slate-900 bg-white rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book This Style
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Get a Custom Quote
                </Link>
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="text-xs text-slate-600 space-y-1 pt-4 border-t border-slate-800">
                <p><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">→</kbd> Navigate</p>
                <p><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">i</kbd> Toggle info</p>
                <p><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Esc</kbd> Close</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Mobile Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-linear-to-t from-slate-950 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Info
          </button>
          <Link
            href={`/contact?project=${project.slug}`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-900 bg-white rounded-lg"
          >
            Book This Style
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
