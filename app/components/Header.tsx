"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Building2,
  Download,
  MapPinned,
  Ruler,
  Search,
  Settings,
  Zap,
} from "lucide-react";
import type { NotificationItem } from "../lib/notifications";

interface HeaderProps {
  reportMode: boolean;
  onToggleReportMode: () => void;
  measureMode: boolean;
  onToggleMeasureMode: () => void;
  onOpenSearch: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  notifications: NotificationItem[];
  onJumpToNotification: (notification: NotificationItem) => void;
}

const SEVERITY_STYLES = {
  critical: "bg-rose-500/10 text-rose-400 ring-rose-500/30",
  warning: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
  info: "bg-sky-500/10 text-sky-400 ring-sky-500/30",
} as const;

function severityIcon(notification: NotificationItem) {
  if (notification.id.startsWith("alert-utl")) return Zap;
  if (notification.id.startsWith("alert-bld")) return Building2;
  return AlertTriangle;
}

export default function Header({
  reportMode,
  onToggleReportMode,
  measureMode,
  onToggleMeasureMode,
  onOpenSearch,
  onOpenExport,
  onOpenSettings,
  notifications,
  onJumpToNotification,
}: HeaderProps) {
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bellOpen) return;
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [bellOpen]);

  return (
    <header className="relative z-[1900] flex h-14 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_12px_-2px_rgba(16,185,129,0.5)]">
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
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200"
        >
          <Search size={13} />
          <span className="hidden sm:inline">Search assets…</span>
          <kbd className="hidden rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[9px] text-slate-500 sm:inline">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onToggleReportMode}
          className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
            reportMode
              ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
              : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-emerald-400"
          }`}
        >
          <AlertTriangle size={14} />
          {reportMode ? "Click Map to Report…" : "Report Incident"}
        </button>

        <button
          type="button"
          onClick={onToggleMeasureMode}
          className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
            measureMode
              ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
              : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-emerald-400"
          }`}
        >
          <Ruler size={14} />
          {measureMode ? "Click Map to Measure…" : "Measure"}
        </button>

        <div className="mx-1 h-5 w-px bg-slate-800" />

        <button
          type="button"
          onClick={onOpenExport}
          title="Export data"
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-emerald-400"
        >
          <Download size={16} />
        </button>

        <div ref={bellRef} className="relative">
          <button
            type="button"
            onClick={() => setBellOpen((v) => !v)}
            title="Notifications"
            className="relative rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-emerald-400"
          >
            <Bell size={16} />
            {notifications.length > 0 && (
              <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-0.5 text-[9px] font-bold text-white shadow-[0_0_8px_-1px_rgba(244,63,94,0.8)]">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="modal-pop absolute right-0 top-11 z-[1950] w-80 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/95 shadow-2xl shadow-black/50 backdrop-blur-md">
              <div className="border-b border-slate-800 px-4 py-2.5">
                <p className="text-xs font-semibold text-slate-200">Alert Center</p>
                <p className="text-[11px] text-slate-500">{notifications.length} active alerts</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-slate-500">
                    All clear — no active alerts.
                  </p>
                ) : (
                  notifications.map((n) => {
                    const Icon = severityIcon(n);
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          onJumpToNotification(n);
                          setBellOpen(false);
                        }}
                        className="flex w-full items-start gap-2.5 border-b border-slate-900 px-4 py-2.5 text-left last:border-b-0 hover:bg-slate-900/60"
                      >
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${SEVERITY_STYLES[n.severity]}`}
                        >
                          <Icon size={12} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium text-slate-200">
                            {n.title}
                          </span>
                          <span className="block truncate text-[11px] text-slate-500">
                            {n.description}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          title="Map settings"
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-emerald-400"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
