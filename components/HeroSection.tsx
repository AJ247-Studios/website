import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-900">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/portfolio/background_photo.webp"
        >
          <source src="/portfolio/F_Weddings_ShowCase_720p@24fps.mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-900/70"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="text-center max-w-4xl mx-auto">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-slate-300 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Kraków-based media studio
          </div>

          {/* Main headline - benefit-focused per research */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
            Cinematic Video &
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
              Commercial Photography
            </span>
          </h1>

          {/* Value proposition - addresses "why choose us" */}
          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            We combine creative direction, professional gear, and fast turnarounds — 
            so small businesses and creators get polished, on-brand media that converts.
          </p>

          {/* Dual CTAs - different user stages per research */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/book"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Us
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-200"
            >
              View Our Work
            </Link>
          </div>

          {/* Quick stats - social proof per research */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto pt-8 border-t border-white/10">
            <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">150+</div>
              <div className="text-sm text-slate-400">Projects Delivered</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">48h</div>
              <div className="text-sm text-slate-400">Fast Delivery</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">4000+</div>
              <div className="text-sm text-slate-400">Photos & Clips</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white dark:from-slate-950 to-transparent"></div>
    </section>
  );
}
