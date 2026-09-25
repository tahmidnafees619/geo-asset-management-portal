"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Feature, Point, Polygon } from "geojson";
import type {
  AssetCondition,
  BuildingProperties,
  UtilityProperties,
  UtilityStatus,
} from "../lib/data/infrastructure";

export type DrawerFeature =
  | { kind: "building"; data: Feature<Polygon, BuildingProperties> }
  | { kind: "utility"; data: Feature<Point, UtilityProperties> };

interface FeatureDrawerProps {
  feature: DrawerFeature | null;
  onClose: () => void;
  onUpdateBuildingCondition: (id: string, condition: AssetCondition) => void;
  onUpdateUtilityStatus: (id: string, status: UtilityStatus) => void;
}

const CONDITION_OPTIONS: AssetCondition[] = ["Optimal", "Warning", "Critical"];
const STATUS_OPTIONS: UtilityStatus[] = ["Active", "Maintenance"];

const CONDITION_BADGE: Record<AssetCondition, string> = {
  Optimal: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
  Warning: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
  Critical: "bg-rose-500/10 text-rose-400 ring-rose-500/30",
};

const STATUS_BADGE: Record<UtilityStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
  Maintenance: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
};

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

export default function FeatureDrawer({
  feature,
  onClose,
  onUpdateBuildingCondition,
  onUpdateUtilityStatus,
}: FeatureDrawerProps) {
  const [displayed, setDisplayed] = useState<DrawerFeature | null>(feature);

  // Keep showing the last feature's content while the drawer slides shut,
  // but adopt new content immediately (selection change or a live property
  // edit) — this is React's documented "adjust state during render" pattern,
  // not an effect, so it doesn't cause an extra render round-trip.
  if (feature !== null && feature !== displayed) {
    setDisplayed(feature);
  }

  const open = feature !== null;

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
        {displayed && (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  {displayed.kind === "building" ? "Municipal Building" : "Utility Asset"}
                </p>
                <h2 className="text-sm font-semibold text-slate-100">
                  {displayed.kind === "building"
                    ? displayed.data.properties.name
                    : `${displayed.data.properties.utility_type} Asset`}
                </h2>
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
              {displayed.kind === "building" ? (
                <div className="grid grid-cols-2 gap-2">
                  <InfoCard label="Asset ID" value={displayed.data.properties.id} />
                  <InfoCard label="Type" value={displayed.data.properties.type} />
                  <InfoCard label="Built Year" value={displayed.data.properties.built_year} />
                  <InfoCard label="Last Inspected" value={displayed.data.properties.last_inspected} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <InfoCard label="Asset ID" value={displayed.data.properties.id} />
                  <InfoCard label="Utility Type" value={displayed.data.properties.utility_type} />
                  <InfoCard label="Capacity" value={displayed.data.properties.capacity} />
                </div>
              )}

              <div className="mt-5">
                <label className="text-[10px] uppercase tracking-wider text-slate-500">
                  {displayed.kind === "building" ? "Condition" : "Status"}
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${
                      displayed.kind === "building"
                        ? CONDITION_BADGE[displayed.data.properties.condition]
                        : STATUS_BADGE[displayed.data.properties.status]
                    }`}
                  >
                    {displayed.kind === "building"
                      ? displayed.data.properties.condition
                      : displayed.data.properties.status}
                  </span>
                </div>
                <select
                  value={
                    displayed.kind === "building"
                      ? displayed.data.properties.condition
                      : displayed.data.properties.status
                  }
                  onChange={(e) => {
                    if (displayed.kind === "building") {
                      onUpdateBuildingCondition(
                        displayed.data.properties.id,
                        e.target.value as AssetCondition
                      );
                    } else {
                      onUpdateUtilityStatus(displayed.data.properties.id, e.target.value as UtilityStatus);
                    }
                  }}
                  className="mt-3 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                >
                  {(displayed.kind === "building" ? CONDITION_OPTIONS : STATUS_OPTIONS).map(
                    (option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
