"use client";

import { useState } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  Droplets,
  Lightbulb,
  Layers,
  Route,
  Waves,
  Zap,
} from "lucide-react";

const ASSET_LAYERS = [
  { id: "water", label: "Water Mains", icon: Droplets, count: 1284, color: "text-sky-400" },
  { id: "roads", label: "Road Network", icon: Route, count: 342, color: "text-amber-400" },
  { id: "lights", label: "Streetlights", icon: Lightbulb, count: 5210, color: "text-yellow-400" },
  { id: "sewer", label: "Sewer Lines", icon: Waves, count: 876, color: "text-emerald-400" },
  { id: "power", label: "Power Grid", icon: Zap, count: 198, color: "text-purple-400" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    water: true,
    roads: true,
    lights: false,
    sewer: false,
    power: false,
  });

  return (
    <aside
      className={`relative flex shrink-0 flex-col border-r border-slate-800 bg-slate-950/60 backdrop-blur transition-[width] duration-200 ${
        collapsed ? "w-14" : "w-64"
      }`}
    >
      <div className="flex h-12 items-center justify-between border-b border-slate-800 px-3">
        {!collapsed && (
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Layers size={14} className="text-emerald-400" />
            Asset Layers
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-emerald-400"
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {ASSET_LAYERS.map((layer) => {
          const Icon = layer.icon;
          const isActive = activeLayers[layer.id];
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() =>
                setActiveLayers((prev) => ({ ...prev, [layer.id]: !prev[layer.id] }))
              }
              className={`group flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-800/60 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1 transition-colors ${
                  isActive
                    ? "bg-emerald-500/10 ring-emerald-500/40"
                    : "bg-slate-800/60 ring-slate-700"
                }`}
              >
                <Icon size={14} className={isActive ? layer.color : "text-slate-500"} />
              </span>
              {!collapsed && (
                <span className="flex flex-1 items-center justify-between">
                  <span className={isActive ? "text-slate-200" : "text-slate-500"}>
                    {layer.label}
                  </span>
                  <span className="text-[11px] tabular-nums text-slate-600">
                    {layer.count.toLocaleString()}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
