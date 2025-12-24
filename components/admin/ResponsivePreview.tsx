/**
 * ResponsivePreview Component
 * 
 * Shows how an image will appear cropped at different viewport sizes
 * (mobile, tablet, desktop) using the focal point for smart cropping.
 */

"use client";

import React, { useState, ReactElement } from "react";
import { BREAKPOINT_SIZES, calculateFocalCrop, ASPECT_RATIOS } from "@/lib/site-media";

interface ResponsivePreviewProps {
  imageUrl: string;
  focalX: number;
  focalY: number;
  aspectRatio: string;
  imageWidth?: number;
  imageHeight?: number;
}

type ViewportSize = "mobile" | "tablet" | "desktop";

const VIEWPORT_CONFIGS: Record<ViewportSize, { width: number; label: string; icon: ReactElement }> = {
  mobile: {
    width: 375,
    label: "Mobile",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="7" y="2" width="10" height="20" rx="2" strokeWidth="2" />
        <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  tablet: {
    width: 768,
    label: "Tablet",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth="2" />
        <line x1="12" y1="17" x2="12" y2="17" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  desktop: {
    width: 1440,
    label: "Desktop",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
        <line x1="8" y1="21" x2="16" y2="21" strokeWidth="2" />
        <line x1="12" y1="17" x2="12" y2="21" strokeWidth="2" />
      </svg>
    ),
  },
};

export default function ResponsivePreview({
  imageUrl,
  focalX,
  focalY,
  aspectRatio,
  imageWidth = 1920,
  imageHeight = 1080,
}: ResponsivePreviewProps) {
  const [activeViewport, setActiveViewport] = useState<ViewportSize>("desktop");

  // Parse aspect ratio
  const getAspectValue = () => {
    if (aspectRatio === "auto") return imageWidth / imageHeight;
    const config = ASPECT_RATIOS[aspectRatio];
    if (!config || config.width === 0) return imageWidth / imageHeight;
    return config.width / config.height;
  };

  const targetAspect = getAspectValue();

  // Calculate object-position based on focal point
  const objectPosition = `${(focalX * 100).toFixed(1)}% ${(focalY * 100).toFixed(1)}%`;

  return (
    <div className="space-y-4">
      {/* Viewport selector */}
      <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
        {(Object.entries(VIEWPORT_CONFIGS) as [ViewportSize, typeof VIEWPORT_CONFIGS.mobile][]).map(
          ([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveViewport(key)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                transition-colors
                ${activeViewport === key
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
                }
              `}
            >
              {config.icon}
              <span>{config.label}</span>
            </button>
          )
        )}
      </div>

      {/* Preview frames */}
      <div className="relative bg-slate-800 rounded-xl p-4 overflow-hidden">
        {/* Frame decorations */}
        <div className="absolute top-2 left-4 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
        </div>

        {/* Preview container */}
        <div className="mt-4 flex justify-center">
          <div
            className={`
              relative overflow-hidden rounded-lg shadow-lg bg-slate-900
              transition-all duration-300
            `}
            style={{
              width: activeViewport === "mobile" ? 160 : activeViewport === "tablet" ? 280 : "100%",
              maxWidth: 400,
              aspectRatio: String(targetAspect),
            }}
          >
            {/* Image with focal-point-based cropping */}
            <img
              src={imageUrl}
              alt="Responsive preview"
              className="w-full h-full object-cover"
              style={{ objectPosition }}
            />

            {/* Focal point indicator */}
            <div
              className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${focalX * 100}%`,
                top: `${focalY * 100}%`,
              }}
            >
              <div className="w-full h-full rounded-full border-2 border-white shadow-md bg-blue-500/50" />
            </div>

            {/* Viewport label */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
              {VIEWPORT_CONFIGS[activeViewport].width}px
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Aspect ratio: {aspectRatio === "auto" ? "Original" : aspectRatio}
        </span>
        <span>
          Image crops to focal point at smaller sizes
        </span>
      </div>
    </div>
  );
}
