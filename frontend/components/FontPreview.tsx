"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { useFontStore } from "@/store/useFontStore";

const PREVIEW_TEXT =
  "The quick brown fox jumps over the lazy dog\nABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789";

const FONT_NAME = "BestExample";

export function FontPreview() {
  const { fontUrl, fontName, reset } = useFontStore();
  const [loaded, setLoaded] = useState(false);
  const faceRef = useRef<FontFace | null>(null);

  useEffect(() => {
    setLoaded(false);
    const face = new FontFace(FONT_NAME, "url(/fonts/NormalHandwriting-Regular.ttf)");
    faceRef.current = face;
    face.load()
      .then((f) => { document.fonts.add(f); setLoaded(true); })
      .catch(() => setLoaded(true)); // degrade gracefully
    return () => {
      if (faceRef.current) document.fonts.delete(faceRef.current);
    };
  }, []); // load once — font file doesn't change

  if (!fontUrl) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
        {!loaded ? (
          <p className="text-sm text-slate-400 text-center py-8 animate-pulse">
            Loading font preview...
          </p>
        ) : (
          <pre
            className="whitespace-pre-wrap text-2xl leading-relaxed text-slate-800 dark:text-slate-100"
            style={{ fontFamily: `"${FONT_NAME}", cursive` }}
          >
            {PREVIEW_TEXT}
          </pre>
        )}
      </div>

      <div className="flex gap-3">
        <a
          href={fontUrl}
          download={`${fontName.replace(/\s+/g, "_") || "MyHandwriting"}.woff2`}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          Download .woff2
        </a>
        <button
          onClick={reset}
          className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Start over
        </button>
      </div>
    </div>
  );
}