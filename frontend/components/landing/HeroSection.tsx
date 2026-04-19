"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";

export function HeroSection() {
  const { status } = useSession();

  return (
    <section className="w-full relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden flex flex-col items-center">
      {/* Decorative background gradients */}
      <div className="absolute inset-0 top-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-transparent to-transparent dark:from-indigo-900/20 opacity-60"></div>
      <div className="absolute inset-0 top-0 z-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-100 via-transparent to-transparent dark:from-pink-900/20 opacity-60"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 mb-8"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Powered by advanced AI models</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 max-w-4xl mx-auto leading-tight"
        >
          Your words, written in{" "}
          <span className="inline-block whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 font-caveat font-normal">
            your handwriting
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto"
        >
          Upload a photo of your handwriting. Our AI extracts your style — slant, size, spacing — then writes anything you want. Export as PNG or PDF.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href={status === "authenticated" ? "/create" : "/register"}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
          >
            Start Generating
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-lg hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-center"
          >
            See how it works
          </Link>
        </motion.div>

        {/* Dashboard Preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 mx-auto max-w-5xl relative"
        >
          <div
            className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-black via-transparent to-transparent z-10"
            style={{ bottom: 0, top: "auto", height: "40%" }}
          ></div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-2 shadow-2xl relative overflow-hidden">
            <div className="aspect-[16/9] md:aspect-[21/9] bg-slate-100 dark:bg-black rounded-xl overflow-hidden relative flex">
              <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 p-6 hidden md:block">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                <div className="h-20 w-full bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                <div className="h-10 w-full bg-indigo-500/20 rounded border border-indigo-500/50"></div>
              </div>
              <div className="flex-1 bg-paper-lined p-8 flex items-center justify-center opacity-80 backdrop-blur-md">
                <span className="font-caveat text-4xl text-slate-800 rotate-[-2deg]">
                  Generating perfection...
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}