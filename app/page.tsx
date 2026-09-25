"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import StatusBar from "./components/StatusBar";
import { toCoordinateReadout } from "./lib/projections";

// Leaflet touches `window` on import, so the map must never render on the server.
const MapCanvas = dynamic(() => import("./components/MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-950 text-sm text-slate-500">
      Loading map engine…
    </div>
  ),
});

export default function Home() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleMouseMove = useCallback((lat: number, lng: number) => {
    setCoords({ lat, lng });
  }, []);

  const handleMouseLeave = useCallback(() => setCoords(null), []);

  const readout = coords ? toCoordinateReadout(coords.lat, coords.lng) : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="relative flex-1 overflow-hidden">
          <MapCanvas onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
          <StatusBar
            lat={readout?.wgs84.lat ?? null}
            lng={readout?.wgs84.lng ?? null}
            mercatorX={readout?.mercator.x ?? null}
            mercatorY={readout?.mercator.y ?? null}
          />
        </main>
      </div>
    </div>
  );
}
