/**
 * VisualPageEditor Component
 * 
 * A WYSIWYG-style canvas that shows the site layout with clickable hotspots
 * for editing hero images and portfolio tiles. Includes device preview toggles.
 */

"use client";

import React, { useState, useEffect } from "react";
import { 
  HeroSlot, 
  PortfolioItem, 
  SiteImage,
  fetchHeroSlots,
  fetchPortfolioItems,
  focalPointToObjectPosition,
} from "@/lib/site-media";
import ImageEditorPanel from "./ImageEditorPanel";

type DevicePreview = "desktop" | "tablet" | "mobile";

interface VisualPageEditorProps {
  initialPage?: string;
}

export default function VisualPageEditor({ initialPage = "home" }: VisualPageEditorProps) {
  const [heroSlots, setHeroSlots] = useState<HeroSlot[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devicePreview, setDevicePreview] = useState<DevicePreview>("desktop");
  const [activePage, setActivePage] = useState(initialPage);
  
  // Editor panel state
  const [editorTarget, setEditorTarget] = useState<{
    type: "hero";
    slot: HeroSlot;
  } | {
    type: "portfolio";
    item: PortfolioItem;
    field: "cover" | "thumbnail" | "hover";
  } | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [slots, items] = await Promise.all([
          fetchHeroSlots(),
          fetchPortfolioItems(),
        ]);
        setHeroSlots(slots);
        setPortfolioItems(items);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Get page-specific hero slots
  const pageHeroSlots = heroSlots.filter(slot => slot.page_key === activePage);
  
  // Unique pages from hero slots
  const pages = Array.from(new Set(heroSlots.map(s => s.page_key)));

  // Handle save from editor panel
  const handleSaved = (updated: SiteImage | HeroSlot | PortfolioItem) => {
    if ("page_key" in updated) {
      // It's a HeroSlot
      setHeroSlots(prev => prev.map(s => s.id === updated.id ? updated : s));
    } else if ("slug" in updated) {
      // It's a PortfolioItem
      setPortfolioItems(prev => prev.map(i => i.id === updated.id ? updated : i));
    }
    setEditorTarget(null);
  };

  // Device width classes
  const deviceWidths: Record<DevicePreview, string> = {
    desktop: "w-full max-w-5xl",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Loading visual editor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-400 mb-2">Failed to load editor</div>
          <div className="text-slate-500 text-sm">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Page selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Page:</span>
          <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
            {pages.map(page => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors
                  ${activePage === page 
                    ? "bg-blue-500 text-white" 
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                  }
                `}
              >
                {page}
              </button>
            ))}
          </div>
        </div>

        {/* Device toggle */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Preview:</span>
          <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
            {(["desktop", "tablet", "mobile"] as DevicePreview[]).map(device => (
              <button
                key={device}
                onClick={() => setDevicePreview(device)}
                className={`
                  p-2 rounded-md transition-colors
                  ${devicePreview === device 
                    ? "bg-blue-500 text-white" 
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                  }
                `}
                title={device.charAt(0).toUpperCase() + device.slice(1)}
              >
                {device === "desktop" && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
                    <line x1="8" y1="21" x2="16" y2="21" strokeWidth="2" />
                    <line x1="12" y1="17" x2="12" y2="21" strokeWidth="2" />
                  </svg>
                )}
                {device === "tablet" && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="2" />
                    <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
                {device === "mobile" && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="7" y="2" width="10" height="20" rx="2" strokeWidth="2" />
                    <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas wrapper */}
      <div className="bg-slate-800/50 rounded-2xl p-6 overflow-x-auto">
        <div className={`mx-auto ${deviceWidths[devicePreview]} transition-all duration-300`}>
          {/* Preview frame decoration */}
          <div className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 text-center">
                  aj247.com/{activePage === "home" ? "" : activePage}
                </div>
              </div>
            </div>

            {/* Page content */}
            <div className="min-h-[600px]">
              {/* Hero Section */}
              <section className="relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
                {pageHeroSlots.map(slot => (
                  <HeroSlotPreview
                    key={slot.id}
                    slot={slot}
                    devicePreview={devicePreview}
                    onClick={() => setEditorTarget({ type: "hero", slot })}
                  />
                ))}

                {pageHeroSlots.length === 0 && (
                  <div className="relative py-20 px-8 text-center">
                    <div className="text-slate-500 mb-4">No hero slots configured for this page</div>
                    <div className="text-slate-600 text-sm">
                      Hero slots are created in the database. Add a slot for "{activePage}".
                    </div>
                  </div>
                )}
              </section>

              {/* Portfolio Grid (only on home/portfolio pages) */}
              {(activePage === "home" || activePage === "portfolio") && (
                <section className="py-16 px-8 bg-white dark:bg-slate-950">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                    Our Portfolio
                  </h2>
                  <div className={`
                    grid gap-6
                    ${devicePreview === "mobile" ? "grid-cols-1" : devicePreview === "tablet" ? "grid-cols-2" : "grid-cols-3"}
                  `}>
                    {portfolioItems.slice(0, 6).map(item => (
                      <PortfolioItemPreview
                        key={item.id}
                        item={item}
                        onClick={() => setEditorTarget({ type: "portfolio", item, field: "cover" })}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-dashed border-blue-500 rounded" />
          <span>Editable image area</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500/20 rounded" />
          <span>Hover to see edit button</span>
        </div>
      </div>

      {/* Editor Panel */}
      {editorTarget && (
        <ImageEditorPanel
          target={editorTarget}
          onClose={() => setEditorTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// Hero slot preview component
function HeroSlotPreview({
  slot,
  devicePreview,
  onClick,
}: {
  slot: HeroSlot;
  devicePreview: DevicePreview;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const image = slot.image;
  const isMobileHidden = slot.hide_on_mobile && devicePreview === "mobile";

  if (isMobileHidden) {
    return null;
  }

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* The image or placeholder */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          aspectRatio: slot.aspect_ratio === "auto" ? undefined : slot.aspect_ratio.replace(":", "/"),
          minHeight: "200px",
        }}
      >
        {image?.public_url ? (
          <img
            src={image.public_url}
            alt={slot.alt_text_override || image.alt_text || "Hero image"}
            className="w-full h-full"
            style={{
              objectFit: slot.object_fit as "cover" | "contain" | "fill",
              objectPosition: focalPointToObjectPosition(image.focal_x, image.focal_y),
            }}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-slate-500 text-sm">No image assigned</span>
            </div>
          </div>
        )}

        {/* Edit overlay */}
        <div className={`
          absolute inset-0 border-2 border-dashed transition-all duration-200
          ${isHovered 
            ? "border-blue-500 bg-blue-500/10" 
            : "border-transparent bg-transparent"
          }
        `}>
          {/* Slot label */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
            {slot.slot_key}
          </div>

          {/* Edit button */}
          <div className={`
            absolute inset-0 flex items-center justify-center transition-opacity duration-200
            ${isHovered ? "opacity-100" : "opacity-0"}
          `}>
            <div className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium shadow-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Image
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Portfolio item preview component
function PortfolioItemPreview({
  item,
  onClick,
}: {
  item: PortfolioItem;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const image = item.cover_image;

  return (
    <div
      className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-4/3 relative">
        {image?.public_url ? (
          <img
            src={image.public_url}
            alt={image.alt_text || item.title}
            className="w-full h-full object-cover"
            style={{
              objectPosition: focalPointToObjectPosition(image.focal_x, image.focal_y),
            }}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {item.is_featured && (
            <span className="px-2 py-0.5 bg-yellow-500 text-yellow-900 text-xs font-medium rounded">
              Featured
            </span>
          )}
          {!item.is_published && (
            <span className="px-2 py-0.5 bg-slate-500 text-white text-xs font-medium rounded">
              Draft
            </span>
          )}
        </div>

        {/* Edit overlay */}
        <div className={`
          absolute inset-0 border-2 border-dashed transition-all duration-200
          ${isHovered 
            ? "border-blue-500 bg-blue-500/20" 
            : "border-transparent bg-transparent"
          }
        `}>
          <div className={`
            absolute inset-0 flex items-center justify-center transition-opacity duration-200
            ${isHovered ? "opacity-100" : "opacity-0"}
          `}>
            <div className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium shadow-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Cover
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
        <h3 className="text-white font-medium truncate">{item.title}</h3>
        {item.categories?.length > 0 && (
          <p className="text-slate-300 text-sm truncate">{item.categories.join(", ")}</p>
        )}
      </div>
    </div>
  );
}
