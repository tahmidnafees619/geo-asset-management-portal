"use client";

import { useState } from "react";
import type { Feature, FeatureCollection, LineString, Point, Polygon } from "geojson";
import { AlertTriangle, Building2, Download, Route, X, Zap } from "lucide-react";
import type { BuildingProperties, RoadProperties, UtilityProperties } from "../lib/data/infrastructure";
import type { Incident } from "../lib/data/incidents";
import {
  exportBuildingsCSV,
  exportBuildingsGeoJSON,
  exportIncidentsCSV,
  exportIncidentsGeoJSON,
  exportRoadsCSV,
  exportRoadsGeoJSON,
  exportUtilitiesCSV,
  exportUtilitiesGeoJSON,
} from "../lib/export";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  buildings: FeatureCollection<Polygon, BuildingProperties>;
  utilities: FeatureCollection<Point, UtilityProperties>;
  roads: FeatureCollection<LineString, RoadProperties>;
  incidents: Incident[];
}

type LayerId = "buildings" | "utilities" | "roads" | "incidents";
type Format = "geojson" | "csv";

const LAYER_META: { id: LayerId; label: string; icon: typeof Building2 }[] = [
  { id: "buildings", label: "Municipal Buildings", icon: Building2 },
  { id: "utilities", label: "Utility Assets", icon: Zap },
  { id: "roads", label: "Roadway Network", icon: Route },
  { id: "incidents", label: "Reported Incidents", icon: AlertTriangle },
];

export default function ExportModal({ open, onClose, buildings, utilities, roads, incidents }: ExportModalProps) {
  const [selected, setSelected] = useState<Record<LayerId, boolean>>({
    buildings: true,
    utilities: true,
    roads: true,
    incidents: true,
  });
  const [format, setFormat] = useState<Format>("geojson");

  if (!open) return null;

  function toggle(id: LayerId) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleExport() {
    if (selected.buildings) {
      if (format === "geojson") exportBuildingsGeoJSON(buildings);
      else exportBuildingsCSV(buildings.features as Feature<Polygon, BuildingProperties>[]);
    }
    if (selected.utilities) {
      if (format === "geojson") exportUtilitiesGeoJSON(utilities);
      else exportUtilitiesCSV(utilities.features as Feature<Point, UtilityProperties>[]);
    }
    if (selected.roads) {
      if (format === "geojson") exportRoadsGeoJSON(roads);
      else exportRoadsCSV(roads.features as Feature<LineString, RoadProperties>[]);
    }
    if (selected.incidents && incidents.length > 0) {
      if (format === "geojson") exportIncidentsGeoJSON(incidents);
      else exportIncidentsCSV(incidents);
    }
    onClose();
  }

  const anySelected = Object.values(selected).some(Boolean);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-pop w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
              <Download size={14} />
            </span>
            <h2 className="text-sm font-semibold text-slate-100">Export Spatial Data</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Layers</p>
          <div className="mt-2 space-y-1.5">
            {LAYER_META.map((layer) => {
              const Icon = layer.icon;
              const count =
                layer.id === "buildings"
                  ? buildings.features.length
                  : layer.id === "utilities"
                  ? utilities.features.length
                  : layer.id === "roads"
                  ? roads.features.length
                  : incidents.length;
              return (
                <label
                  key={layer.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 hover:border-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selected[layer.id]}
                    onChange={() => toggle(layer.id)}
                    className="h-3.5 w-3.5 accent-emerald-500"
                  />
                  <Icon size={13} className="text-slate-400" />
                  <span className="flex-1 text-xs text-slate-300">{layer.label}</span>
                  <span className="text-[11px] tabular-nums text-slate-600">{count}</span>
                </label>
              );
            })}
          </div>

          <p className="mt-4 text-[10px] uppercase tracking-wider text-slate-500">Format</p>
          <div className="mt-2 flex gap-2">
            {(["geojson", "csv"] as Format[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  format === f
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                }`}
              >
                {f === "geojson" ? ".geojson" : ".csv"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={!anySelected}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            <Download size={14} />
            Download Selected Layers
          </button>
        </div>
      </div>
    </div>
  );
}
