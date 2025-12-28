import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | AJ247 Studios",
  description: "Privacy policy for AJ247 Studios",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-400 mb-6">Last updated: December 2024</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-slate-300 mb-4">
              We collect information you provide directly to us, such as when you create an account,
              submit a contact form, or communicate with us. This may include your name, email address,
              phone number, and any other information you choose to provide.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-300 mb-4">
              We use the information we collect to provide, maintain, and improve our services,
              communicate with you about projects, and send you technical notices and support messages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p className="text-slate-300 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except as necessary to provide our services or as required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-slate-300 mb-4">
              We implement appropriate security measures to protect your personal information against
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
            <p className="text-slate-300 mb-4">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:aj247studios@gmail.com" className="text-amber-500 hover:text-amber-400">
                aj247studios@gmail.com
              </a>
            </p>
          </section>
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
