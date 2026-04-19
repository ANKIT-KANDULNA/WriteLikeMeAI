import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Write Like Me AI",
  description: "Privacy Policy for Write Like Me AI — learn how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="flex-1 w-full flex flex-col bg-slate-50 dark:bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: April 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-400">

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Introduction</h2>
            <p>
              Welcome to <strong>Write Like Me AI</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We are committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account information:</strong> Name and email address when you register.</li>
              <li><strong>Uploaded content:</strong> Handwriting samples you upload to generate fonts. These are used solely to process your request.</li>
              <li><strong>Usage data:</strong> Basic analytics such as pages visited and features used, to improve the service.</li>
              <li><strong>Cookies:</strong> Session cookies to keep you logged in. We do not use tracking or advertising cookies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and operate the Write Like Me AI service.</li>
              <li>To generate personalized handwriting fonts from your uploaded samples.</li>
              <li>To send essential service-related emails (e.g., account verification).</li>
              <li>To improve and maintain the platform.</li>
            </ul>
            <p className="mt-3">We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Data Retention</h2>
            <p>
              Uploaded handwriting samples are processed and may be stored temporarily to serve your generated font. You can delete your account and associated data at any time from your settings page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction or deletion of your data.</li>
              <li>Export your data in a portable format.</li>
            </ul>
            <p className="mt-3">To exercise these rights, please contact us via GitHub at <a href="https://github.com/ANKIT-KANDULNA" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">ANKIT-KANDULNA</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page.
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
