import fs from "fs";
import path from "path";
import PartnersMarqueeClient from "./PartnersMarqueeClient";

type PartnerLogo = {
  src: string;
  alt: string;
  fileName: string;
};

// Styles are applied in the client component; server side just passes file names.

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

  // Render client marquee with continuous motion
  return <PartnersMarqueeClient logos={logos} />;
}
