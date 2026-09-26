/**
 * Client-side math behind the Measure Tool: running polyline distance and,
 * once a sketch has 3+ vertices, its enclosed area — both computed from
 * plain lat/lng points with no geometry library dependency.
 */
import { haversineMeters } from "./geo";

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Total length of an open polyline: the sum of the great-circle
 * (haversine) distance between each consecutive pair of vertices. This is
 * the same formula `lib/geo.ts` uses for the proximity buffer, just chained
 * segment-by-segment rather than point-to-point.
 */
export function pathDistanceMeters(points: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineMeters(points[i - 1], points[i]);
  }
  return total;
}

/**
 * Enclosed area of a closed polygon sketched from lat/lng vertices, via an
 * **equirectangular projection + the shoelace formula**:
 *
 * 1. Project each lat/lng vertex to local planar meters (x, y) around the
 *    sketch's own mean latitude (`lat0`). `x` is scaled by `cos(lat0)`
 *    because a degree of longitude covers less ground the further you are
 *    from the equator — without that correction, area would be
 *    overestimated at higher latitudes.
 * 2. Run the shoelace formula over the resulting (x, y) polygon:
 *    `area = |Σ(xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)| / 2`, wrapping the last vertex back to
 *    the first via `(i + 1) % length`.
 *
 * This is a planar approximation, not a true geodesic area — accurate to
 * well under 1% at city-block/neighborhood scale (a few km across), which
 * is what this tool is for. It would need a proper geodesic algorithm
 * (e.g. Karney's) to stay accurate over country-sized polygons.
 */
export function planarAreaSqMeters(points: LatLng[]): number {
  if (points.length < 3) return 0;
  const EARTH_RADIUS_M = 6371000;
  const lat0 = (points.reduce((sum, p) => sum + p.lat, 0) / points.length) * (Math.PI / 180);
  const toXY = (p: LatLng) => ({
    x: (p.lng * Math.PI) / 180 * Math.cos(lat0) * EARTH_RADIUS_M,
    y: (p.lat * Math.PI) / 180 * EARTH_RADIUS_M,
  });
  const xy = points.map(toXY);
  let area = 0;
  for (let i = 0; i < xy.length; i++) {
    const a = xy[i];
    const b = xy[(i + 1) % xy.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area / 2);
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${meters.toFixed(1)} m`;
}

export function formatArea(sqMeters: number): string {
  if (sqMeters >= 1_000_000) return `${(sqMeters / 1_000_000).toFixed(2)} km²`;
  return `${sqMeters.toLocaleString(undefined, { maximumFractionDigits: 0 })} m²`;
}
