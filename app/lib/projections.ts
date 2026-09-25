import proj4 from "proj4";

// proj4 ships EPSG:4326 by default but not EPSG:3857 — register it once.
proj4.defs(
  "EPSG:3857",
  "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrs=@null +wktext +no_defs"
);

export interface CoordinateReadout {
  wgs84: { lng: number; lat: number };
  mercator: { x: number; y: number };
}

export function toCoordinateReadout(lat: number, lng: number): CoordinateReadout {
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
