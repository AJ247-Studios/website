import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 404 Graphic */}
        <div className="relative mb-8">
          <div className="text-[150px] sm:text-[200px] font-bold text-slate-200 dark:text-slate-800 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 relative">
              <Image
                src="/portfolio/background_photo.webp"
                alt="Page not found"
                fill
                className="object-cover rounded-full opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Looking for something else?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/portfolio" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Portfolio
            </Link>
            <Link href="/services" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Services
            </Link>
            <Link href="/about" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              About Us
            </Link>
            <Link href="/faq" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
