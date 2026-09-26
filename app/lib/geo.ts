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

/**
 * Great-circle distance between two lat/lng points, in meters, via the
 * Haversine formula:
 *
 *   a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlng/2)
 *   d = 2 · R · asin(√a)
 *
 * This treats the Earth as a sphere (not an ellipsoid), which introduces at
 * most ~0.5% error — negligible at the city-block scale this app operates
 * at, and far cheaper than a full geodesic (Vincenty) solution. `Math.min`
 * guards against `√a` drifting fractionally above 1 from floating-point
 * rounding, which would otherwise make `asin` return `NaN`.
 */
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

/**
 * The 300m proximity buffer engine behind "Run Proximity Buffer" in the
 * Feature Inspector and the Incident Reporter.
 *
 * This is a single **O(N)** pass over every building, utility, and incident
 * — one `haversineMeters` call per feature, no spatial index (R-tree/grid).
 * At this dataset's scale (tens of features) that's the right trade-off: a
 * bounding-box pre-filter or quad-tree would only pay for itself once the
 * feature count reaches the thousands, and would add real complexity for no
 * measurable benefit here. If this dataset grows substantially, the cheap
 * next step is a bounding-box pre-check (reject anything outside a
 * `radiusMeters`-sized lat/lng box before the trig-heavy haversine call)
 * ahead of reaching for a full spatial index.
 */
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
