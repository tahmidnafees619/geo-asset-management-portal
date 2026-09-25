"use client";

import { Crosshair, Globe2 } from "lucide-react";
import { formatMercator, formatWgs84 } from "../lib/projections";

interface StatusBarProps {
  lat: number | null;
  lng: number | null;
  mercatorX: number | null;
  mercatorY: number | null;
}

export default function StatusBar({ lat, lng, mercatorX, mercatorY }: StatusBarProps) {
  const hasCoords = lat !== null && lng !== null && mercatorX !== null && mercatorY !== null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[1000] flex justify-center px-4">
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full border border-slate-800 bg-slate-950/90 px-5 py-2 text-[12px] text-slate-300 shadow-lg shadow-black/40 backdrop-blur">
        <div className="flex items-center gap-1.5">
          <Crosshair size={13} className="text-emerald-400" />
          <span className="text-slate-500">WGS84</span>
          <span className="font-mono tabular-nums text-slate-200">
            {hasCoords ? formatWgs84(lng, lat) : "--.-----, --.-----"}
          </span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <Globe2 size={13} className="text-emerald-400" />
          <span className="text-slate-500">EPSG:3857</span>
          <span className="font-mono tabular-nums text-slate-200">
            {hasCoords ? formatMercator(mercatorX, mercatorY) : "-- m, -- m"}
          </span>
        </div>
      </div>
    </div>
  );
}
