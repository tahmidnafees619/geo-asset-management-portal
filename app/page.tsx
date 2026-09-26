"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, Route, Zap } from "lucide-react";
import Header from "./components/Header";
import Sidebar, { type SidebarLayer } from "./components/Sidebar";
import StatusBar from "./components/StatusBar";
import FeatureDrawer, { type DrawerFeature } from "./components/FeatureDrawer";
import IncidentModal from "./components/IncidentModal";
import CommandPalette from "./components/CommandPalette";
import ExportModal from "./components/ExportModal";
import SettingsPanel from "./components/SettingsPanel";
import HealthHud from "./components/HealthHud";
import {
  buildingsData,
  roadsData,
  utilitiesData,
  type AssetCondition,
  type UtilityStatus,
} from "./lib/data/infrastructure";
import type { Incident, IncidentCategory, IncidentPriority } from "./lib/data/incidents";
import { toCoordinateReadout } from "./lib/projections";
import type { SelectedFeature } from "./lib/selection";
import { buildSearchIndex, type SearchResult } from "./lib/search";
import { buildNotifications, type NotificationItem } from "./lib/notifications";
import { DEFAULT_BASEMAP, type BasemapId } from "./lib/basemaps";
import type { FlyToTarget, LayerOpacity, LayerVisibility } from "./components/MapCanvas";

// Leaflet touches `window` on import, so the map must never render on the server.
const MapCanvas = dynamic(() => import("./components/MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-950 text-sm text-slate-500">
      Loading map engine…
    </div>
  ),
});

const DEFAULT_LAYER_OPACITY: LayerOpacity = {
  buildings: 1,
  utilities: 1,
  roads: 1,
  incidents: 1,
};

