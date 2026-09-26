"use client";

import { Ruler, X } from "lucide-react";
import { formatArea, formatDistance, pathDistanceMeters, planarAreaSqMeters, type LatLng } from "../lib/measurement";

interface MeasurementPanelProps {
  active: boolean;
  points: LatLng[];
  onClear: () => void;
}

export default function MeasurementPanel({ active, points, onClear }: MeasurementPanelProps) {
  if (!active && points.length === 0) return null;

  const distance = pathDistanceMeters(points);
  const area = points.length >= 3 ? planarAreaSqMeters(points) : null;

  return (
    <div className="pointer-events-none absolute left-4 top-4 z-[1000] w-64">
      <div className="pointer-events-auto rounded-xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-2xl shadow-black/40 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
              <Ruler size={12} />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Measure Tool
            </p>
          </div>
          {points.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-800 hover:text-rose-400"
              title="Clear points"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {points.length === 0 ? (
          <p className="mt-2 text-[11px] text-slate-500">Click points on the map to measure.</p>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Vertices</span>
              <span className="tabular-nums text-slate-300">{points.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Distance</span>
              <span className="tabular-nums font-medium text-amber-400">{formatDistance(distance)}</span>
            </div>
            {area !== null && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Enclosed Area</span>
                <span className="tabular-nums font-medium text-amber-400">{formatArea(area)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
