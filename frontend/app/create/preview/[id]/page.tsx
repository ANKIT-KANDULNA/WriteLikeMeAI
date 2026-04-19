"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Feather, Sparkles, Bot, FileText, Eraser,
  Download, ArrowLeft, Loader2, Trash2, Plus, GripVertical
} from "lucide-react";
import { useFontStore } from "@/store/useFontStore";
import { toPng, toJpeg } from "html-to-image";
import jsPDF from "jspdf";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ── Types ─────────────────────────────────────────────────────────────────────
const PAGE_SIZES = {
  a4:     { label: "A4",     width: 794,  height: 1123 },
  a5:     { label: "A5",     width: 559,  height: 794  },
  letter: { label: "Letter", width: 816,  height: 1056 },
  legal:  { label: "Legal",  width: 816,  height: 1344 },
} as const;
type PageSizeKey = keyof typeof PAGE_SIZES;

type ContentBlock = {
  id: string;
  text: string;
  color: string;
  fontSize: number;
  x: number;
  y: number;
  width: number;
};

// ── Background pattern builder ────────────────────────────────────────────────
function buildBackground(pageType: string, lineSpacing: number, marginTop: number): React.CSSProperties {
  const shift = `0px ${marginTop}px`;

  switch (pageType) {
    case "lined":
      return {
        backgroundImage: `repeating-linear-gradient(
          transparent,
          transparent ${lineSpacing - 1}px,
          #bfdbfe ${lineSpacing - 1}px,
          #bfdbfe ${lineSpacing}px
        )`,
        backgroundPosition: shift,
        backgroundSize: `100% ${lineSpacing}px`,
      };
    case "grid":
      return {
        backgroundImage: `
          repeating-linear-gradient(
            transparent, transparent ${lineSpacing - 1}px,
            #e2e8f0 ${lineSpacing - 1}px, #e2e8f0 ${lineSpacing}px
          ),
          repeating-linear-gradient(
            90deg,
            transparent, transparent ${lineSpacing - 1}px,
            #e2e8f0 ${lineSpacing - 1}px, #e2e8f0 ${lineSpacing}px
          )
        `,
        backgroundPosition: `${shift}, 72px 0px`,
        backgroundSize: `100% ${lineSpacing}px, ${lineSpacing}px 100%`,
      };
    case "dotted":
      return {
        backgroundImage: `radial-gradient(#cbd5e1 1.2px, transparent 1.2px)`,
        backgroundSize: `${lineSpacing}px ${lineSpacing}px`,
        backgroundPosition: `${lineSpacing / 2}px ${marginTop + lineSpacing / 2}px`,
      };
    default:
      return {};
  }
}

