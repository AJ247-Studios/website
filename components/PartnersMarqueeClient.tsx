"use client";
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
  // Create two identical sets - the animation will move the first set off-screen
  // and the second set will seamlessly take its place
  const firstSet = logos.map((logo, idx) => (
    <div key={`first-${logo.fileName}-${idx}`} className="marquee-item">
      <Image
        src={logo.src}
        alt={logo.alt}
        width={imageStyles[logo.fileName]?.width || 120}
        height={imageStyles[logo.fileName]?.height || 80}
        className={imageStyles[logo.fileName]?.className || "h-20 rounded-lg object-contain"}
        title={logo.alt}
      />
    </div>
  ));

  const secondSet = logos.map((logo, idx) => (
    <div key={`second-${logo.fileName}-${idx}`} className="marquee-item">
      <Image
        src={logo.src}
        alt={logo.alt}
        width={imageStyles[logo.fileName]?.width || 120}
        height={imageStyles[logo.fileName]?.height || 80}
        className={imageStyles[logo.fileName]?.className || "h-20 rounded-lg object-contain"}
        title={logo.alt}
      />
    </div>
  ));

  return (
    <div className="overflow-hidden">
      <div className="marquee-track">
        <div className="marquee-content">
          {firstSet}
        </div>
        <div className="marquee-content">
          {secondSet}
        </div>
      </div>
    </div>
  );
}
