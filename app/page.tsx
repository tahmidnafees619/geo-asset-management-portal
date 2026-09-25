"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { Building2, Route, Zap } from "lucide-react";
import Header from "./components/Header";
import Sidebar, { type SidebarLayer } from "./components/Sidebar";
import StatusBar from "./components/StatusBar";
import { buildingsData, roadsData, utilitiesData } from "./lib/data/infrastructure";
import { toCoordinateReadout } from "./lib/projections";
import type { LayerVisibility } from "./components/MapCanvas";

// Leaflet touches `window` on import, so the map must never render on the server.
const MapCanvas = dynamic(() => import("./components/MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-950 text-sm text-slate-500">
      Loading map engine…
    </div>
  ),
});

const SIDEBAR_LAYERS: SidebarLayer[] = [
  {
    id: "buildings",
    label: "Municipal Buildings",
    icon: Building2,
    count: buildingsData.features.length,
    color: "text-emerald-400",
  },
  {
    id: "utilities",
    label: "Utility Assets",
    icon: Zap,
    count: utilitiesData.features.length,
    color: "text-sky-400",
  },
  {
    id: "roads",
    label: "Roadway Network",
    icon: Route,
    count: roadsData.features.length,
    color: "text-amber-400",
  },
];

export default function Home() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<LayerVisibility>({
    buildings: true,
    utilities: true,
    roads: true,
  });

  const handleMouseMove = useCallback((lat: number, lng: number) => {
    setCoords({ lat, lng });
  }, []);

  const handleMouseLeave = useCallback(() => setCoords(null), []);

  const handleToggleLayer = useCallback((id: string) => {
    setVisibleLayers((prev) => ({ ...prev, [id]: !prev[id as keyof LayerVisibility] }));
  }, []);

  const readout = coords ? toCoordinateReadout(coords.lat, coords.lng) : null;

  const activeLayerMap = useMemo(
    () => visibleLayers as unknown as Record<string, boolean>,
    [visibleLayers]
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar layers={SIDEBAR_LAYERS} active={activeLayerMap} onToggle={handleToggleLayer} />
        <main className="relative flex-1 overflow-hidden">
          <MapCanvas
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            visibleLayers={visibleLayers}
          />
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
