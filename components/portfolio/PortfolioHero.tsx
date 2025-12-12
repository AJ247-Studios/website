"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface PortfolioHeroProps {
  /** Hero headline - keep short and impactful */
  headline?: string;
  /** Supporting subheadline */
  subheadline?: string;
  /** Background image URL */
  imageUrl?: string;
  /** Background video URL (takes priority over image) */
  videoUrl?: string;
  /** Video poster image for loading state */
  videoPosterUrl?: string;
  /** Blur placeholder for image */
  blurDataUrl?: string;
  /** Primary CTA text */
  ctaText?: string;
  /** Primary CTA href */
  ctaHref?: string;
  /** Secondary CTA text */
  secondaryCtaText?: string;
  /** Secondary CTA href */
  secondaryCtaHref?: string;
  /** Analytics callback */
  onCtaClick?: (ctaType: "primary" | "secondary") => void;
}

/**
 * PortfolioHero Component
 * 
 * Big, contextual hero with striking image or auto-muted video reel.
 * Sets tone and trust fast. Follows UX research: visual-first, minimal.
 */
export default function PortfolioHero({
  headline = "Our Work Speaks for Itself",
  subheadline = "500+ projects delivered. From championship sports to dream weddings — see what we can create for you.",
  imageUrl = "/portfolio/hero-default.jpg",
  videoUrl,
  videoPosterUrl,
  blurDataUrl,
  ctaText = "Get a Free Quote",
  ctaHref = "/contact",
  secondaryCtaText = "View Case Studies",
  secondaryCtaHref = "#featured",
  onCtaClick,
}: PortfolioHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Auto-play video when loaded (muted by default for UX)
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay blocked - that's fine, show poster
        console.log("Autoplay blocked");
      });
    }
  }, [isVideoLoaded]);

  const handleCtaClick = (type: "primary" | "secondary") => {
    onCtaClick?.(type);
  };

  return (
    <section className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0">
        {videoUrl ? (
          <>
            {/* Video Background */}
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                isVideoLoaded ? "opacity-100" : "opacity-0"
              }`}
              src={videoUrl}
              poster={videoPosterUrl}
              muted
              loop
              playsInline
              onLoadedData={() => setIsVideoLoaded(true)}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            />
            {/* Fallback image while video loads */}
            {!isVideoLoaded && (
              <Image
                src={videoPosterUrl || imageUrl}
                alt=""
                fill
                className="object-cover"
                priority
                placeholder={blurDataUrl ? "blur" : undefined}
                blurDataURL={blurDataUrl}
              />
            )}
          </>
        ) : (
          /* Image Background */
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            priority
            placeholder={blurDataUrl ? "blur" : undefined}
            blurDataURL={blurDataUrl}
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/50 to-slate-950/30" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {headline}
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed">
              {subheadline}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={ctaHref}
                onClick={() => handleCtaClick("primary")}
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-900 bg-white rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
              >
                {ctaText}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href={secondaryCtaHref}
                onClick={() => handleCtaClick("secondary")}
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 transition-colors"
              >
                {secondaryCtaText}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Video Controls (if video) */}
          {videoUrl && isVideoLoaded && (
            <button
              onClick={() => {
                const video = videoRef.current;
                if (video) {
                  if (video.paused) {
                    video.play();
                  } else {
                    video.pause();
                  }
                }
              }}
              className="absolute bottom-6 right-6 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
              aria-label={isVideoPlaying ? "Pause video" : "Play video"}
            >
              {isVideoPlaying ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
