import type { Feature, LineString, Point, Polygon } from "geojson";
import type { BuildingProperties, UtilityProperties } from "./data/infrastructure";
import type { Incident } from "./data/incidents";

const EARTH_RADIUS_M = 6371000;

export function polygonCentroid(feature: Feature<Polygon>): [number, number] {
  const ring = feature.geometry.coordinates[0].slice(0, -1);
  const sum = ring.reduce((acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat], [0, 0]);
  return [sum[1] / ring.length, sum[0] / ring.length];
}

export function lineMidpoint(feature: Feature<LineString>): [number, number] {
  const coords = feature.geometry.coordinates;
  const [lng, lat] = coords[Math.floor(coords.length / 2)];
  return [lat, lng];
}

export function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface NearbyAsset {
  id: string;
  label: string;
  kind: "building" | "utility" | "incident";
  distance: number;
}

export function findNearbyAssets(
  center: { lat: number; lng: number },
  radiusMeters: number,
  buildings: Feature<Polygon, BuildingProperties>[],
  utilities: Feature<Point, UtilityProperties>[],
  incidents: Incident[],
  excludeId?: string
): NearbyAsset[] {
  const results: NearbyAsset[] = [];

  for (const feature of buildings) {
    if (feature.properties.id === excludeId) continue;
    const [lat, lng] = polygonCentroid(feature);
    const distance = haversineMeters(center, { lat, lng });
    if (distance <= radiusMeters) {
      results.push({ id: feature.properties.id, label: feature.properties.name, kind: "building", distance });
    }
  }

  for (const feature of utilities) {
    if (feature.properties.id === excludeId) continue;
    const [lng, lat] = feature.geometry.coordinates;
    const distance = haversineMeters(center, { lat, lng });
    if (distance <= radiusMeters) {
      results.push({
        id: feature.properties.id,
        label: `${feature.properties.utility_type} Asset — ${feature.properties.id}`,
        kind: "utility",
        distance,
      });
    }
  }

  for (const incident of incidents) {
    if (incident.id === excludeId) continue;
    const distance = haversineMeters(center, { lat: incident.lat, lng: incident.lng });
    if (distance <= radiusMeters) {
      results.push({ id: incident.id, label: incident.title, kind: "incident", distance });
    }
  }

  return results.sort((a, b) => a.distance - b.distance);
}
