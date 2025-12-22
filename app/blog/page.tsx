import Link from "next/link";

export const metadata = {
  title: "Blog | AJ247 Studios",
  description: "Latest news and insights from AJ247 Studios",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white py-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-slate-400 mb-12">Latest news, tips, and behind-the-scenes content</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for blog posts */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="aspect-video bg-zinc-800 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-slate-500">Coming Soon</span>
            </div>
            <p className="text-slate-400 text-sm mb-2">December 2024</p>
            <h2 className="text-xl font-semibold mb-2">Blog posts coming soon</h2>
            <p className="text-slate-400">
              We&apos;re working on bringing you valuable content about videography, 
              photography, and creative production.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/" className="text-amber-500 hover:text-amber-400">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
