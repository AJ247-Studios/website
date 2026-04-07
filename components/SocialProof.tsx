import PartnersMarquee from "./PartnersMarquee";
const testimonials = [
  {
    id: 1,
    quote: "I usually don't feel comfortable in front of the camera, but somehow they made it really easy. The atmosphere was relaxed and not rushed at all. The photos turned out better than I expected, very natural and not overdone.",
    author: "Lidia",
    role: "Portrait",
    rating: 5,
  },
  {
    id: 2,
    quote: "We're really glad we went with AJ247Studios for our wedding. Nothing felt forced, they just captured everything as it happened. Looking through the photos brought the whole day back — exactly what we wanted.",
    author: "Mark & Roxi",
    role: "Wedding",
    rating: 5,
  },
  {
    id: 3,
    quote: "Worked with them on a few events already and they've been consistent every time. Quick delivery, good communication, and they always manage to catch the key moments. Solid work overall.",
    author: "mjakmalopolska",
    role: "Sports & Press",
    rating: 5,
  },
  {
    id: 4,
    quote: "Super happy with how everything turned out. The session was really chill and I didn't feel awkward at all. You can tell they know what they're doing, and the final photos just speak for themselves.",
    author: "Maja",
    role: "Portrait",
    rating: 5,
  },
  {
    id: 5,
    quote: "Didn't really expect much going in, but I was honestly surprised. The photos came out really clean and natural, nothing looked staged or awkward. They managed to capture the vibe of the night really well. Definitely glad we had them there.",
    author: "Piotr",
    role: "Prom",
    rating: 5,
  },
  {
    id: 6,
    quote: "AJ247Studios worked with us on our recent concert coverage and absolutely nailed it. Every key moment was captured perfectly, from the energy on stage to the crowd reactions. Fast, professional, and the photos are exactly what we needed for our press materials.",
    author: "People Press Agency",
    role: "Concert",
    rating: 5,
  },
];

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
