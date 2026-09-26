"use client";

import { Activity } from "lucide-react";
import type { Feature, Point, Polygon } from "geojson";
import type { BuildingProperties, UtilityProperties } from "../lib/data/infrastructure";
import type { Incident } from "../lib/data/incidents";

interface HealthHudProps {
  buildings: Feature<Polygon, BuildingProperties>[];
  utilities: Feature<Point, UtilityProperties>[];
  incidents: Incident[];
}

export default function HealthHud({ buildings, utilities, incidents }: HealthHudProps) {
  const total = buildings.length;
  const optimal = buildings.filter((f) => f.properties.condition === "Optimal").length;
  const warning = buildings.filter((f) => f.properties.condition === "Warning").length;
  const critical = buildings.filter((f) => f.properties.condition === "Critical").length;

  const activeUtilities = utilities.filter((f) => f.properties.status === "Active").length;
  const maintenanceUtilities = utilities.length - activeUtilities;

  const highPriorityIncidents = incidents.filter((i) => i.priority === "High").length;

  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-[1000] w-64">
      <div className="pointer-events-auto rounded-xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-2xl shadow-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
            <Activity size={12} />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Asset Health
          </p>
        </div>

        <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${pct(optimal)}%` }} />
          <div className="bg-amber-500 transition-all duration-500" style={{ width: `${pct(warning)}%` }} />
          <div className="bg-rose-500 transition-all duration-500" style={{ width: `${pct(critical)}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {optimal} Optimal
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {warning} Warn
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> {critical} Crit
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-2">
            <p className="text-[10px] text-slate-500">Utilities Online</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-200">
              {activeUtilities}
              <span className="text-[11px] font-normal text-slate-500">/{utilities.length}</span>
            </p>
            {maintenanceUtilities > 0 && (
              <p className="text-[10px] text-amber-400">{maintenanceUtilities} in maintenance</p>
            )}
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-2">
            <p className="text-[10px] text-slate-500">Open Incidents</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-200">{incidents.length}</p>
            {highPriorityIncidents > 0 && (
              <p className="text-[10px] text-rose-400">{highPriorityIncidents} high priority</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
