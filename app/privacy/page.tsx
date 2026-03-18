import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | AJ247 Studios",
  description: "Privacy policy for AJ247 Studios",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Privacy Policy</h1>
        
        <div>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Last updated: March 2026</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We collect information you provide directly to us, such as when you create an account,
              submit a contact form, or communicate with us. This may include your name, email address,
              phone number, and any other information you choose to provide.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We use the information we collect to provide, maintain, and improve our services,
              communicate with you about projects, and send you technical notices and support messages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. Information Sharing</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except as necessary to provide our services or as required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. Data Security</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We implement appropriate security measures to protect your personal information against
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. Cookies</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We use cookies and similar technologies to enhance your browsing experience, analyze site traffic,
              and personalize content. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. Your Rights</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              You have the right to access, correct, or delete your personal information. Contact us at{" "}
              <a href="mailto:aj247studios@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                aj247studios@gmail.com
              </a>{" "}
              to exercise these rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Contact Us</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:aj247studios@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                aj247studios@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