export default function Home() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [buildings, setBuildings] = useState(buildingsData);
  const [utilities, setUtilities] = useState(utilitiesData);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [visibleLayers, setVisibleLayers] = useState<LayerVisibility>({
    buildings: true,
    utilities: true,
    roads: true,
    incidents: true,
  });
  const [layerOpacity, setLayerOpacity] = useState<LayerOpacity>(DEFAULT_LAYER_OPACITY);
  const [basemap, setBasemap] = useState<BasemapId>(DEFAULT_BASEMAP);
  const [selection, setSelection] = useState<SelectedFeature | null>(null);
  const [reportMode, setReportMode] = useState(false);
  const [pendingIncident, setPendingIncident] = useState<{ lat: number; lng: number } | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<FlyToTarget | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleMouseMove = useCallback((lat: number, lng: number) => {
    setCoords({ lat, lng });
  }, []);

  const handleMouseLeave = useCallback(() => setCoords(null), []);

  const handleToggleLayer = useCallback((id: string) => {
    setVisibleLayers((prev) => ({ ...prev, [id]: !prev[id as keyof LayerVisibility] }));
  }, []);

  const handleOpacityChange = useCallback((id: keyof LayerOpacity, value: number) => {
    setLayerOpacity((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleSelectBuilding = useCallback((id: string) => {
    setSettingsOpen(false);
    setSelection({ kind: "building", id });
  }, []);

  const handleSelectUtility = useCallback((id: string) => {
    setSettingsOpen(false);
    setSelection({ kind: "utility", id });
  }, []);

  const handleCloseDrawer = useCallback(() => setSelection(null), []);

  const handleOpenSettings = useCallback(() => {
    setSelection(null);
    setSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => setSettingsOpen(false), []);

  const handleUpdateBuildingCondition = useCallback((id: string, condition: AssetCondition) => {
    setBuildings((prev) => ({
      ...prev,
      features: prev.features.map((feature) =>
        feature.properties.id === id
          ? { ...feature, properties: { ...feature.properties, condition } }
          : feature
      ),
    }));
  }, []);

  const handleUpdateUtilityStatus = useCallback((id: string, status: UtilityStatus) => {
    setUtilities((prev) => ({
      ...prev,
      features: prev.features.map((feature) =>
        feature.properties.id === id
          ? { ...feature, properties: { ...feature.properties, status } }
          : feature
      ),
    }));
  }, []);

  const handleToggleReportMode = useCallback(() => {
    setReportMode((prev) => !prev);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setReportMode(false);
    setPendingIncident({ lat, lng });
  }, []);

  const handleCancelIncident = useCallback(() => setPendingIncident(null), []);

  const handleSubmitIncident = useCallback(
    (data: { title: string; category: IncidentCategory; priority: IncidentPriority }) => {
      setPendingIncident((location) => {
        if (!location) return null;
        setIncidents((prev) => [
          ...prev,
          {
            id: `INC-${Date.now()}`,
            title: data.title,
            category: data.category,
            priority: data.priority,
            lat: location.lat,
            lng: location.lng,
            reportedAt: new Date().toISOString(),
          },
        ]);
        return null;
      });
    },
    []
  );

  const handleSearchSelect = useCallback((result: SearchResult) => {
    setFlyToTarget({ lat: result.lat, lng: result.lng, zoom: result.zoom, nonce: Date.now() });
    setSearchOpen(false);
    if (result.kind === "building") setSelection({ kind: "building", id: result.refId });
    else if (result.kind === "utility") setSelection({ kind: "utility", id: result.refId });
  }, []);

  const handleJumpToNotification = useCallback((notification: NotificationItem) => {
    setFlyToTarget({ lat: notification.lat, lng: notification.lng, zoom: 16, nonce: Date.now() });
    if (notification.selection) setSelection(notification.selection);
  }, []);

  // Global Cmd/Ctrl+K to open the command palette from anywhere.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const readout = coords ? toCoordinateReadout(coords.lat, coords.lng) : null;

  const activeLayerMap = useMemo(
    () => visibleLayers as unknown as Record<string, boolean>,
    [visibleLayers]
  );

  const sidebarLayers: SidebarLayer[] = useMemo(
    () => [
      {
        id: "buildings",
        label: "Municipal Buildings",
        icon: Building2,
        count: buildings.features.length,
        color: "text-emerald-400",
      },
      {
        id: "utilities",
        label: "Utility Assets",
        icon: Zap,
        count: utilities.features.length,
        color: "text-sky-400",
      },
      {
        id: "roads",
        label: "Roadway Network",
        icon: Route,
        count: roadsData.features.length,
        color: "text-amber-400",
      },
      {
        id: "incidents",
        label: "Reported Incidents",
        icon: AlertTriangle,
        count: incidents.length,
        color: "text-rose-400",
      },
    ],
    [buildings, utilities, incidents]
  );

  const drawerFeature: DrawerFeature | null = useMemo(() => {
    if (!selection) return null;
    if (selection.kind === "building") {
      const data = buildings.features.find((f) => f.properties.id === selection.id);
      return data ? { kind: "building", data } : null;
    }
    const data = utilities.features.find((f) => f.properties.id === selection.id);
    return data ? { kind: "utility", data } : null;
  }, [selection, buildings, utilities]);

  const searchIndexData = useMemo(
    () => buildSearchIndex(buildings.features, utilities.features, roadsData.features),
    [buildings, utilities]
  );

  const notifications = useMemo(
    () => buildNotifications(buildings.features, utilities.features, incidents),
    [buildings, utilities, incidents]
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <Header
        reportMode={reportMode}
        onToggleReportMode={handleToggleReportMode}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        onOpenSettings={handleOpenSettings}
        notifications={notifications}
        onJumpToNotification={handleJumpToNotification}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar layers={sidebarLayers} active={activeLayerMap} onToggle={handleToggleLayer} />
        <main className="relative flex-1 overflow-hidden">
          <MapCanvas
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            visibleLayers={visibleLayers}
            layerOpacity={layerOpacity}
            basemap={basemap}
            buildings={buildings}
            utilities={utilities}
            incidents={incidents}
            reportMode={reportMode}
            flyToTarget={flyToTarget}
            onSelectBuilding={handleSelectBuilding}
            onSelectUtility={handleSelectUtility}
            onMapClick={handleMapClick}
          />
          <HealthHud buildings={buildings.features} utilities={utilities.features} incidents={incidents} />
          <StatusBar
            lat={readout?.wgs84.lat ?? null}
            lng={readout?.wgs84.lng ?? null}
            mercatorX={readout?.mercator.x ?? null}
            mercatorY={readout?.mercator.y ?? null}
          />
          <FeatureDrawer
            feature={drawerFeature}
            onClose={handleCloseDrawer}
            onUpdateBuildingCondition={handleUpdateBuildingCondition}
            onUpdateUtilityStatus={handleUpdateUtilityStatus}
          />
          <SettingsPanel
            open={settingsOpen}
            onClose={handleCloseSettings}
            basemap={basemap}
            onBasemapChange={setBasemap}
            layerOpacity={layerOpacity}
            onOpacityChange={handleOpacityChange}
          />
          {pendingIncident && (
            <IncidentModal
              location={pendingIncident}
              onSubmit={handleSubmitIncident}
              onCancel={handleCancelIncident}
            />
          )}
        </main>
      </div>

      {searchOpen && (
        <CommandPalette
          index={searchIndexData}
          onClose={() => setSearchOpen(false)}
          onSelect={handleSearchSelect}
        />
      )}
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        buildings={buildings}
        utilities={utilities}
        roads={roadsData}
        incidents={incidents}
      />
    </div>
  );
}
