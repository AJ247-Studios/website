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
  const trackARef = useRef<HTMLDivElement | null>(null);
  const trackBRef = useRef<HTMLDivElement | null>(null);
  const xRef = useRef<number>(0);
  const lastTsRef = useRef<number | null>(null);
  const widthRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function measure() {
      const el = trackARef.current;
      if (!el) return;
      widthRef.current = el.offsetWidth;
    }
    measure();

    function onResize() {
      measure();
    }
    window.addEventListener("resize", onResize);

    function step(ts: number) {
      if (lastTsRef.current == null) {
        lastTsRef.current = ts;
      }
      const dt = (ts - lastTsRef.current) / 1000; // seconds
      lastTsRef.current = ts;

      const speed = 60; // px per second
      xRef.current -= speed * dt;

      const w = widthRef.current;
      if (w > 0 && xRef.current <= -w) {
        // reset for seamless loop
        xRef.current += w;
      }

      const a = trackARef.current;
      const b = trackBRef.current;
      if (a && b) {
        a.style.transform = `translateX(${xRef.current}px)`;
        b.style.transform = `translateX(${xRef.current + w}px)`;
      }

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const renderLogos = (dupIndexOffset = 0) => (
    <div className="inline-flex items-center gap-8 sm:gap-12" aria-hidden="false">
      {logos.map((logo, idx) => {
        const style = imageStyles[logo.fileName] || {
          width: 120,
          height: 80,
          className: "h-20 rounded-lg object-contain",
        };
        return (
          <Image
            key={`${logo.src}-${idx + dupIndexOffset}`}
            src={logo.src}
            alt={logo.alt}
            width={style.width}
            height={style.height}
            className={`shrink-0 ${style.className}`}
            title={logo.alt}
          />
        );
      })}
    </div>
  );

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 flex">
        <div ref={trackARef} className="w-max will-change-transform">
          {renderLogos()}
        </div>
        <div ref={trackBRef} className="w-max will-change-transform">
          {renderLogos(logos.length)}
        </div>
      </div>
      {/* Spacer to maintain height */}
      <div className="opacity-0 pointer-events-none">
        {renderLogos()}
      </div>
    </div>
  );
}