// ── Editable Block Component ──────────────────────────────────────────────────
function EditableBlock({
  block, fontResult, globalLineSpacing, updateBlock, isActive, setActiveBlockId, removeBlock, defaultModel
}: {
  block: ContentBlock;
  fontResult: any;
  globalLineSpacing: number;
  updateBlock: (id: string, updates: Partial<ContentBlock>) => void;
  isActive: boolean;
  setActiveBlockId: (id: string | null) => void;
  removeBlock: (id: string) => void;
  defaultModel: string;
}) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${API}/api/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: defaultModel, word_count: 50 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Generation failed");
      
      updateBlock(block.id, { text: block.text ? block.text + "\n" + data.text : data.text });
      setPrompt("");
    } catch (err) {
      console.error("AI Generation Error", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const startResize = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Support both mouse and touch coordinates
    const startX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const startWidth = block.width;
    
    const onMove = (ev: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX;
      const newWidth = Math.max(100, startWidth + (currentX - startX));
      updateBlock(block.id, { width: newWidth });
    };
    
    const onEnd = () => { 
        document.removeEventListener("mousemove", onMove); 
        document.removeEventListener("mouseup", onEnd); 
        document.removeEventListener("touchmove", onMove); 
        document.removeEventListener("touchend", onEnd); 
    };
    
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
  };

  return (
    <div
      style={{
        position: "absolute",
        left: block.x,
        top: block.y,
        width: block.width,
        zIndex: isActive ? 20 : 10,
      }}
      onClick={(e) => { e.stopPropagation(); setActiveBlockId(block.id); }}
    >
      {/* Floating Toolbar */}
      {isActive && (
         <div className="absolute top-full mt-2 left-0 bg-white shadow-xl rounded-lg p-2 flex flex-wrap items-center gap-2 border border-slate-200 max-w-[85vw] lg:max-w-none z-30">
            {/* Quick Colors */}
            <div className="flex gap-1.5 border-r border-slate-200 pr-3">
               {["#1f3a8a", "#0d0d0d", "#b91c1c", "#059669"].map(c => (
                 <button key={c} onClick={() => updateBlock(block.id, { color: c })} className={`w-5 h-5 rounded-full border-2 ${block.color === c ? 'border-indigo-400 scale-110' : 'border-slate-200 hover:scale-110'}`} style={{backgroundColor: c}} />
               ))}
               <input type="color" className="w-5 h-5 p-0 border-0 rounded-full cursor-pointer ml-1" value={block.color} onChange={e => updateBlock(block.id, { color: e.target.value })} title="Custom Color" />
            </div>
            {/* Font Size slider */}
            <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
               <span className="text-xs font-semibold text-slate-500">{block.fontSize}px</span>
               <input type="range" min={14} max={48} value={block.fontSize} onChange={e => updateBlock(block.id, { fontSize: Number(e.target.value) })} className="w-16 accent-indigo-500" />
            </div>
            {/* AI Generator inline */}
            <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
               <input placeholder="AI prompt..." value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleGenerateAI() }} className="w-32 text-xs px-2 py-1.5 rounded-md bg-slate-100 border border-slate-200 outline-none text-slate-800 focus:border-indigo-400" />
               <button onClick={handleGenerateAI} disabled={isGenerating || !prompt.trim()} className="p-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 disabled:opacity-50 transition-colors">
                   {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
               </button>
            </div>
            {/* Delete */}
            <button onClick={() => removeBlock(block.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Delete Block">
               <Trash2 className="w-4 h-4" />
            </button>
         </div>
      )}

      {/* Visible Resize handle */}
      {isActive && (
        <div 
          className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-8 bg-white border border-slate-200 rounded-r shadow-md cursor-col-resize flex items-center justify-center hover:bg-slate-50 transition-colors z-20"
          onMouseDown={(e) => startResize(e)}
          onTouchStart={(e) => startResize(e)}
          title="Drag to resize block width"
        >
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
      )}

      {/* The Text Box */}
      <textarea
         value={block.text}
         onChange={(e) => updateBlock(block.id, { text: e.target.value })}
         onFocus={() => setActiveBlockId(block.id)}
         placeholder={isActive ? "Type..." : ""}
         className={`w-full bg-transparent outline-none overflow-hidden resize-none ${isActive ? 'ring-1 ring-dashed ring-indigo-300 rounded shadow-sm' : ''}`}
         style={{
            minHeight: globalLineSpacing * 2,
            lineHeight: `${globalLineSpacing}px`,
            fontSize: `${block.fontSize}px`,
            fontFamily: `"MyHandwriting-${fontResult?.fontId || 'default'}`,
            color: block.color,
         }}
         rows={Math.max(1, block.text.split('\n').length)}
      />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PreviewPage() {
  const router  = useRouter();
  const params  = useParams<{ id: string }>();
  const { fontResult, reset, setFontResult } = useFontStore();

  const [fontLoaded,     setFontLoaded]     = useState(false);
  const [model,          setModel]          = useState<"groq" | "gemini" | "deepseek">("groq");
  const [pageType,       setPageType]       = useState<"plain" | "lined" | "grid" | "dotted">("lined");
  const [pageSize,       setPageSize]       = useState<PageSizeKey>("a4");
  
  // Base configuration defaults for newly spawned blocks
  const [defaultFontSize, setDefaultFontSize] = useState(22);
  const [defaultInkColor, setDefaultInkColor] = useState("#1e3a5f");

  // Freeform State
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const userFaceRef     = useRef<FontFace | null>(null);
  const fallbackFaceRef = useRef<FontFace | null>(null);

  // Restore font from backend if not in store
  useEffect(() => {
    if (fontResult && (!params?.id || fontResult.fontId === params.id)) return;
    if (!params?.id) { router.replace("/create"); return; }

    fetch(`/generated-fonts/${params.id}.json`)
      .then((r) => { if (!r.ok) throw new Error("Font not found"); return r.json(); })
      .then((data) =>
        setFontResult({
          fontName:      data.font_name,
          safeName:      data.safe_name,
          ttfB64:        data.ttf_b64,
          woff2B64:      data.woff2_b64,
          ttfUrl:        data.ttf_url,
          woff2Url:      data.woff2_url,
          fontId:        data.font_id,
          ttfPublicUrl:  data.ttf_url,
          woff2PublicUrl: data.woff2_url,
        })
      )
      .catch(() => router.replace("/create"));
  }, [fontResult, params?.id, router, setFontResult]);

  // Load NormalHandwriting fallback
  useEffect(() => {
    const face = new FontFace("NormalHandwriting", "url(/fonts/NormalHandwriting-Regular.ttf)");
    fallbackFaceRef.current = face;
    face.load().then((f) => document.fonts.add(f)).catch(() => {});
    return () => { if (fallbackFaceRef.current) document.fonts.delete(fallbackFaceRef.current); };
  }, []);

  // Load user generated font
  useEffect(() => {
    if (!fontResult) return;
    setFontLoaded(false);
    
    const loadFont = (url: string, fontName: string) => {
      const face = new FontFace(fontName, `url(${url})`);
      return face.load().then((f) => {
        document.fonts.add(f);
        return fontName;
      }).catch(() => null);
    };

    const fontName = `MyHandwriting-${fontResult.fontId}`;
    loadFont(`/generated-fonts/${fontResult.fontId}.woff2`, fontName).then((loadedName) => {
        if (loadedName) setFontLoaded(true);
        else loadFont(`/generated-fonts/${fontResult.fontId}.ttf`, fontName).then(() => setFontLoaded(true));
    });
      
    return () => { if (userFaceRef.current) document.fonts.delete(userFaceRef.current); };
  }, [fontResult]);

  // ── Exports ──────────────────────────────────────────────────
  const handleExportPNG = async () => {
    setActiveBlockId(null); // hide outlines
    await new Promise(r => setTimeout(r, 100)); // wait for react re-render
    const element = document.getElementById("handwriting-export-container");
    if (!element) return;
    setIsExportingPNG(true);
    try {
      const dataUrl = await toPng(element, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `handwriting-${Date.now()}.png`;
      a.click();
    } catch (e) { setError("Failed to export PNG."); } finally { setIsExportingPNG(false); }
  };

  const handleExportPDF = async () => {
    setActiveBlockId(null); 
    await new Promise(r => setTimeout(r, 100));
    const element = document.getElementById("handwriting-export-container");
    if (!element) return;
    setIsExportingPDF(true);
    try {
      const dataUrl = await toJpeg(element, { pixelRatio: 2, backgroundColor: "#ffffff", quality: 0.95 });
      const width = PAGE_SIZES[pageSize].width;
      const height = PAGE_SIZES[pageSize].height;
      const pdf = new jsPDF({ orientation: width > height ? "landscape" : "portrait", unit: "px", format: [width * 2, height * 2] });
      pdf.addImage(dataUrl, "JPEG", 0, 0, width * 2, height * 2);
      pdf.save(`handwriting-${Date.now()}.pdf`);
    } catch (e) { setError("Failed to export PDF."); } finally { setIsExportingPDF(false); }
  };

  if (!fontResult) return null;

  // ── Calculation for page rendering ──────────────────────────────────────────
  const size = PAGE_SIZES[pageSize];
  const marginTop = 64; 
  const marginSide = 72;
  const globalLineSpacing = Math.round(defaultFontSize * 1.75);
  // Optional offset so the text's baseline exactly hits the notebook line
  const baselineOffset = Math.round(globalLineSpacing * 0.3);

  const calculateSnappedPosition = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(marginSide, clientX - rect.left - 10);
    let rawY = clientY - rect.top;

    let snappedY = marginTop;
    if (rawY > marginTop) {
        const lineIndex = Math.round((rawY - marginTop) / globalLineSpacing);
        snappedY = marginTop + (lineIndex * globalLineSpacing);
    }
    snappedY += baselineOffset;
    return { x, y: snappedY - 14 };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only show + button if not hovering over a block directly
    if (activeBlockId) {
      setHoverPosition(null);
      return;
    }
    
    // Check if we are over an existing empty block to hide ghost cursor
    const overExisting = (e.target as HTMLElement).closest('.content-block');
    if (overExisting) {
      setHoverPosition(null);
      return;
    }

    const pos = calculateSnappedPosition(e.clientX, e.clientY);
    if (pos) setHoverPosition(pos);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If they clicked on an already existing content block, ignore creating a new one
    if ((e.target as HTMLElement).closest('.content-block') || (e.target as HTMLElement).closest('.block-controls')) {
      return;
    }

    const pos = calculateSnappedPosition(e.clientX, e.clientY);
    if (!pos) return;

    setActiveBlockId(null);
    setHoverPosition(null);

    const newBlock: ContentBlock = {
       id: Date.now().toString(),
       text: "",
       color: defaultInkColor,
       fontSize: defaultFontSize,
       x: pos.x,
       y: pos.y,
       width: Math.min(300, size.width - pos.x - marginSide) // default width
    };
    
    setBlocks(prev => [...prev, newBlock]);
    setActiveBlockId(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };
  const removeBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));

  return (
    <main className="flex flex-col lg:flex-row h-screen w-full bg-slate-100 dark:bg-black overflow-hidden font-sans">
      
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-full lg:w-[320px] max-h-[45vh] lg:max-h-none lg:h-full bg-white dark:bg-[#0A0A0A] border-b lg:border-r lg:border-b-0 border-slate-200 dark:border-slate-800 flex flex-col z-10 shrink-0 shadow-xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-indigo-50/50 dark:bg-indigo-950/20">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-0.5 shadow-sm">
            <div className="w-full h-full bg-white dark:bg-black rounded-[9px] flex items-center justify-center">
              <Feather className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 dark:text-white leading-none">
              Write Like Me
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500"> AI</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-semibold text-indigo-500">Freeform Canvas Mode</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 p-3 rounded-lg text-xs font-medium border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
            🚀 <b>Click anywhere on the paper</b> to create an editable text block. You can change any block's formatting or generate AI paragraphs individually by clicking it!
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" /> Page Style
            </label>
            <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
              {(["plain", "lined", "grid", "dotted"] as const).map((pt) => (
                <button key={pt} onClick={() => setPageType(pt)} className={`py-1.5 px-2 text-[11px] lg:text-xs font-bold rounded-lg border capitalize transition-all ${pageType === pt ? "border-indigo-600 bg-indigo-600 text-white shadow-md dark:border-indigo-500 dark:bg-indigo-500" : "border-slate-200 text-slate-600 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800"}`}>
                  {pt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-500" /> Page Size
            </label>
            <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
              {(Object.keys(PAGE_SIZES) as PageSizeKey[]).map((ps) => (
                <button key={ps} onClick={() => setPageSize(ps)} className={`py-1.5 px-2 text-[11px] lg:text-xs font-bold rounded-lg border transition-all ${pageSize === ps ? "border-sky-600 bg-sky-600 text-white shadow-md dark:border-sky-500 dark:bg-sky-500" : "border-slate-200 text-slate-600 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800"}`}>
                  {PAGE_SIZES[ps].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
               <Bot className="w-4 h-4 text-emerald-500" /> Default AI Model
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {(["groq", "gemini", "deepseek"] as const).map((m) => (
                <button key={m} onClick={() => setModel(m)} className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-all capitalize ${model === m ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}>
                  {m === "deepseek" ? "Deepseek" : m}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col gap-2">
             <button onClick={() => {
                const newBlock: ContentBlock = {
                   id: Date.now().toString(),
                   text: "",
                   color: defaultInkColor,
                   fontSize: defaultFontSize,
                   x: 72,
                   y: 64 + Math.round(defaultFontSize * 1.75 * 0.3), // default margins
                   width: 250
                };
                setBlocks(prev => [...prev, newBlock]);
                setActiveBlockId(newBlock.id);
             }} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold transition-colors shadow-sm">
                 <Plus className="w-4 h-4" /> Add Text Block
             </button>
          </div>
        </div>
      </aside>

      {/* ── Canvas area ──────────────────────────────────────────────────────── */}
      <div 
        className="flex-1 overflow-auto bg-slate-200 dark:bg-zinc-900 p-4 lg:p-8 flex justify-center relative click-area min-h-[50vh]" 
        onClick={(e) => {
           if ((e.target as HTMLElement).classList.contains('click-area')) {
              setActiveBlockId(null);
           }
        }}
      >
        
        {blocks.length > 0 && fontLoaded && (
          <div className="fixed bottom-6 right-6 lg:bottom-auto lg:top-8 lg:right-8 z-50 flex flex-col gap-3">
            <button onClick={handleExportPNG} disabled={isExportingPNG || isExportingPDF} className="flex items-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm">
              {isExportingPNG ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PNG
            </button>
            <button onClick={handleExportPDF} disabled={isExportingPNG || isExportingPDF} className="flex items-center gap-2.5 px-6 py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm">
              {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} PDF
            </button>
          </div>
        )}

        {!fontLoaded ? (
          <div className="flex items-center justify-center w-full gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" /> Loading your font…
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="shadow-2xl rounded-sm origin-top cursor-default relative"
            style={{ width: size.width, minHeight: size.height }}
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverPosition(null)}
          >
            <div
              id="handwriting-export-container"
              className="relative w-full h-full"
              style={{
                width: size.width,
                minHeight: size.height,
                backgroundColor: "#ffffff",
                ...buildBackground(pageType, globalLineSpacing, marginTop),
              }}
            >
              <style>{`
                @font-face {
                  font-family: 'MyHandwriting-${fontResult?.fontId || 'default'}';
                  src: url('${fontResult?.woff2B64 ? `data:font/woff2;charset=utf-8;base64,${fontResult.woff2B64}` : fontResult?.woff2Url}') format('woff2'),
                       url('${fontResult?.ttfB64 ? `data:font/truetype;charset=utf-8;base64,${fontResult.ttfB64}` : fontResult?.ttfUrl}') format('truetype');
                }
              `}</style>

              {/* Ghost Cursor Add Button */}
              {hoverPosition && !activeBlockId && (
                <div 
                  className="absolute z-10 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity bg-indigo-50 border border-indigo-200 text-indigo-500 rounded-md py-1 px-3 shadow-sm cursor-pointer whitespace-nowrap pointer-events-none"
                  style={{ top: hoverPosition.y, left: hoverPosition.x }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">Add Text Block</span>
                </div>
              )}

              {blocks.map(block => (
                <div key={block.id} className="content-block">
                  <EditableBlock
                  key={block.id}
                  block={block}
                  fontResult={fontResult}
                  globalLineSpacing={globalLineSpacing}
                  updateBlock={updateBlock}
                  isActive={activeBlockId === block.id}
                  setActiveBlockId={setActiveBlockId}
                  removeBlock={removeBlock}
                  defaultModel={model}
                />
                </div>
              ))}

              {/* Minimal invisible footer pad to guarantee min height pushes out */}
              <div style={{ height: size.height - marginTop, pointerEvents: 'none' }} />
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
