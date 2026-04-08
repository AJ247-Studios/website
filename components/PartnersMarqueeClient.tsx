"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

type PartnerLogo = {
  src: string;
  alt: string;
  fileName: string;
};

const imageStyles: Record<string, { width: number; height: number; className: string }> = {
  "B.webp": { width: 80, height: 80, className: "w-20 h-20 rounded-full object-cover" },
  "No-press-studio.webp": { width: 184, height: 80, className: "h-20 rounded-lg object-contain" },
  "People's-Press.webp": { width: 142, height: 80, className: "h-20 rounded-lg object-contain" },
  "Poland-Sports-Gazette.webp": { width: 142, height: 80, className: "h-20 rounded-lg object-contain" },
  "Realtime.webp": { width: 80, height: 80, className: "w-20 h-20 rounded-full object-cover" },
  "Resilience.webp": { width: 1680, height: 80, className: "h-20 rounded-lg object-contain" },
  "The-red-light.webp": { width: 80, height: 80, className: "w-20 h-20 rounded-full object-cover" },
};

export default function PartnersMarqueeClient({ logos }: { logos: PartnerLogo[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Duplicate logos enough times to fill the screen + extra for seamless looping
  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos, ...logos, ...logos];

  return (
    <div ref={containerRef} className="relative overflow-hidden py-4">
      <div className="flex animate-marquee">
        {duplicatedLogos.map((logo, idx) => {
          const style = imageStyles[logo.fileName] || {
            width: 120,
            height: 80,
            className: "h-20 rounded-lg object-contain",
          };
          return (
            <div 
              key={`${logo.fileName}-${idx}`} 
              className="shrink-0 flex items-center justify-center px-8"
              style={{ minWidth: style.width }}
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={style.width}
                height={style.height}
                className={`shrink-0 ${style.className}`}
                title={logo.alt}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
