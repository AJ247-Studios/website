import PartnersMarquee from "./PartnersMarquee";
const testimonials = [
  {
    id: 1,
    quote: "The video was really good! AJ247 Studios captured our special day perfectly and exceeded all our expectations.",
    author: "Paul & Precious",
    role: "Wedding, Kraków",
    rating: 5,
  },
  {
    id: 2,
    quote: "We had the opportunity to work with AJ247 Studios on several sports projects, and I’m fully satisfied with the results. With every video, I could see clear progress, and the final outcomes were excellent. These young talents are doing a great job.",
    author: "Dima",
    role: "FCA Krakow, Poland",
    rating: 5,

  },];

// Deprecated placeholder; replaced by dynamic marquee from /public/partners

export default function SocialProof() {
  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Trusted by Kraków&apos;s Best
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            From sports teams to Fortune 500 companies, we deliver results that speak for themselves.
          </p>
        </div>

        {/* Client logos marquee from /public/partners */}
        <div className="mb-16">
          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8">
            Trusted by leading organizations
          </p>
          <PartnersMarquee />
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700"
            >
              {/* Quote mark */}
              <div className="absolute top-6 right-6 text-slate-200 dark:text-slate-700">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Rating stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">
                    {testimonial.author}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar - updated to match site copy */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 py-10 px-8 bg-linear-to-r from-blue-600 to-emerald-600 rounded-2xl text-white">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold mb-1">150+</div>
            <div className="text-blue-100 text-sm">Projects Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold mb-1">150+</div>
            <div className="text-blue-100 text-sm">Satisfied Clients</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold mb-1">4000+</div>
            <div className="text-blue-100 text-sm">Photos Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold mb-1">50+</div>
            <div className="text-blue-100 text-sm">Hours of Video</div>
          </div>
        </div>
      </div>
    </section>
  );
}
