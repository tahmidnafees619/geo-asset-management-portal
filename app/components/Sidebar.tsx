"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronsLeft, ChevronsRight, Layers } from "lucide-react";

export interface SidebarLayer {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
  color: string;
}

interface SidebarProps {
  layers: SidebarLayer[];
  active: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export default function Sidebar({ layers, active, onToggle }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

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
        {layers.map((layer) => {
          const Icon = layer.icon;
          const isActive = active[layer.id];
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onToggle(layer.id)}
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
                    ({layer.count.toLocaleString()})
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
