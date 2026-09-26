"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, CornerDownLeft, Route, Search, Zap } from "lucide-react";
import { searchIndex, type SearchResult } from "../lib/search";

interface CommandPaletteProps {
  index: SearchResult[];
  onClose: () => void;
  onSelect: (result: SearchResult) => void;
}

const CATEGORY_ICON = {
  Building: Building2,
  Utility: Zap,
  Road: Route,
} as const;

// Mounted only while open (the parent conditionally renders it), so local
// state naturally starts fresh each time — no reset effects needed.
export default function CommandPalette({ index, onClose, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const results = useMemo(() => searchIndex(index, query), [index, query]);

  // Reset the keyboard-nav highlight whenever the query changes, without an
  // effect (React's documented "adjust state during render" pattern).
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setHighlight(0);
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = results[highlight];
        if (target) onSelect(target);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [results, highlight, onClose, onSelect]);

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-start justify-center bg-slate-950/70 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-pop w-full max-w-xl overflow-hidden rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-black/60"
      >
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
          <Search size={16} className="text-emerald-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets by name, ID, or category…"
            className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
          />
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-1.5">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-slate-500">
              No assets match &ldquo;{query}&rdquo;
            </p>
          ) : (
            results.map((result, i) => {
              const Icon = CATEGORY_ICON[result.category];
              const active = i === highlight;
              return (
                <button
                  key={result.refId}
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => onSelect(result)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    active ? "bg-slate-800/80" : "hover:bg-slate-800/40"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-emerald-400 ring-1 ring-slate-700">
                    <Icon size={13} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-200">{result.label}</span>
                    <span className="block truncate text-[11px] text-slate-500">{result.subtitle}</span>
                  </span>
                  {active && <CornerDownLeft size={13} className="shrink-0 text-slate-600" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
