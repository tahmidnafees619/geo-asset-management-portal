/**
 * Live dual coordinate reprojection for the status bar's cursor readout.
 *
 * `proj4` ships the WGS84 (`EPSG:4326`) definition built in, but not Web
 * Mercator (`EPSG:3857`) — every other basemap/GIS coordinate system has to
 * be registered explicitly via `proj4.defs` before it can be used as a
 * conversion target. EPSG:3857 is what Leaflet (and virtually every web
 * basemap tile pyramid — OSM, Esri, CARTO) renders tiles in internally: a
 * spherical Mercator projection in meters, `+a=+b=6378137` (the equatorial
 * WGS84 radius applied to both axes, i.e. treated as a perfect sphere rather
 * than an ellipsoid — the standard "Web Mercator" simplification).
 *
 * `proj4(fromCRS, toCRS, [x, y])` always takes and returns coordinates in
 * **[x, y]** axis order, which for geographic CRSes means **[lng, lat]** —
 * the opposite of the `[lat, lng]` order Leaflet's own API uses. Getting
 * this backwards silently swaps latitude and longitude, so every call site
 * in this file is explicit about which order it's passing/returning.
 */
import proj4 from "proj4";

// Register Web Mercator once, at module load, before any conversion runs.
proj4.defs(
  "EPSG:3857",
  "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrs=@null +wktext +no_defs"
);

export interface CoordinateReadout {
  wgs84: { lng: number; lat: number };
  mercator: { x: number; y: number };
}

/** Converts a WGS84 lat/lng pair to both its WGS84 and Web Mercator forms. */
export function toCoordinateReadout(lat: number, lng: number): CoordinateReadout {
  // proj4 expects/returns [lng, lat] ("x, y"), not Leaflet's [lat, lng].
  const [x, y] = proj4("EPSG:4326", "EPSG:3857", [lng, lat]);
  return {
    wgs84: { lng, lat },
    mercator: { x, y },
  };
}

export function formatWgs84(lng: number, lat: number): string {
  return `${lng.toFixed(5)}, ${lat.toFixed(5)}`;
}

export function formatMercator(x: number, y: number): string {
  return `${x.toFixed(2)} m, ${y.toFixed(2)} m`;
}
