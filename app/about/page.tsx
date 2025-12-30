import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us | AJ247 Studios",
  description: "Meet the team behind AJ247 Studios. Premium photo and video production in Kraków, Poland. Learn about our story, values, and what makes us different.",
};

const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "50+", label: "Happy Clients" },
  { value: "1000+", label: "Photos & Clips Delivered" },
  { value: "3", label: "Team Members" },
];

const values = [
  {
    title: "Quality First",
    description: "We never compromise on quality. Every photo is carefully edited, every video is thoughtfully crafted.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: "Fast Delivery",
    description: "We understand you're excited to see your photos. That's why we offer 48-hour priority delivery on most packages.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Client Focused",
    description: "Your vision is our priority. We listen, adapt, and deliver exactly what you need — often exceeding expectations.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: "Transparent Pricing",
    description: "No hidden fees, no surprises. Our pricing is clear and competitive with the Kraków market.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const team = [
  {
    name: "Josiah Ennis",
    role: "Videographer / Co-founder",
    bio: "2–3 years experience. Lead videographer for commercial shoots and social-video campaigns. Shot planning, DOP, final edit.",
    image: "/portfolio/Josiah-full-res.webp",
  },
  {
    name: "Anthony Certeza",
    role: "Photographer / Co-founder",
    bio: "2–3 years experience. Stills photographer focused on product, lifestyle, and event photography. Client liaison, studio setups.",
    image: "/portfolio/Anthony-full-res.webp",
  },
  {
    name: "Szymon Flak",
    role: "Videographer & Photographer",
    bio: "4–5 years experience. Senior shooter handling complex shoots for sports and photoshoots. Secondary DOP, lighting and color workflows, main editor.",
    image: "/portfolio/Szymon-full-res.webp",
  },
];

const equipment = [
  "Lumix GH5 — Cinematic 4K, main cinema body",
  "Nikon D500 — Sports & action",
  "Nikon D3 — Professional stills",
  "Nikon D7000 — Versatile backup",
  "Sony A6000 — Compact & travel",
  "Mixed new & well-maintained used gear",
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                We Capture Moments
                <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-emerald-500">
                  That Matter
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                AJ247 Studios is a Kraków-based media studio specializing in cinematic video and 
                commercial photography for brands, events, and creators. We combine creative direction, 
                professional gear, and fast turnarounds so small businesses and creators get polished, 
                on-brand media that actually converts. Founded and run by a small, experienced team — 
                we manage production from shot-list to final edit.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/portfolio"
                  className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  View Our Work
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
            
            {/* Image placeholder */}
            <div className="relative">
              <div className="aspect-4/3 rounded-2xl bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              {/* Floating stat */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">50+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Projects Delivered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-slate-900 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                AJ247 Studios was founded to bring professional, cinematic-quality media production 
                to brands, events, and creators in Kraków — without the corporate price tag.
              </p>
              <p>
                We&apos;re a small team of videographers and photographers who handle every project 
                from creative direction to final delivery. Quick local shoots, pro editing, fast turnarounds.
              </p>
              <p>
                Our name reflects our commitment: we&apos;re dedicated to capturing your most 
                important moments and delivering results that exceed expectations.
              </p>
              <p className="text-slate-500 dark:text-slate-500 italic">
                Want the real numbers? Ask for our portfolio pack — we&apos;ll send case studies and raw+edited samples.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              What We Stand For
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Our values guide everything we do, from the first consultation to final delivery.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  {value.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              The creative minds behind your photos and videos.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-slate-400 dark:text-slate-500">
                      {member.name.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                  {member.role}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Professional Equipment
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                We invest in the best gear to deliver the best results. Our equipment lineup 
                includes industry-standard cameras, lenses, lighting, and drones.
              </p>
              <ul className="grid grid-cols-2 gap-3">
                {equipment.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Equipment image */}
            <div className="aspect-video rounded-2xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
              <Image
                src="/portfolio/background_photo.webp"
                alt="Equipment background"
                width={1280}
                height={720}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-12 lg:p-16 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Work Together?
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Let&apos;s create something amazing. Get in touch for a free consultation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 bg-white rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Get a Free Quote
                </Link>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-colors"
                >
                  View Portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
