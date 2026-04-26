"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, Feather, AlertCircle } from "lucide-react";
import { useFontStore } from "@/store/useFontStore";
import { CharacterGrid } from "@/components/CharacterGrid";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ["Upload", "Verify", "Preview"];
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${i < current
              ? "bg-indigo-600 text-white"
              : i === current
                ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={`text-sm font-medium ${i === current
              ? "text-slate-900 dark:text-white"
              : "text-slate-400"
              }`}
          >
            {label}
          </span>
          {i < steps.length - 1 && (
            <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Upload Step ───────────────────────────────────────────────────────────────
function UploadStep() {
  const {
    file, setFile,
    fontName, setFontName,
    thickness, setThickness,
    setStep, setSegmentResult,
    isLoading, setLoading,
    error, setError,
  } = useFontStore();

  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setError(null);
  }, [setFile, setError]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/proxy-segment`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data.detail ?? `Processing failed (${res.status})`);
      setSegmentResult(data.session_id, data.characters);
      setStep("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${isDragging
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
          : file
            ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/10"
            : "border-slate-300 dark:border-slate-600 hover:border-slate-400"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <UploadCloud className={`w-10 h-10 ${file ? "text-indigo-500" : "text-slate-400"}`} />
        {file ? (
          <div className="text-center">
            <p className="font-semibold text-slate-800 dark:text-slate-100">{file.name}</p>
            <p className="text-sm text-slate-500 mt-1">Click to change file</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Drop your handwriting image here
            </p>
            <p className="text-sm text-slate-400 mt-1">PNG or JPG — clear, separated characters on plain background</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Font name</label>
          <input
            type="text"
            value={fontName}
            suppressHydrationWarning
            onChange={(e) => setFontName(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 dark:text-white"
            placeholder="MyHandwriting"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Stroke thickness</label>
          <input
            type="number"
            value={thickness}
            suppressHydrationWarning
            onChange={(e) => setThickness(Number(e.target.value))}
            min={50} max={300}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 dark:text-white"
          />
        </div>
      </div>

      <div className="flex gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
        <span className="text-green-600 font-semibold shrink-0">✓ Good:</span>
        Clear, separated characters, plain white background
        <span className="text-red-500 font-semibold shrink-0 ml-2">✗ Bad:</span>
        Lined paper, connected script, cluttered background
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleProcess}
        disabled={!file || isLoading}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
      >
        {isLoading ? (
          <><Loader2 className="w-5 h-5 animate-spin" />Detecting characters…</>
        ) : (
          <><Feather className="w-5 h-5" />Process Image</>
        )}
      </button>
    </div>
  );
}

// ── Verify Step ───────────────────────────────────────────────────────────────
function VerifyStep() {
  const router = useRouter();
  const {
    characters, sessionId,
    fontName, thickness,
    setStep, setFontResult,
    isLoading, setLoading,
    error, setError,
  } = useFontStore();

  const handleBuild = async () => {
    if (!sessionId || characters.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy-build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          characters: characters.map((c) => ({ id: c.id, label: c.label, image_b64: c.image_b64 })),
          font_name: fontName,
          thickness,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? "Font generation failed");
      }

      const data = await res.json();

      // Prefer stable public URLs (persisted by backend), fall back to base64 blobs.
      const ttfPublicUrl: string | null = data.ttf_url ?? null;
      const woff2PublicUrl: string | null = data.woff2_url ?? null;

      const ttfUrl =
        ttfPublicUrl ??
        (data.ttf_b64 ? URL.createObjectURL(
          new Blob([Uint8Array.from(atob(data.ttf_b64), (c) => c.charCodeAt(0))], { type: "font/ttf" })
        ) : "");

      const woff2Url =
        woff2PublicUrl ??
        (data.woff2_b64 ? URL.createObjectURL(
          new Blob([Uint8Array.from(atob(data.woff2_b64), (c) => c.charCodeAt(0))], { type: "font/woff2" })
        ) : ttfUrl);

      setFontResult({
        fontName: data.font_name,
        safeName: data.safe_name,
        ttfB64: data.ttf_b64,
        woff2B64: data.woff2_b64,
        ttfUrl,
        woff2Url,
        fontId: data.font_id ?? null,
        ttfPublicUrl,
        woff2PublicUrl,
      });

      // Navigate to preview page with the font ID
      router.push(`/create/preview/${data.font_id}`);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">Verify characters</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {characters.length} characters detected · drag to reorder · click label to correct · hover to remove
          </p>
        </div>
        <button
          onClick={() => setStep("upload")}
          className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          ← Re-upload
        </button>
      </div>

      <CharacterGrid />

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleBuild}
        disabled={isLoading || characters.length === 0}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
      >
        {isLoading ? (
          <><Loader2 className="w-5 h-5 animate-spin" />Building font…</>
        ) : (
          <><Feather className="w-5 h-5" />Generate & Preview Font</>
        )}
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CreatePage() {
  const { step } = useFontStore();
  const stepIndex = step === "upload" ? 0 : step === "verify" ? 1 : 2;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-black font-sans">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Steps current={stepIndex} />
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          {step === "upload" && <UploadStep />}
          {step === "verify" && <VerifyStep />}
        </div>
      </div>
    </main>
  );
}