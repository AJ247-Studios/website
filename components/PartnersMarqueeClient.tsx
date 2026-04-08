"use client";
import Image from "next/image";

type PartnerLogo = {
  src: string;
  alt: string;
  fileName: string;
};

export default function PartnersMarqueeClient({ logos }: { logos: PartnerLogo[] }) {
  return (
    <div className="marquee-container">
      <div className="marquee-track">
        {logos.map((logo, idx) => (
          <div key={`logo-1-${idx}`} className="marquee-item">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={200}
              height={120}
              className="h-[120px] w-auto object-contain"
              title={logo.alt}
            />
          </div>
        ))}
        {logos.map((logo, idx) => (
          <div key={`logo-2-${idx}`} className="marquee-item">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={200}
              height={120}
              className="h-[120px] w-auto object-contain"
              title={logo.alt}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
