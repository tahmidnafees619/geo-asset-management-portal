import type { Feature, Point, Polygon } from "geojson";
import type { BuildingProperties, UtilityProperties } from "./data/infrastructure";
import type { Incident } from "./data/incidents";
import { polygonCentroid } from "./geo";
import type { SelectedFeature } from "./selection";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  lat: number;
  lng: number;
  selection?: SelectedFeature;
  timestamp: string;
}

export function buildNotifications(
  buildings: Feature<Polygon, BuildingProperties>[],
  utilities: Feature<Point, UtilityProperties>[],
  incidents: Incident[]
): NotificationItem[] {
  const buildingAlerts: NotificationItem[] = buildings
    .filter((f) => f.properties.condition === "Critical")
    .map((f) => {
      const [lat, lng] = polygonCentroid(f);
      return {
        id: `alert-bld-${f.properties.id}`,
        title: `${f.properties.name} flagged Critical`,
        description: `Last inspected ${f.properties.last_inspected} · ${f.properties.type}`,
        severity: "critical",
        lat,
        lng,
        selection: { kind: "building", id: f.properties.id },
        timestamp: f.properties.last_inspected,
      };
    });

  const utilityAlerts: NotificationItem[] = utilities
    .filter((f) => f.properties.status === "Maintenance")
    .map((f) => {
      const [lng, lat] = f.geometry.coordinates;
      return {
        id: `alert-utl-${f.properties.id}`,
        title: `${f.properties.utility_type} asset under maintenance`,
        description: `${f.properties.id} · ${f.properties.capacity}`,
        severity: "warning",
        lat,
        lng,
        selection: { kind: "utility", id: f.properties.id },
        timestamp: "",
      };
    });

  const incidentAlerts: NotificationItem[] = [...incidents]
    .sort((a, b) => (a.reportedAt < b.reportedAt ? 1 : -1))
    .map((incident) => ({
      id: `alert-inc-${incident.id}`,
      title: incident.title,
      description: `${incident.category} · Reported incident`,
      severity: incident.priority === "High" ? "critical" : incident.priority === "Medium" ? "warning" : "info",
      lat: incident.lat,
      lng: incident.lng,
      timestamp: incident.reportedAt,
    }));

  const severityRank: Record<NotificationItem["severity"], number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return [...incidentAlerts, ...buildingAlerts, ...utilityAlerts].sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity]
  );
}
