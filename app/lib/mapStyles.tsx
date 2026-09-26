import L from "leaflet";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AlertTriangle, Cable, Droplets, Flame, Zap } from "lucide-react";
import type {
  AssetCondition,
  SurfaceType,
  TrafficLoad,
  UtilityStatus,
  UtilityType,
} from "./data/infrastructure";
import type { IncidentPriority } from "./data/incidents";

export const CONDITION_COLORS: Record<AssetCondition, { fill: string; stroke: string }> = {
  Optimal: { fill: "#10b981", stroke: "#34d399" },
  Warning: { fill: "#f59e0b", stroke: "#fbbf24" },
  Critical: { fill: "#f43f5e", stroke: "#fb7185" },
};

export const SURFACE_COLORS: Record<SurfaceType, string> = {
  Asphalt: "#94a3b8",
  Concrete: "#e2e8f0",
  Gravel: "#d97706",
};

export const TRAFFIC_WEIGHT: Record<TrafficLoad, number> = {
  Low: 2,
  Medium: 3.5,
  High: 5,
};

const UTILITY_COLORS: Record<UtilityType, string> = {
  Power: "#c084fc",
  Water: "#38bdf8",
  Gas: "#fb923c",
  Fiber: "#22d3ee",
};

const UTILITY_ICONS: Record<UtilityType, typeof Zap> = {
  Power: Zap,
  Water: Droplets,
  Gas: Flame,
  Fiber: Cable,
};

export function buildingStyle(condition: AssetCondition, opacity = 1) {
  const { fill, stroke } = CONDITION_COLORS[condition];
  return {
    color: stroke,
    weight: 1.5,
    fillColor: fill,
    fillOpacity: 0.35 * opacity,
    opacity: 0.9 * opacity,
  };
}

export function roadStyle(surfaceType: SurfaceType, trafficLoad: TrafficLoad, opacity = 1) {
  return {
    color: SURFACE_COLORS[surfaceType],
    weight: TRAFFIC_WEIGHT[trafficLoad],
    opacity: 0.85 * opacity,
    lineCap: "round" as const,
  };
}

export function createUtilityIcon(
  utilityType: UtilityType,
  status: UtilityStatus,
  opacity = 1
): L.DivIcon {
  const color = UTILITY_COLORS[utilityType];
  const Icon = UTILITY_ICONS[utilityType];
  const isMaintenance = status === "Maintenance";

  const html = renderToStaticMarkup(
    createElement(
      "span",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "22px",
          height: "22px",
          borderRadius: "9999px",
          background: "#020617",
          border: `2px solid ${isMaintenance ? "#f59e0b" : color}`,
          boxShadow: isMaintenance
            ? "0 0 0 3px rgba(245, 158, 11, 0.25)"
            : `0 0 0 3px ${color}33`,
          opacity,
        },
      },
      createElement(Icon, { size: 11, color, strokeWidth: 2.5 })
    )
  );

  return L.divIcon({
    html,
    className: "utility-marker-icon",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
}

const PRIORITY_COLORS: Record<IncidentPriority, string> = {
  Low: "#fbbf24",
  Medium: "#f97316",
  High: "#ef4444",
};

export function createIncidentIcon(priority: IncidentPriority, opacity = 1): L.DivIcon {
  const color = PRIORITY_COLORS[priority];
  const pulse = priority === "High";

  const html = renderToStaticMarkup(
    createElement(
      "span",
      {
        style: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "24px",
          height: "24px",
          opacity,
        },
      },
      pulse &&
        createElement("span", {
          style: {
            position: "absolute",
            inset: 0,
            borderRadius: "9999px",
            background: color,
            opacity: 0.5,
            animation: "incident-pulse 1.6s ease-out infinite",
          },
        }),
      createElement(
        "span",
        {
          style: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "24px",
            height: "24px",
            borderRadius: "9999px",
            background: color,
            border: "2px solid #020617",
            boxShadow: `0 0 0 3px ${color}55`,
          },
        },
        createElement(AlertTriangle, { size: 13, color: "#020617", strokeWidth: 2.5 })
      )
    )
  );

  return L.divIcon({
    html,
    className: "incident-marker-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}
