/**
 * MediaLibrary Component
 * 
 * Grid-based media library for browsing, searching, and managing all site images.
 * Supports filtering, bulk selection, and quick editing.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  SiteImage,
  HeroSlot,
  PortfolioItem,
  fetchSiteImages,
  deleteSiteImage,
  focalPointToObjectPosition,
} from "@/lib/site-media";
import ImageEditorPanel from "./ImageEditorPanel";

interface MediaLibraryProps {
  onSelect?: (image: SiteImage) => void;
  selectionMode?: boolean;
}

const CATEGORIES = [
  { value: "all", label: "All Images" },
  { value: "hero", label: "Hero Images" },
  { value: "portfolio", label: "Portfolio" },
  { value: "team", label: "Team" },
  { value: "general", label: "General" },
];

export default function MediaLibrary({ onSelect, selectionMode = false }: MediaLibraryProps) {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [editingImage, setEditingImage] = useState<SiteImage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const LIMIT = 24;

  // Load images
  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSiteImages({
        category: category === "all" ? undefined : category,
        limit: LIMIT,
        offset: page * LIMIT,
      });
      setImages(result.images);
      setTotal(result.total);
    } catch (err) {
      console.error("Failed to load images:", err);
      setError(err instanceof Error ? err.message : "Failed to load images");
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Filter images by search
  const filteredImages = images.filter(img => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      img.filename.toLowerCase().includes(searchLower) ||
      img.alt_text?.toLowerCase().includes(searchLower) ||
      img.caption?.toLowerCase().includes(searchLower) ||
      img.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  // Toggle image selection
  const toggleSelection = (imageId: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId);
    } else {
      newSelection.add(imageId);
    }
    setSelectedImages(newSelection);
  };

  // Handle delete
  const handleDelete = async (imageId: string) => {
    try {
      await deleteSiteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      setTotal(prev => prev - 1);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete:", err);
      alert(err instanceof Error ? err.message : "Failed to delete image");
    }
  };

  // Handle saved from editor
  const handleSaved = (updated: SiteImage | HeroSlot | PortfolioItem) => {
    // MediaLibrary only edits images, so we can safely cast
    if ('storage_key' in updated) {
      setImages(prev => prev.map(img => img.id === updated.id ? updated as SiteImage : img));
    }
    setEditingImage(null);
  };

  // Format file size
  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Search */}
        <div className="relative">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search images..."
            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => { setCategory(cat.value); setPage(0); }}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${category === cat.value
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {selectedImages.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <span className="text-blue-400 font-medium">
            {selectedImages.size} selected
          </span>
          <button
            onClick={() => setSelectedImages(new Set())}
            className="text-slate-400 hover:text-white text-sm"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-400 mb-2">Failed to load images</div>
            <div className="text-slate-500 text-sm">{error}</div>
            <button 
              onClick={loadImages}
              className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredImages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-slate-400 mb-2">No images found</div>
          <div className="text-slate-500 text-sm">
            {search ? "Try a different search term" : "Upload some images to get started"}
          </div>
        </div>
      )}

      {/* Image grid */}
      {!loading && !error && filteredImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredImages.map(image => (
            <div
              key={image.id}
              className={`
                group relative bg-slate-800 rounded-lg overflow-hidden cursor-pointer
                ${selectedImages.has(image.id) ? "ring-2 ring-blue-500" : ""}
              `}
              onClick={() => {
                if (selectionMode && onSelect) {
                  onSelect(image);
                } else {
                  toggleSelection(image.id);
                }
              }}
            >
              {/* Image */}
              <div className="aspect-square relative">
                <img
                  src={image.public_url || "/portfolio/placeholder.jpg"}
                  alt={image.alt_text || image.filename}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: focalPointToObjectPosition(image.focal_x, image.focal_y) }}
                  loading="lazy"
                />

                {/* Selection checkbox */}
                <div className={`
                  absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center
                  transition-all duration-200
                  ${selectedImages.has(image.id)
                    ? "bg-blue-500 border-blue-500"
                    : "border-white/50 bg-black/30 group-hover:border-white"
                  }
                `}>
                  {selectedImages.has(image.id) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* Quick actions */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingImage(image); }}
                    className="p-1.5 bg-black/60 hover:bg-black/80 rounded text-white"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(image.id); }}
                    className="p-1.5 bg-black/60 hover:bg-red-500 rounded text-white"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Focal point indicator */}
                <div 
                  className="absolute w-2 h-2 rounded-full bg-blue-500 border border-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    left: `${image.focal_x * 100}%`,
                    top: `${image.focal_y * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-sm text-white truncate" title={image.filename}>
                  {image.filename}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span>{formatSize(image.file_size)}</span>
                  <span>{formatDate(image.created_at)}</span>
                </div>
                {image.category && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-400 capitalize">
                    {image.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-slate-400 text-sm">
            Page {page + 1} of {Math.ceil(total / LIMIT)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * LIMIT >= total}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-slate-900 rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Image?</h3>
            <p className="text-slate-400 text-sm mb-6">
              This action cannot be undone. The image will be permanently deleted from storage.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image editor panel */}
      {editingImage && (
        <ImageEditorPanel
          target={{ type: "image", image: editingImage }}
          onClose={() => setEditingImage(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
