"use client";

import { motion } from "framer-motion";

function PipelineCard({
  title,
  subtitle,
  colorClass,
  borderClass,
  delay = 0,
}: {
  title: string;
  subtitle: string | string[];
  colorClass: string;
  borderClass: string;
  delay?: number;
}) {
  const lines = Array.isArray(subtitle) ? subtitle : [subtitle];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay }}
      className={`rounded-xl border ${borderClass} ${colorClass} px-4 py-3 md:px-5 md:py-4 flex flex-col gap-1 min-w-[140px] sm:min-w-[160px] flex-1`}
    >
      <span className="font-bold text-xs md:text-base text-white leading-tight">{title}</span>
      {lines.map((l, i) => (
        <span key={i} className="text-[10px] md:text-xs text-white/70 leading-snug">{l}</span>
      ))}
    </motion.div>
  );
}

function Arrow({ vertical = false, className = "" }: { vertical?: boolean; className?: string }) {
  return (
    <div className={`flex items-center justify-center ${vertical ? "py-1" : "px-1"} ${className}`}>
      {vertical ? (
        <svg width="16" height="28" viewBox="0 0 16 28" fill="none">
          <path d="M8 0v22M2 16l6 10 6-10" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
          <path d="M0 8h22M16 2l10 6-10 6" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="hidden lg:flex items-center justify-center">
      <span
        className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        {label}
      </span>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            A complete AI pipeline — from your handwriting photo to a beautifully rendered, exportable page.
          </motion.p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111111] p-5 md:p-10 shadow-xl dark:shadow-none overflow-hidden">

          {/* ROW 1: INPUT */}
          <div className="flex items-stretch gap-2 mb-3">
            <SectionLabel label="Input" />
            <div className="flex flex-1 flex-col sm:flex-row items-stretch gap-3">
              <PipelineCard title="Handwriting sample" subtitle="Upload image / photo" colorClass="bg-teal-700/80 dark:bg-teal-800/60" borderClass="border-teal-600/60" delay={0} />
              <PipelineCard title="User prompt" subtitle="Topic + AI model" colorClass="bg-indigo-600/80 dark:bg-indigo-700/60" borderClass="border-indigo-500/60" delay={0.1} />
              <PipelineCard title="Dev config" subtitle="Page type + rules" colorClass="bg-slate-600/80 dark:bg-slate-700/60" borderClass="border-slate-500/60" delay={0.2} />
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="hidden lg:block w-6" />
            <div className="flex flex-1 justify-around">
              <div className="hidden sm:flex flex-1 justify-around">
                <Arrow vertical /><Arrow vertical /><Arrow vertical />
              </div>
              <div className="flex sm:hidden w-full justify-center"><Arrow vertical /></div>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-200 dark:border-slate-700 mb-3" />

          {/* ROW 2: PROCESSING */}
          <div className="flex items-stretch gap-2 mb-3">
            <SectionLabel label="Processing" />
            <div className="flex flex-1 flex-col sm:flex-row items-stretch gap-3">
              <PipelineCard title="Style extractor" subtitle={["Claude Vision API", "slant · size · spacing"]} colorClass="bg-teal-700/80 dark:bg-teal-800/60" borderClass="border-teal-600/60" delay={0.15} />
              <PipelineCard title="Text generator" subtitle={["GPT / Claude / DeepSeek", "Returns paragraph"]} colorClass="bg-indigo-600/80 dark:bg-indigo-700/60" borderClass="border-indigo-500/60" delay={0.25} />
              <PipelineCard title="Layout engine" subtitle={["Page margins, line", "grid, start position"]} colorClass="bg-slate-600/80 dark:bg-slate-700/60" borderClass="border-slate-500/60" delay={0.35} />
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="hidden lg:block w-6" />
            <div className="flex flex-1 justify-around">
              <div className="hidden sm:flex flex-1 justify-around">
                <Arrow vertical /><Arrow vertical /><Arrow vertical />
              </div>
              <div className="flex sm:hidden w-full justify-center"><Arrow vertical /></div>
            </div>
          </div>

          {/* CANVAS RENDERER */}
          <div className="flex gap-2 mb-3">
            <div className="hidden lg:block w-6" />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex-1 rounded-xl border border-amber-600/60 bg-amber-700/80 dark:bg-amber-800/60 px-6 py-5 text-center"
            >
              <p className="font-bold text-white text-sm md:text-lg mb-1">Canvas renderer</p>
              <p className="text-amber-100/80 text-[10px] md:text-sm">Applies style params · places glyphs · injects human errors</p>
            </motion.div>
          </div>

          <div className="flex gap-2 mb-3 justify-center"><Arrow vertical /></div>
          <div className="border-t border-dashed border-slate-200 dark:border-slate-700 mb-6 sm:mb-3" />

          {/* ROW 3: OUTPUT */}
          <div className="flex items-stretch gap-2">
            <SectionLabel label="Output" />
            <div className="flex flex-1 flex-col gap-3">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.35 }}
                className="rounded-xl border border-rose-700/50 bg-rose-800/30 dark:bg-rose-900/20 px-4 py-3 md:px-5 md:py-3 text-center"
              >
                <span className="font-bold text-white text-sm md:text-lg">Generated handwritten page</span>
              </motion.div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <PipelineCard title="Page types" subtitle={["plain · lined", "grid · dotted", "(dev input)"]} colorClass="bg-rose-800/60 dark:bg-rose-900/40" borderClass="border-rose-700/50" delay={0.4} />
                <PipelineCard title="Positioning" subtitle={["start · middle", "end of page", "margin offsets"]} colorClass="bg-rose-800/60 dark:bg-rose-900/40" borderClass="border-rose-700/50" delay={0.5} />
                <PipelineCard title="Human errors" subtitle={["strikethrough", "scribble blobs", "letter cuts"]} colorClass="bg-rose-800/60 dark:bg-rose-900/40" borderClass="border-rose-700/50" delay={0.6} />
                <PipelineCard title="Export" subtitle={["PNG / PDF", "SVG canvas", "download"]} colorClass="bg-rose-800/60 dark:bg-rose-900/40" borderClass="border-rose-700/50" delay={0.7} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}