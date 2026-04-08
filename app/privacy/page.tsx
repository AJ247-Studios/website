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
          <p className="text-slate-500 dark:text-slate-400 mb-8">Last updated: April 2026</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We collect information that you voluntarily provide to us when you create an account, complete a contact form, or communicate with us. This information may include your name, email address, phone number, and any other details you choose to share.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              The information we collect is used to operate, maintain, and improve our services. We may also use your information to communicate with you regarding inquiries, ongoing projects, technical notices, updates, and customer support.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. Information Sharing and Disclosure</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We do not sell, trade, or rent your personal information to third parties. Your information may be shared only when necessary to deliver our services or when required to comply with applicable laws, regulations, or legal processes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. Data Security</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We implement appropriate technical and organizational measures to safeguard your personal information against unauthorized access, disclosure, alteration, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We use cookies and similar technologies to enhance user experience, analyze website traffic, and personalize content. You may manage or disable cookies through your browser settings; however, this may affect certain functionalities of the website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. Your Rights</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              You have the right to access, update, or request deletion of your personal information. To exercise these rights, please contact us using the details provided below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Contact Information</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:
              <br />
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