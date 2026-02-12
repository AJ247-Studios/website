import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xNSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
      
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
            <a
              href="https://wa.me/48503685377?text=Hi!%20I'd%20like%20to%20book%20a%20shoot."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Message to Book
            </a>
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
