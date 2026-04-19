import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Write Like Me AI",
  description: "Terms of Service for Write Like Me AI — please read before using our service.",
};

export default function TermsPage() {
  return (
    <div className="flex-1 w-full flex flex-col bg-slate-50 dark:bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: April 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-400">

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Write Like Me AI (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Use of the Service</h2>
            <p>You agree to use Write Like Me AI only for lawful purposes. You must not:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Upload content that violates any applicable law or infringes any third-party rights.</li>
              <li>Attempt to reverse-engineer, hack, or disrupt the Service.</li>
              <li>Use the Service to impersonate another person or create fraudulent documents.</li>
              <li>Upload handwriting samples belonging to someone else without their consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Intellectual Property</h2>
            <p>
              You retain ownership of the handwriting samples you upload. By uploading, you grant us a limited, non-exclusive license to process your samples solely to provide the Service to you.
            </p>
            <p className="mt-3">
              The generated fonts are yours to use for personal and commercial purposes. The Write Like Me AI platform, software, and branding remain the intellectual property of the developer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Account Responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity that occurs under your account. Please notify us immediately of any unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Disclaimers</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or that generated outputs will meet every expectation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Write Like Me AI and its developer shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time from the settings page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">8. Changes to Terms</h2>
            <p>
              We may revise these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">9. Contact</h2>
            <p>
              For any questions about these Terms, please reach out via GitHub:{" "}
              <a href="https://github.com/ANKIT-KANDULNA" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                ANKIT-KANDULNA
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <Link href="/" className="text-indigo-500 hover:underline text-sm">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
