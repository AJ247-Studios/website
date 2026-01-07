import fs from "fs";
import path from "path";
import Image from "next/image";

type PartnerLogo = {
  src: string;
  alt: string;
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
    return { src: `/partners/${file}`, alt };
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
        {loopLogos.map((logo, idx) => (
          <div
            key={`${logo.src}-${idx}`}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0"
            title={logo.alt}
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
