"use client";

import { useRef } from "react";
import { X, GripVertical } from "lucide-react";
import { useFontStore, CharacterItem } from "@/store/useFontStore";

export function CharacterGrid() {
  const { characters, updateLabel, removeCharacter, moveCharacter } =
    useFontStore();

  const dragIdx = useRef<number | null>(null);

  const onDragStart = (idx: number) => {
    dragIdx.current = idx;
  };

  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    moveCharacter(dragIdx.current, idx);
    dragIdx.current = idx;
  };

  const onDragEnd = () => {
    dragIdx.current = null;
  };

  if (characters.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-8">
        No characters detected.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
      {characters.map((char: CharacterItem, idx: number) => (
        <div
          key={char.id}
          draggable
          onDragStart={() => onDragStart(idx)}
          onDragOver={(e) => onDragOver(e, idx)}
          onDragEnd={onDragEnd}
          className="relative flex flex-col items-center gap-1 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-grab active:cursor-grabbing select-none hover:border-indigo-400 transition-colors group"
        >
          {/* Drag handle */}
          <GripVertical className="absolute top-1 left-1 w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Remove button */}
          <button
            onClick={() => removeCharacter(char.id)}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <X className="w-2.5 h-2.5" />
          </button>

          {/* Character image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={char.image_b64}
            alt={char.label}
            className="w-full aspect-square object-contain rounded"
            style={{ imageRendering: "pixelated" }}
          />

          {/* Editable label */}
          <input
            type="text"
            maxLength={1}
            value={char.label}
            onChange={(e) => updateLabel(char.id, e.target.value)}
            className="w-full text-center text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-400 py-0.5"
          />
        </div>
      ))}
    </div>
  );
}
