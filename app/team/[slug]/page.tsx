import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPersonSchema, getBreadcrumbSchema } from "@/lib/schemas";

// ============================================================================
// TEAM MEMBER DATA (would come from Supabase in production)
// ============================================================================
interface TeamMember {
  slug: string;
  name: string;
  role: string;
  bio: string;
  specialty: string;
  avatar: string;
  coverImage: string;
  portfolio: PortfolioItem[];
  stats: { value: string; label: string }[];
  social?: { website?: string; instagram?: string; canva?: string };
}

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  aspect: "landscape" | "portrait" | "square";
}

const TEAM_MEMBERS: Record<string, TeamMember> = {
  anthony: {
    slug: "anthony",
    name: "Anthony Certeza",
    role: "Co-Founder / All-Around Photographer",
    bio: "Co-founder of AJ247 Studios with 2-3 years of experience in product, lifestyle, and event photography. Anthony manages client liaison, studio setups, and captures stunning stills that tell powerful stories.",
    specialty: "Wedding Photography, Sports Action, Portraits, Corporate Events",
    avatar: "/portfolio/Anthony-full-res.webp",
    coverImage: "/portfolio/background_photo.webp",
    portfolio: [
      { id: "a1", title: "Mark & Roxi Wedding", category: "Wedding", image: "/portfolio/Wedding/20070110_DSC_1186.webp", aspect: "landscape" },
      { id: "a2", title: "Kraków Portraits", category: "Portrait", image: "/portfolio/Portraits/Portrait_pre.webp", aspect: "landscape" },
      { id: "a3", title: "FCA Basketball", category: "Sports", image: "/portfolio/FCA/20251129-DSC_2477-2.webp", aspect: "landscape" },
      { id: "a4", title: "Concert Coverage", category: "Concert", image: "/portfolio/Concert/DSC_5727.webp", aspect: "landscape" },
      { id: "a5", title: "Couples Session", category: "Couples", image: "/portfolio/Couples/DSC_8552.webp", aspect: "landscape" },
      { id: "a6", title: "Motocross Action", category: "Sports", image: "/portfolio/motocross/motocross_pre.webp", aspect: "landscape" },
      { id: "a7", title: "Prom 2026", category: "Events", image: "/portfolio/Prom/20260116-DSC_6507.jpg", aspect: "portrait" },
      { id: "a8", title: "Football Coverage", category: "Sports", image: "/portfolio/football/football_pre.webp", aspect: "landscape" },
    ],
    stats: [
      { value: "100+", label: "Projects" },
      { value: "4,000+", label: "Photos Delivered" },
      { value: "3", label: "Years Experience" },
      { value: "50+", label: "Happy Clients" },
    ],
  },
  josiah: {
    slug: "josiah",
    name: "Josiah Ennis",
    role: "Co-Founder / All-Around Videographer",
    bio: "Co-founder of AJ247 Studios with 2-3 years of experience in commercial video production. Josiah leads videography shoots, handles DOP work, and crafts cinematic final edits that bring stories to life.",
    specialty: "Commercial Video, Wedding Films, Sports Highlights, Corporate Productions",
    avatar: "/portfolio/Josiah-full-res.webp",
    coverImage: "/portfolio/background_photo.webp",
    portfolio: [
      { id: "j1", title: "FCA Practice Highlights", category: "Sports", image: "/portfolio/FCA/20251129-DSC_2477-2.webp", aspect: "landscape" },
      { id: "j2", title: "Concert Film", category: "Concert", image: "/portfolio/Concert/DSC_5727.webp", aspect: "landscape" },
      { id: "j3", title: "Couples Film", category: "Couples", image: "/portfolio/Couples/DSC_8552.webp", aspect: "landscape" },
      { id: "j4", title: "Sports Highlights", category: "Sports", image: "/portfolio/Sports/DSC_6003.webp", aspect: "landscape" },
      { id: "j5", title: "Wedding Film", category: "Wedding", image: "/portfolio/Wedding/20070110_DSC_1186.webp", aspect: "landscape" },
      { id: "j6", title: "Corporate Event", category: "Corporate", image: "/portfolio/football/football_pre.webp", aspect: "landscape" },
    ],
    stats: [
      { value: "80+", label: "Projects" },
      { value: "50+", label: "Hours of Video" },
      { value: "3", label: "Years Experience" },
      { value: "40+", label: "Happy Clients" },
    ],
  },
  ivan: {
    slug: "ivan",
    name: "Ivan Anthony Cabañero",
    role: "Editor",
    bio: "Professional video editor specializing in post-production. Ivan brings raw footage to life with expert editing, color grading, and storytelling. Available for media coverage in the Philippines.",
    specialty: "Video Editing, Color Grading, Post-Production, Motion Graphics",
    avatar: "/portfolio/Ivan-full-res.jpeg",
    coverImage: "/portfolio/background_photo.webp",
    portfolio: [
      { id: "i1", title: "Wedding Edit", category: "Wedding", image: "/portfolio/Wedding/20070110_DSC_1186.webp", aspect: "landscape" },
      { id: "i2", title: "Sports Reel", category: "Sports", image: "/portfolio/Sports/DSC_6003.webp", aspect: "landscape" },
      { id: "i3", title: "Concert Highlights", category: "Concert", image: "/portfolio/Concert/DSC_5727.webp", aspect: "landscape" },
    ],
    stats: [
      { value: "60+", label: "Projects Edited" },
      { value: "2", label: "Years Experience" },
      { value: "30+", label: "Videos Delivered" },
    ],
    social: { canva: "https://navifilms.my.canva.site/" },
  },
  tomek: {
    slug: "tomek",
    name: "Tomek Dudzik",
    role: "Graphic Designer / Editor",
    bio: "Graphic designer and video editor creating stunning visual designs and edits. Tomek brings creativity and precision to every project, from brand design to video post-production.",
    specialty: "Graphic Design, Video Editing, Brand Identity, Visual Effects",
    avatar: "/portfolio/Tomek Dudzik.jpeg",
    coverImage: "/portfolio/background_photo.webp",
    portfolio: [
      { id: "t1", title: "Brand Design", category: "Design", image: "/portfolio/Portraits/Portrait_pre.webp", aspect: "landscape" },
      { id: "t2", title: "Video Edit", category: "Video", image: "/portfolio/Concert/DSC_5727.webp", aspect: "landscape" },
      { id: "t3", title: "Portrait Shoot", category: "Portrait", image: "/portfolio/Portraits/20260328_DSC_0001.webp", aspect: "portrait" },
    ],
    stats: [
      { value: "40+", label: "Designs Created" },
      { value: "2", label: "Years Experience" },
      { value: "25+", label: "Videos Edited" },
    ],
    social: { instagram: "https://www.instagram.com/tstudios.d" },
  },
  diana: {
    slug: "diana",
    name: "Diana Romanova",
    role: "Photographer",
    bio: "Portrait and couples photographer with a natural, emotive style. Diana specializes in capturing genuine connections and beautiful moments between people. Her work brings warmth and authenticity to every shoot.",
    specialty: "Couples Photography, Portrait Sessions, Studio Photography, Lifestyle",
    avatar: "/portfolio/diana/avatar.jpg",
    coverImage: "/portfolio/background_photo.webp",
    portfolio: [
      { id: "d1", title: "Couples Session", category: "Couples", image: "/portfolio/diana/DSC00469.webp", aspect: "landscape" },
      { id: "d2", title: "Portrait Work", category: "Portrait", image: "/portfolio/diana/DSC00557.webp", aspect: "landscape" },
      { id: "d3", title: "Couples Shoot", category: "Couples", image: "/portfolio/diana/DSC00758.webp", aspect: "landscape" },
      { id: "d4", title: "Studio Portrait", category: "Portrait", image: "/portfolio/diana/DSC00781.webp", aspect: "landscape" },
      { id: "d5", title: "Lifestyle Session", category: "Lifestyle", image: "/portfolio/diana/DSC00854.webp", aspect: "landscape" },
      { id: "d6", title: "Couples Photography", category: "Couples", image: "/portfolio/diana/DSC03294.webp", aspect: "landscape" },
      { id: "d7", title: "Portrait Series", category: "Portrait", image: "/portfolio/diana/DSC03305.webp", aspect: "landscape" },
      { id: "d8", title: "Studio Work", category: "Studio", image: "/portfolio/diana/DSC03368.webp", aspect: "landscape" },
      { id: "d9", title: "Couples Portrait", category: "Couples", image: "/portfolio/diana/DSC03731.webp", aspect: "landscape" },
      { id: "d10", title: "Portrait Session", category: "Portrait", image: "/portfolio/diana/DSC03756.webp", aspect: "landscape" },
      { id: "d11", title: "Couples Moments", category: "Couples", image: "/portfolio/diana/DSC03761.webp", aspect: "landscape" },
      { id: "d12", title: "Lifestyle Portrait", category: "Lifestyle", image: "/portfolio/diana/DSC03945.webp", aspect: "landscape" },
      { id: "d13", title: "Studio Session", category: "Studio", image: "/portfolio/diana/DSC04053.webp", aspect: "landscape" },
      { id: "d14", title: "Outdoor Couples", category: "Couples", image: "/portfolio/diana/DSC08000.webp", aspect: "landscape" },
      { id: "d15", title: "Portrait Study", category: "Portrait", image: "/portfolio/diana/DSC08114.webp", aspect: "landscape" },
      { id: "d16", title: "Couples Lifestyle", category: "Couples", image: "/portfolio/diana/DSC08139.webp", aspect: "landscape" },
      { id: "d17", title: "Natural Light", category: "Portrait", image: "/portfolio/diana/DSC08296.webp", aspect: "landscape" },
      { id: "d18", title: "Couples Session", category: "Couples", image: "/portfolio/diana/DSC08300.webp", aspect: "landscape" },
      { id: "d19", title: "Studio Portrait", category: "Studio", image: "/portfolio/diana/DSC08323.webp", aspect: "landscape" },
      { id: "d20", title: "Lifestyle Shoot", category: "Lifestyle", image: "/portfolio/diana/DSC08366.webp", aspect: "landscape" },
      { id: "d21", title: "Couples Photography", category: "Couples", image: "/portfolio/diana/DSC08825.webp", aspect: "landscape" },
      { id: "d22", title: "Portrait Collection", category: "Portrait", image: "/portfolio/diana/DSC08867.webp", aspect: "landscape" },
      { id: "d23", title: "Couples Portrait", category: "Couples", image: "/portfolio/diana/DSC08916.webp", aspect: "landscape" },
    ],
    stats: [
      { value: "50+", label: "Sessions" },
      { value: "3+", label: "Years Experience" },
      { value: "2,000+", label: "Photos Delivered" },
      { value: "40+", label: "Happy Clients" },
    ],
  },
};

