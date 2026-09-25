"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  INCIDENT_CATEGORIES,
  INCIDENT_PRIORITIES,
  type IncidentCategory,
  type IncidentPriority,
} from "../lib/data/incidents";
import { formatWgs84 } from "../lib/projections";

interface IncidentModalProps {
  location: { lat: number; lng: number };
  onSubmit: (data: { title: string; category: IncidentCategory; priority: IncidentPriority }) => void;
  onCancel: () => void;
}

export default function IncidentModal({ location, onSubmit, onCancel }: IncidentModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<IncidentCategory>(INCIDENT_CATEGORIES[0]);
  const [priority, setPriority] = useState<IncidentPriority>("Medium");

  const canSubmit = title.trim().length > 0;

  return (
    <div className="absolute inset-0 z-[1600] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="modal-pop w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30">
            <AlertTriangle size={14} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Report Incident</h2>
            <p className="text-[11px] text-slate-500">{formatWgs84(location.lng, location.lat)}</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            onSubmit({ title: title.trim(), category, priority });
          }}
          className="space-y-3 px-4 py-4"
        >
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500">
              Incident Title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Main line rupture near 5th Ave"
              className="mt-1.5 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IncidentCategory)}
              className="mt-1.5 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
            >
              {INCIDENT_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as IncidentPriority)}
              className="mt-1.5 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
            >
              {INCIDENT_PRIORITIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              Submit Incident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
