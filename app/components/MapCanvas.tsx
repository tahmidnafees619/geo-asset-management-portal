"use client";

import L from "leaflet";
import { MapContainer, TileLayer, ZoomControl, useMapEvents } from "react-leaflet";

// Leaflet's default marker icons reference relative asset paths that break
// under Next.js bundling — point them at the CDN instead.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CITY_CENTER: [number, number] = [23.8103, 90.4125];
const DEFAULT_ZOOM = 13;

interface MapCanvasProps {
  onMouseMove: (lat: number, lng: number) => void;
  onMouseLeave?: () => void;
}

function MouseTracker({ onMouseMove, onMouseLeave }: MapCanvasProps) {
  useMapEvents({
    mousemove(e) {
      onMouseMove(e.latlng.lat, e.latlng.lng);
    },
    mouseout() {
      onMouseLeave?.();
    },
  });
  return null;
}

export default function MapCanvas({ onMouseMove, onMouseLeave }: MapCanvasProps) {
  return (
    <MapContainer
      center={CITY_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full bg-slate-950"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <MouseTracker onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} />
    </MapContainer>
  );
}
