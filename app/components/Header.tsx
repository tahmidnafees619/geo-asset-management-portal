"use client";

import { Bell, Download, MapPinned, Search, Settings } from "lucide-react";

const TOOLBAR_ICONS = [Search, Download, Bell, Settings];

export default function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
          <MapPinned size={16} />
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-semibold tracking-wide text-slate-100">
            Municipal Asset &amp; Infrastructure Management Portal
          </h1>
          <p className="text-[11px] text-slate-500">Enterprise Web GIS Console</p>
        </div>
        <span className="ml-3 hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 sm:inline-flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live Telemetry Active
        </span>
      </div>
      <div className="flex items-center gap-1">
        {TOOLBAR_ICONS.map((Icon, i) => (
          <button
            key={i}
            type="button"
            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-emerald-400"
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
    </header>
  );
}
