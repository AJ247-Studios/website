/**
 * FocalPointPicker Component
 * 
 * A visual picker for setting the focal point of an image.
 * The focal point determines how the image will be cropped at different aspect ratios.
 */

"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

interface FocalPointPickerProps {
  imageUrl: string;
  focalX: number;
  focalY: number;
  onChange: (x: number, y: number) => void;
  aspectRatio?: string;
  showPreview?: boolean;
  disabled?: boolean;
}

export default function FocalPointPicker({
  imageUrl,
  focalX,
  focalY,
  onChange,
  aspectRatio = "16:9",
  showPreview = true,
  disabled = false,
}: FocalPointPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Calculate preview crop based on focal point
  const getCropPreview = useCallback(() => {
    if (!aspectRatio || aspectRatio === "auto") return null;

    const [w, h] = aspectRatio.split(":").map(Number);
    if (!w || !h) return null;

    const targetAspect = w / h;
    const sourceAspect = imageDimensions.width / imageDimensions.height;

    let cropWidth: number;
    let cropHeight: number;

    if (sourceAspect > targetAspect) {
      cropHeight = 100;
      cropWidth = (cropHeight * targetAspect) / sourceAspect * 100;
    } else {
      cropWidth = 100;
      cropHeight = (cropWidth / targetAspect) * sourceAspect * 100;
    }

    // Center on focal point
    let left = (focalX * 100) - (cropWidth / 2);
    let top = (focalY * 100) - (cropHeight / 2);

    // Clamp to bounds
    left = Math.max(0, Math.min(left, 100 - cropWidth));
    top = Math.max(0, Math.min(top, 100 - cropHeight));

    return { left, top, width: cropWidth, height: cropHeight };
  }, [focalX, focalY, aspectRatio, imageDimensions]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e);
  }, [disabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || disabled) return;
    updatePosition(e as unknown as React.MouseEvent);
  }, [isDragging, disabled]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const updatePosition = useCallback((e: React.MouseEvent | { clientX: number; clientY: number }) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    onChange(x, y);
  }, [onChange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
  }, []);

  const cropPreview = getCropPreview();

  return (
    <div className="space-y-3">
      {/* Main focal point picker */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-lg border-2 ${
          disabled ? "border-slate-600 opacity-60" : "border-blue-500 cursor-crosshair"
        } bg-slate-800`}
        onMouseDown={handleMouseDown}
        style={{ aspectRatio: "16/9" }}
      >
        {/* Image */}
        <img
          src={imageUrl}
          alt="Focal point picker"
          className="w-full h-full object-contain"
          onLoad={handleImageLoad}
          draggable={false}
        />

        {/* Crop preview overlay */}
        {showPreview && cropPreview && (
          <div
            className="absolute border-2 border-dashed border-white/50 bg-transparent pointer-events-none transition-all duration-100"
            style={{
              left: `${cropPreview.left}%`,
              top: `${cropPreview.top}%`,
              width: `${cropPreview.width}%`,
              height: `${cropPreview.height}%`,
            }}
          >
            {/* Darkened areas outside crop */}
            <div className="absolute -left-[9999px] -top-[9999px] w-[19998px] h-[9999px] bg-black/40 pointer-events-none" />
            <div className="absolute -left-[9999px] bottom-0 translate-y-full w-[19998px] h-[9999px] bg-black/40 pointer-events-none" />
          </div>
        )}

        {/* Focal point marker */}
        <div
          className={`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform ${
            isDragging ? "scale-110" : ""
          }`}
          style={{
            left: `${focalX * 100}%`,
            top: `${focalY * 100}%`,
          }}
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-white shadow-lg" />
          {/* Inner dot */}
          <div className="absolute inset-2 rounded-full bg-blue-500 border-2 border-white" />
          {/* Crosshair lines */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/70 -translate-x-1/2" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/70 -translate-y-1/2" />
        </div>

        {/* Instructions */}
        {!disabled && (
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <span className="px-2 py-1 bg-black/60 text-white text-xs rounded">
              Click or drag to set focal point
            </span>
          </div>
        )}
      </div>

      {/* Coordinates display */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          Focal point: {(focalX * 100).toFixed(0)}% × {(focalY * 100).toFixed(0)}%
        </span>
        <button
          type="button"
          onClick={() => onChange(0.5, 0.5)}
          className="text-blue-400 hover:text-blue-300 text-xs"
          disabled={disabled}
        >
          Reset to center
        </button>
      </div>
    </div>
  );
}
