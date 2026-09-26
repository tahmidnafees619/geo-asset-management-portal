"use client";

import { Check, Settings2, X } from "lucide-react";
import { BASEMAPS, type BasemapId } from "../lib/basemaps";
import type { LayerOpacity } from "./MapCanvas";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  basemap: BasemapId;
  onBasemapChange: (id: BasemapId) => void;
  layerOpacity: LayerOpacity;
  onOpacityChange: (id: keyof LayerOpacity, value: number) => void;
}

const OPACITY_LABELS: { id: keyof LayerOpacity; label: string }[] = [
  { id: "buildings", label: "Municipal Buildings" },
  { id: "utilities", label: "Utility Assets" },
  { id: "roads", label: "Roadway Network" },
  { id: "incidents", label: "Reported Incidents" },
];

export default function SettingsPanel({
  open,
  onClose,
  basemap,
  onBasemapChange,
  layerOpacity,
  onOpacityChange,
}: SettingsPanelProps) {
  return (
    <>
      <div
        onClick={onClose}
        className={`absolute inset-0 z-[1400] bg-slate-950/40 backdrop-blur-[1px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`absolute inset-y-0 right-0 z-[1500] flex w-full max-w-sm flex-col border-l border-slate-800 bg-slate-950/95 shadow-2xl shadow-black/50 backdrop-blur transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
              <Settings2 size={14} />
            </span>
            <h2 className="text-sm font-semibold text-slate-100">Map Configuration</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Basemap</p>
          <div className="mt-2 space-y-1.5">
            {BASEMAPS.map((map) => (
              <button
                key={map.id}
                type="button"
                onClick={() => onBasemapChange(map.id)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left transition-colors ${
                  basemap === map.id
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <span>
                  <span
                    className={`block text-xs font-medium ${
                      basemap === map.id ? "text-emerald-400" : "text-slate-300"
                    }`}
                  >
                    {map.label}
                  </span>
                  <span className="block text-[11px] text-slate-500">{map.description}</span>
                </span>
                {basemap === map.id && <Check size={14} className="text-emerald-400" />}
              </button>
            ))}
          </div>

          <p className="mt-6 text-[10px] uppercase tracking-wider text-slate-500">Layer Opacity</p>
          <div className="mt-2 space-y-4">
            {OPACITY_LABELS.map(({ id, label }) => (
              <div key={id}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{label}</span>
                  <span className="tabular-nums text-slate-500">
                    {Math.round(layerOpacity[id] * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={layerOpacity[id]}
                  onChange={(e) => onOpacityChange(id, Number(e.target.value))}
                  className="mt-1.5 w-full accent-emerald-500"
                />
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
