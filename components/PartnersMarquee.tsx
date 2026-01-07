import fs from "fs";
import path from "path";
import Image from "next/image";

type PartnerLogo = {
  src: string;
  alt: string;
  fileName: string;
};

// Custom styles per image file
const imageStyles: Record<string, { width: number; height: number; className: string }> = {
  "B.webp": { width: 80, height: 80, className: "w-20 h-20 rounded-full object-cover" },
  "No-press-studio.webp": { width: 184, height: 80, className: "h-20 rounded-lg object-contain" },
  "People's-Press.webp": { width: 142, height: 80, className: "h-20 rounded-lg object-contain" },
  "Poland-Sports-Gazette.webp": { width: 142, height: 80, className: "h-20 rounded-lg object-contain" },
  "Realtime.webp": { width: 80, height: 80, className: "w-20 h-20 rounded-full object-cover" },
  "Resilience.webp": { width: 160, height: 80, className: "h-20 rounded-lg object-contain" },
  "The-red-light.webp": { width: 80, height: 80, className: "w-20 h-20 rounded-full object-cover" },
};

function getPartnerLogos(): PartnerLogo[] {
  const partnersDir = path.join(process.cwd(), "public", "partners");

  if (!fs.existsSync(partnersDir)) return [];

  const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

  const files = fs
    .readdirSync(partnersDir)
    .filter((f) => allowed.has(path.extname(f).toLowerCase()));

  return files.map((file) => {
    const name = path.parse(file).name.replace(/[-_]+/g, " ");
    const alt = name.trim().length ? name.trim() : "Partner logo";
    return { src: `/partners/${file}`, alt, fileName: file };
  });
}

export default function PartnersMarquee() {
  const logos = getPartnerLogos();

  if (logos.length === 0) {
    return (
      <div className="text-center text-slate-400 dark:text-slate-500 text-sm">
        Add partner logos to /public/partners to display here.
      </div>
    );
  }

  // Duplicate the list for seamless looping
  const loopLogos = [...logos, ...logos];

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex items-center gap-8 sm:gap-12 animate-marquee will-change-transform"
        aria-hidden="false"
      >
        {loopLogos.map((logo, idx) => {
          const style = imageStyles[logo.fileName] || { 
            width: 120, 
            height: 80, 
            className: "h-20 rounded-lg object-contain" 
          };
          
          return (
            <Image
              key={`${logo.src}-${idx}`}
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
    </div>
  );
}
