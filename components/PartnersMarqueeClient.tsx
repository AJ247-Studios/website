"use client";
import Image from "next/image";

type PartnerLogo = {
  src: string;
  alt: string;
  fileName: string;
};

// Wrapper dimensions based on actual logo aspect ratios at 80px height
const logoSizes: Record<string, { wrapperWidth: number; aspectRatio: number }> = {
  "B.webp":                { wrapperWidth: 80,  aspectRatio: 1080 / 1042 },  // ~1:1
  "People's-Press.webp":   { wrapperWidth: 120, aspectRatio: 1536 / 1024 },  // 3:2
  "Poland-Sports-Gazette.webp": { wrapperWidth: 120, aspectRatio: 1536 / 1024 }, // 3:2
  "Realtime.webp":         { wrapperWidth: 80,  aspectRatio: 200 / 200 },    // 1:1
  "Resilience.webp":       { wrapperWidth: 140, aspectRatio: 1414 / 800 },   // ~1.77:1
  "The-red-light.webp":    { wrapperWidth: 80,  aspectRatio: 828 / 827 },    // ~1:1
};

export default function PartnersMarqueeClient({ logos }: { logos: PartnerLogo[] }) {
  return (
    <div className="marquee-container">
      <div className="marquee-track">
        {logos.map((logo, idx) => {
          const size = logoSizes[logo.fileName] || { wrapperWidth: 120, aspectRatio: 1.5 };
          return (
            <div key={`logo-1-${idx}`} className="marquee-item" style={{ width: size.wrapperWidth }}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={size.wrapperWidth}
                height={Math.round(size.wrapperWidth / size.aspectRatio)}
                className="h-20 w-full rounded-lg object-contain"
                title={logo.alt}
              />
            </div>
          );
        })}
        {/* Exact duplicate for seamless loop */}
        {logos.map((logo, idx) => {
          const size = logoSizes[logo.fileName] || { wrapperWidth: 120, aspectRatio: 1.5 };
          return (
            <div key={`logo-2-${idx}`} className="marquee-item" style={{ width: size.wrapperWidth }}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={size.wrapperWidth}
                height={Math.round(size.wrapperWidth / size.aspectRatio)}
                className="h-20 w-full rounded-lg object-contain"
                title={logo.alt}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
