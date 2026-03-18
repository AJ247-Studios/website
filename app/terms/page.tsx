import Link from "next/link";

export const metadata = {
  title: "Terms of Service | AJ247 Studios",
  description: "Terms of service for AJ247 Studios",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Terms of Service</h1>
        
        <div>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Last updated: March 2026</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              By accessing and using AJ247 Studios services, you accept and agree to be bound by
              these Terms of Service and our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. Services</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              AJ247 Studios provides videography, photography, and media production services.
              Specific terms for individual projects will be outlined in separate project agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. Intellectual Property</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Unless otherwise agreed in writing, AJ247 Studios retains copyright and ownership of
              all creative work until full payment is received. Upon payment, licensing terms will be
              specified in the project agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. Payment Terms</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Payment terms, including deposits and final payments, will be specified in individual
              project quotes and agreements. Late payments may incur additional fees.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. Cancellation Policy</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Cancellation terms vary by project type and will be outlined in your project agreement.
              Deposits may be non-refundable depending on the circumstances.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. Limitation of Liability</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              AJ247 Studios liability is limited to the amount paid for services. We are not liable
              for any indirect, incidental, or consequential damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Changes to Terms</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective immediately
              upon posting to the website. Your continued use of our services constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">8. Contact Us</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              If you have any questions about these Terms, please contact us at{" "}
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
