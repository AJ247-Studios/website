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
  return (
    <div className="marquee-container">
      <div className="marquee-track">
        {/* First set of logos */}
        {logos.map((logo, idx) => {
          const style = imageStyles[logo.fileName] || { width: 120, height: 80, className: "h-20 rounded-lg object-contain" };
          return (
            <div key={`logo-1-${logo.fileName}-${idx}`} className="marquee-item">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={style.width}
                height={style.height}
                className={style.className}
                title={logo.alt}
              />
            </div>
          );
        })}
        {/* Second set of logos (exact copy for seamless loop) */}
        {logos.map((logo, idx) => {
          const style = imageStyles[logo.fileName] || { width: 120, height: 80, className: "h-20 rounded-lg object-contain" };
          return (
            <div key={`logo-2-${logo.fileName}-${idx}`} className="marquee-item">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={style.width}
                height={style.height}
                className={style.className}
                title={logo.alt}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