// ============================================================================
// METADATA GENERATOR
// ============================================================================
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const member = TEAM_MEMBERS[slug];
  if (!member) return { title: "Not Found | AJ247 Studios" };

  return {
    title: `${member.name} — ${member.role} | AJ247 Studios`,
    description: member.bio,
  };
}

export async function generateStaticParams() {
  return Object.keys(TEAM_MEMBERS).map((slug) => ({ slug }));
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================
export default async function TeamMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = TEAM_MEMBERS[slug];

  if (!member) {
    notFound();
  }

  const personSchema = getPersonSchema({
    name: member.name,
    role: member.role,
    bio: member.bio,
    image: member.avatar,
    url: `/team/${member.slug}`,
  });

  const teamBreadcrumb = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
    { name: member.name, url: `/team/${member.slug}` },
  ]);

  return (
    <main>
      {/* JSON-LD Structured Data — Person + Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            { "@context": "https://schema.org", ...teamBreadcrumb },
            { "@context": "https://schema.org", ...personSchema },
          ]),
        }}
      />

      {/* Hero */}
      <section className="relative">
        {/* Cover image */}
        <div className="h-48 sm:h-64 lg:h-80 relative overflow-hidden">
          <Image
            src={member.coverImage}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
        </div>

        {/* Profile info */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-20 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 shadow-xl shrink-0">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>

              {/* Info */}
              <div className="flex-1 pt-2 sm:pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{member.name}</h1>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{member.role}</p>
              </div>

              {/* CTA */}
              <div className="flex gap-3 shrink-0">
                <Link
                  href={`/book?employee=${member.slug}`}
                  className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  Book Now
                </Link>
                {member.social?.website && (
                  <a
                    href={member.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Website
                  </a>
                )}
                {member.social?.instagram && (
                  <a
                    href={member.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {member.social?.canva && (
                  <a
                    href={member.social.canva}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio & Stats */}
      <section className="py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Bio */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">About</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{member.bio}</p>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Specialty</h2>
                <p className="text-slate-600 dark:text-slate-400">{member.specialty}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                {member.stats.map((stat) => (
                  <div key={stat.label} className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Selected work by {member.name}</p>
            </div>
          </div>

          {member.slug === "diana" ? (
            /* Pinterest-style masonry layout for Diana */
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {member.portfolio.map((item) => (
                <div
                  key={item.id}
                  className="group relative break-inside-avoid overflow-hidden cursor-pointer"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <div className="text-white text-sm font-medium truncate">{item.title}</div>
                    <div className="text-white/70 text-xs">{item.category}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Standard grid layout for other team members */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {member.portfolio.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <div className="text-white text-sm font-medium truncate">{item.title}</div>
                    <div className="text-white/70 text-xs">{item.category}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Want to Work With {member.name.split(" ")[0]}?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
            Book {member.name.split(" ")[0]} for your next project. Check availability and get a personalized quote.
          </p>
          <Link
            href={`/book?employee=${member.slug}`}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Book {member.name.split(" ")[0]} Now
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
