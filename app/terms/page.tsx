import Link from "next/link";

export const metadata = {
  title: "Terms of Service | AJ247 Studios",
  description: "Terms of service for AJ247 Studios",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-400 mb-6">Last updated: December 2024</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-300 mb-4">
              By accessing and using AJ247 Studios services, you accept and agree to be bound by
              these Terms of Service and our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Services</h2>
            <p className="text-slate-300 mb-4">
              AJ247 Studios provides videography, photography, and media production services.
              Specific terms for individual projects will be outlined in separate project agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Intellectual Property</h2>
            <p className="text-slate-300 mb-4">
              Unless otherwise agreed in writing, AJ247 Studios retains copyright and ownership of
              all creative work until full payment is received. Upon payment, licensing terms will be
              specified in the project agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
            <p className="text-slate-300 mb-4">
              Payment terms, including deposits and final payments, will be specified in individual
              project quotes and agreements. Late payments may incur additional fees.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Cancellation Policy</h2>
            <p className="text-slate-300 mb-4">
              Cancellation terms vary by project type and will be outlined in your project agreement.
              Deposits may be non-refundable depending on the circumstances.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-slate-300 mb-4">
              AJ247 Studios liability is limited to the amount paid for services. We are not liable
              for any indirect, incidental, or consequential damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="text-slate-300 mb-4">
              If you have any questions about these Terms, please contact us at{" "}
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
