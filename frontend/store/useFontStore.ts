import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CharacterItem {
  id: string;
  label: string;
  image_b64: string;
}

export interface FontResult {
  fontName: string;
  safeName: string;
  ttfB64: string;    // for .ttf download
  woff2B64: string;  // for browser preview
  woff2Url: string;  // object URL created from woff2B64
  ttfUrl: string;    // object URL created from ttfB64
  ttfPublicUrl?: string | null;   // stable URL served by Next.js (if provided)
  woff2PublicUrl?: string | null; // stable URL served by Next.js (if provided)
  fontId?: string | null;
}

type Step = "upload" | "verify" | "preview";

interface FontStore {
  step: Step;
  setStep: (s: Step) => void;

  file: File | null;
  setFile: (f: File | null) => void;
  fontName: string;
  setFontName: (n: string) => void;
  thickness: number;
  setThickness: (t: number) => void;

  sessionId: string | null;
  characters: CharacterItem[];
  setSegmentResult: (sessionId: string, chars: CharacterItem[]) => void;

  updateLabel: (id: string, label: string) => void;
  removeCharacter: (id: string) => void;
  moveCharacter: (fromIdx: number, toIdx: number) => void;

  // Font result — holds both formats
  fontResult: FontResult | null;
  setFontResult: (result: FontResult) => void;

  isLoading: boolean;
  setLoading: (v: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;

  reset: () => void;
}

export const useFontStore = create<FontStore>()(
  persist(
    (set, get) => ({
  step: "upload",
  setStep: (s) => set({ step: s }),

  file: null,
  setFile: (f) => set({ file: f }),
  fontName: "MyHandwriting",
  setFontName: (n) => set({ fontName: n }),
  thickness: 100,
  setThickness: (t) => set({ thickness: t }),

  sessionId: null,
  characters: [],
  setSegmentResult: (sessionId, chars) => set({ sessionId, characters: chars }),

  updateLabel: (id, label) =>
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === id ? { ...c, label } : c
      ),
    })),
  removeCharacter: (id) =>
    set((state) => ({
      characters: state.characters.filter((c) => c.id !== id),
    })),
  moveCharacter: (fromIdx, toIdx) =>
    set((state) => {
      const chars = [...state.characters];
      const [moved] = chars.splice(fromIdx, 1);
      chars.splice(toIdx, 0, moved);
      return { characters: chars };
    }),

  fontResult: null,
  setFontResult: (result) => set({ fontResult: result }),

  isLoading: false,
  setLoading: (v) => set({ isLoading: v }),
  error: null,
  setError: (e) => set({ error: e }),

  reset: () => {
    // Revoke any existing object URLs to free memory
    const { fontResult } = get();
    if (fontResult?.woff2Url) URL.revokeObjectURL(fontResult.woff2Url);
    if (fontResult?.ttfUrl) URL.revokeObjectURL(fontResult.ttfUrl);

    set({
      step: "upload",
      file: null,
      sessionId: null,
      characters: [],
      fontResult: null,
      isLoading: false,
      error: null,
    });
  },
}),
    {
      name: "write-like-me-font-store",
      partialize: (state) => ({
        fontName: state.fontName,
        thickness: state.thickness,
        fontResult: state.fontResult,
      }),
    }
  )
);