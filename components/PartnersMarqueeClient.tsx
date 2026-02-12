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
  const roRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    let measureRaf: number | null = null;
    const requestMeasure = () => {
      if (measureRaf != null) return;
      measureRaf = requestAnimationFrame(() => {
        const el = trackARef.current;
        if (el) {
          // Use scrollWidth to include offscreen width
          widthRef.current = el.scrollWidth || el.offsetWidth;
        }
        measureRaf && cancelAnimationFrame(measureRaf);
        measureRaf = null;
      });
    };

    requestMeasure();

    function onResize() {
      requestMeasure();
    }
    window.addEventListener("resize", onResize);

    // Observe size changes (e.g., images loading)
    if (typeof ResizeObserver !== "undefined") {
      roRef.current = new ResizeObserver(() => requestMeasure());
      if (trackARef.current) roRef.current.observe(trackARef.current);
    }

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
      if (measureRaf) cancelAnimationFrame(measureRaf);
      if (roRef.current) roRef.current.disconnect();
    };
  }, []);

  const onImgLoad = () => {
    // trigger re-measure when any image finishes loading
    // the ResizeObserver should catch this, but this is an extra nudge
    const el = trackARef.current;
    if (el) {
      widthRef.current = el.scrollWidth || el.offsetWidth;
    }
  };

  const renderLogos = (dupIndexOffset = 0) => (
    <div className="inline-flex items-center" style={{ gap: '3rem' }} aria-hidden="false">
      {logos.map((logo, idx) => {
        const style = imageStyles[logo.fileName] || {
          width: 120,
          height: 80,
          className: "h-20 rounded-lg object-contain",
        };
        return (
          <div key={`${logo.src}-${idx + dupIndexOffset}`} className="shrink-0 flex items-center justify-center" style={{ minWidth: style.width }}>
            <Image
              src={logo.src}
              alt={logo.alt}
              width={style.width}
              height={style.height}
              className={`shrink-0 ${style.className}`}
              title={logo.alt}
              onLoadingComplete={onImgLoad}
            />
          </div>
        );
      })}
      {/* Trailing spacer to maintain gap before loop restart */}
      <div className="shrink-0" style={{ width: '3rem' }} aria-hidden="true" />
    </div>
  );

  return (
    <div className="relative overflow-hidden">
      <div className="relative w-full h-full">
        <div ref={trackARef} className="absolute left-0 top-0 w-max will-change-transform">
          {renderLogos()}
        </div>
        <div ref={trackBRef} className="absolute left-0 top-0 w-max will-change-transform">
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
