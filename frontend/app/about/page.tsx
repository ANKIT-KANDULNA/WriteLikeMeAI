import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Cpu, FilePenLine, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Write Like Me AI",
  description: "Learn about the advanced AI technology behind Write Like Me, designed to faithfully replicate your unique handwriting style.",
};

export default function AboutPage() {
  return (
    <div className="flex-1 w-full flex flex-col bg-slate-50 dark:bg-black overflow-hidden relative">
      {/* Decorative background gradients */}
      <div className="absolute inset-0 top-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent dark:from-indigo-900/10 opacity-80 pointer-events-none"></div>
      <div className="absolute inset-0 top-0 z-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-100/40 via-transparent to-transparent dark:from-pink-900/10 opacity-80 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            The Technology Behind{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 font-caveat font-normal whitespace-nowrap">
              Write Like Me
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We believe that digital text shouldn't mean losing the personal touch. Our mission is to bridge the gap between efficiency and authenticity.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Calibration Grid</h3>
            <p className="text-slate-600 dark:text-slate-400">
              We leverage state-of-the-art AI vision models to analyze your uploaded handwriting, understanding your exact slant, kerning, and stroke pressure.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-6 text-pink-600 dark:text-pink-400">
              <FilePenLine className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Human-like Variances</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Nobody writes a letter identically twice. The advanced generative APIs we integrate inject natural stochastic variance so your documents look uniquely handwritten.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Privacy First</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your handwriting model is uniquely yours. We employ strict encryption and never use your stylistic models to train our broader algorithms.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Our Story</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Write Like Me began with a simple idea: could we perfectly replicate the aesthetic charm of human lettering using modern technology? By connecting with industry-leading AI models, we've built a platform that translates your text out of sterile computer fonts and brings it directly into the warmth of your own handwriting. We handle the complex API integrations so you can focus on creating beautiful, personalized notes.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Try It Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
