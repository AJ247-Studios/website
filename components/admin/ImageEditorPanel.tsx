/**
 * ImageEditorPanel Component
 * 
 * A slide-over panel for editing image properties including:
 * - Upload new image
 * - Set focal point
 * - Edit alt text and caption
 * - Preview at different aspect ratios
 * - Save changes
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import FocalPointPicker from "./FocalPointPicker";
import ResponsivePreview from "./ResponsivePreview";
import {
  SiteImage,
  HeroSlot,
  PortfolioItem,
  uploadSiteImage,
  updateSiteImage,
  updateHeroSlot,
  updatePortfolioItem,
  validateImageFile,
  getImageDimensions,
  ASPECT_RATIOS,
} from "@/lib/site-media";

type EditTarget =
  | { type: "hero"; slot: HeroSlot }
  | { type: "portfolio"; item: PortfolioItem; field: "cover" | "thumbnail" | "hover" }
  | { type: "image"; image: SiteImage };

interface ImageEditorPanelProps {
  target: EditTarget;
  onClose: () => void;
  onSaved: (updated: SiteImage | HeroSlot | PortfolioItem) => void;
}

export default function ImageEditorPanel({
  target,
  onClose,
  onSaved,
}: ImageEditorPanelProps) {
  // Get current image based on target
  const getCurrentImage = (): SiteImage | null => {
    if (target.type === "image") return target.image;
    if (target.type === "hero") return target.slot.image || null;
    if (target.type === "portfolio") {
      const item = target.item;
      if (target.field === "cover") return item.cover_image || null;
      if (target.field === "thumbnail") return item.thumbnail_image || null;
      if (target.field === "hover") return item.hover_image || null;
    }
    return null;
  };

  const currentImage = getCurrentImage();

  // State
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [focalX, setFocalX] = useState(currentImage?.focal_x ?? 0.5);
  const [focalY, setFocalY] = useState(currentImage?.focal_y ?? 0.5);
  const [altText, setAltText] = useState(currentImage?.alt_text || "");
  const [caption, setCaption] = useState(currentImage?.caption || "");
  const [aspectRatio, setAspectRatio] = useState(
    target.type === "hero" ? target.slot.aspect_ratio : "16:9"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showResponsivePreview, setShowResponsivePreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setError(null);
    
    const validation = validateImageFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));

    // Reset focal point for new images
    setFocalX(0.5);
    setFocalY(0.5);
  }, []);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle save
  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      let savedImage: SiteImage | null = null;

      // If there's a new file, upload it
      if (file) {
        const category = target.type === "hero" ? "hero" : target.type === "portfolio" ? "portfolio" : "general";
        
        const result = await uploadSiteImage(file, {
          category,
          alt_text: altText,
          caption,
          focal_x: focalX,
          focal_y: focalY,
        });
        savedImage = result.image;
      } else if (currentImage) {
        // Update existing image metadata
        savedImage = await updateSiteImage(currentImage.id, {
          focal_x: focalX,
          focal_y: focalY,
          alt_text: altText,
          caption,
        });
      }

      // Update the target with the image reference
      if (target.type === "hero" && savedImage) {
        const updated = await updateHeroSlot(target.slot.id, {
          image_id: savedImage.id,
          aspect_ratio: aspectRatio,
        });
        onSaved(updated);
      } else if (target.type === "portfolio" && savedImage) {
        const updateField = {
          cover: "cover_image_id",
          thumbnail: "thumbnail_image_id",
          hover: "hover_image_id",
        }[target.field];
        
        const updated = await updatePortfolioItem(target.item.id, {
          [updateField]: savedImage.id,
        });
        onSaved(updated);
      } else if (savedImage) {
        onSaved(savedImage);
      }

      onClose();
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  // Handle remove image
  const handleRemoveImage = async () => {
    if (!confirm("Remove this image from the slot?")) return;

    setLoading(true);
    setError(null);

    try {
      if (target.type === "hero") {
        const updated = await updateHeroSlot(target.slot.id, {
          image_id: null,
        });
        onSaved(updated);
      } else if (target.type === "portfolio") {
        const updateField = {
          cover: "cover_image_id",
          thumbnail: "thumbnail_image_id",
          hover: "hover_image_id",
        }[target.field];
        
        const updated = await updatePortfolioItem(target.item.id, {
          [updateField]: null,
        });
        onSaved(updated);
      }
      onClose();
    } catch (err) {
      console.error("Remove error:", err);
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Get panel title
  const getTitle = () => {
    if (target.type === "hero") {
      return `Edit Hero: ${target.slot.page_key} / ${target.slot.slot_key}`;
    }
    if (target.type === "portfolio") {
      return `Edit ${target.field} image: ${target.item.title}`;
    }
    return "Edit Image";
  };

  const imageUrl = preview || currentImage?.public_url;
  const hasImage = Boolean(imageUrl);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-slate-900 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{getTitle()}</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Upload area */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {hasImage ? "Replace Image" : "Upload Image"}
            </label>
            <div
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                transition-colors duration-200
                ${isDragging
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <div className="space-y-2">
                <svg className="w-10 h-10 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-slate-400">
                  Drag & drop an image, or click to browse
                </p>
                <p className="text-xs text-slate-500">
                  JPEG, PNG, WebP, AVIF • Max 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Focal point picker */}
          {hasImage && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Focal Point
              </label>
              <FocalPointPicker
                imageUrl={imageUrl!}
                focalX={focalX}
                focalY={focalY}
                onChange={(x, y) => {
                  setFocalX(x);
                  setFocalY(y);
                }}
                aspectRatio={aspectRatio}
              />
            </div>
          )}

          {/* Aspect ratio selector */}
          {target.type === "hero" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(ASPECT_RATIOS).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAspectRatio(key)}
                    className={`
                      px-3 py-2 text-sm rounded-lg border transition-colors
                      ${aspectRatio === key
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-slate-600 text-slate-300 hover:border-slate-500"
                      }
                    `}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alt text */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Alt Text <span className="text-slate-500">(for accessibility & SEO)</span>
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {!altText && hasImage && (
              <p className="mt-1 text-xs text-amber-400">
                ⚠️ Alt text is recommended for accessibility
              </p>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Caption <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              rows={2}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Responsive preview toggle */}
          {hasImage && (
            <div>
              <button
                type="button"
                onClick={() => setShowResponsivePreview(!showResponsivePreview)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Preview at different sizes
                </span>
                <svg 
                  className={`w-5 h-5 transition-transform ${showResponsivePreview ? "rotate-180" : ""}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showResponsivePreview && (
                <div className="mt-4">
                  <ResponsivePreview
                    imageUrl={imageUrl!}
                    focalX={focalX}
                    focalY={focalY}
                    aspectRatio={aspectRatio}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {currentImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={loading}
                  className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                >
                  Remove image
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-slate-300 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || (!file && !currentImage)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
