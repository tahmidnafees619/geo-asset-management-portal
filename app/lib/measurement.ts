import { haversineMeters } from "./geo";

export interface LatLng {
  lat: number;
  lng: number;
}

export function pathDistanceMeters(points: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineMeters(points[i - 1], points[i]);
  }
  return total;
}

// Equirectangular projection around the path's own latitude band, then the
// shoelace formula — plenty accurate for a city-block-scale measuring tool
// without pulling in a full geodesy library.
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
