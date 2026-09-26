import type { Feature, FeatureCollection, LineString, Point, Polygon } from "geojson";
import type { BuildingProperties, RoadProperties, UtilityProperties } from "./data/infrastructure";
import type { Incident } from "./data/incidents";

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function toCSV(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => {
    const str = String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  return lines.join("\n");
}

export function exportBuildingsGeoJSON(data: FeatureCollection<Polygon, BuildingProperties>) {
  downloadBlob("municipal-buildings.geojson", JSON.stringify(data, null, 2), "application/geo+json");
}

export function exportBuildingsCSV(features: Feature<Polygon, BuildingProperties>[]) {
  const rows = features.map((f) => ({ ...f.properties }));
  downloadBlob("municipal-buildings.csv", toCSV(rows), "text/csv");
}

export function exportUtilitiesGeoJSON(data: FeatureCollection<Point, UtilityProperties>) {
  downloadBlob("utility-assets.geojson", JSON.stringify(data, null, 2), "application/geo+json");
}

export function exportUtilitiesCSV(features: Feature<Point, UtilityProperties>[]) {
  const rows = features.map((f) => ({
    ...f.properties,
    lng: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
  }));
  downloadBlob("utility-assets.csv", toCSV(rows), "text/csv");
}

export function exportRoadsGeoJSON(data: FeatureCollection<LineString, RoadProperties>) {
  downloadBlob("roadway-network.geojson", JSON.stringify(data, null, 2), "application/geo+json");
}

export function exportRoadsCSV(features: Feature<LineString, RoadProperties>[]) {
  const rows = features.map((f) => ({
    ...f.properties,
    vertex_count: f.geometry.coordinates.length,
  }));
  downloadBlob("roadway-network.csv", toCSV(rows), "text/csv");
}

export function exportIncidentsGeoJSON(incidents: Incident[]) {
  const data: FeatureCollection = {
    type: "FeatureCollection",
    features: incidents.map((incident) => ({
      type: "Feature",
      properties: {
        id: incident.id,
        title: incident.title,
        category: incident.category,
        priority: incident.priority,
        reportedAt: incident.reportedAt,
      },
      geometry: { type: "Point", coordinates: [incident.lng, incident.lat] },
    })),
  };
  downloadBlob("reported-incidents.geojson", JSON.stringify(data, null, 2), "application/geo+json");
}

export function exportIncidentsCSV(incidents: Incident[]) {
  const rows = incidents.map((incident) => ({
    id: incident.id,
    title: incident.title,
    category: incident.category,
    priority: incident.priority,
    lat: incident.lat,
    lng: incident.lng,
    reportedAt: incident.reportedAt,
  }));
  downloadBlob("reported-incidents.csv", toCSV(rows), "text/csv");
}
