"use client";

/**
 * The Leaflet map engine.
 *
 * ## The `{ ssr: false }` dynamic-import contract
 * Leaflet reads `window`/`document` as soon as it's imported (for feature
 * detection — pointer events, touch support, etc.), which doesn't exist
 * during Next.js server-side rendering and would crash the server render.
 * This component is therefore never imported directly — `app/page.tsx`
 * loads it exclusively via `next/dynamic` with `{ ssr: false }`:
 *
 *   const MapCanvas = dynamic(() => import("./components/MapCanvas"), { ssr: false });
 *
 * That tells Next.js to skip this module entirely on the server and only
 * fetch/evaluate it in the browser, after hydration. Do not add a static
 * `import MapCanvas from "./components/MapCanvas"` anywhere in a
 * server-rendered path — that would reintroduce the crash this guards
 * against. The default export here is a plain component; the `ssr: false`
 * behavior lives entirely in the `dynamic()` call at the import site.
 *
 * ## Event suppression during Report Incident / Measure mode
 * `reportMode` and `measureMode` are "click the map to do X" tools. While
 * either is active, clicking a building/utility/incident must NOT also open
 * its inspector — it should only place an incident pin or a measurement
 * vertex. See the per-layer `onEachFeature`/`eventHandlers` click handlers
 * below: each checks the active tool mode first and, if a tool is active,
 * returns early without calling `L.DomEvent.stopPropagation`, letting the
 * click bubble up to `ReportClickHandler`/`MeasureClickHandler` on the map
 * itself instead of opening the Feature Inspector.
 */
import type { Layer } from "leaflet";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import {
  Circle,
  CircleMarker,
  GeoJSON,
  MapContainer,
  Marker,
  Polygon as LeafletPolygon,
  Polyline,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { Feature, FeatureCollection, Point, Polygon } from "geojson";
import {
  roadsData,
  type BuildingProperties,
  type UtilityProperties,
} from "../lib/data/infrastructure";
import type { Incident } from "../lib/data/incidents";
import { buildingStyle, createIncidentIcon, createUtilityIcon, roadStyle } from "../lib/mapStyles";
import { getBasemap, type BasemapId } from "../lib/basemaps";
import type { LatLng } from "../lib/measurement";

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
const BUFFER_RADIUS_M = 300;

export interface LayerVisibility {
  buildings: boolean;
  utilities: boolean;
  roads: boolean;
  incidents: boolean;
}

export interface LayerOpacity {
  buildings: number;
  utilities: number;
  roads: number;
  incidents: number;
}

export interface FlyToTarget {
  lat: number;
  lng: number;
  zoom: number;
  nonce: number;
}

interface MapCanvasProps {
  onMouseMove: (lat: number, lng: number) => void;
  onMouseLeave?: () => void;
  visibleLayers: LayerVisibility;
  layerOpacity: LayerOpacity;
  basemap: BasemapId;
  buildings: FeatureCollection<Polygon, BuildingProperties>;
  utilities: FeatureCollection<Point, UtilityProperties>;
  incidents: Incident[];
  reportMode: boolean;
  measureMode: boolean;
  measurePoints: LatLng[];
  bufferCenter: LatLng | null;
  flyToTarget: FlyToTarget | null;
  onSelectBuilding: (id: string) => void;
  onSelectUtility: (id: string) => void;
  onSelectIncident: (id: string) => void;
  onMapClick: (lat: number, lng: number) => void;
  onMeasureClick: (lat: number, lng: number) => void;
}

interface MouseTrackerProps {
  onMouseMove: (lat: number, lng: number) => void;
  onMouseLeave?: () => void;
}

function MouseTracker({ onMouseMove, onMouseLeave }: MouseTrackerProps) {
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

function ReportClickHandler({
  reportMode,
  onMapClick,
}: {
  reportMode: boolean;
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (reportMode) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MeasureClickHandler({
  measureMode,
  onMeasureClick,
}: {
  measureMode: boolean;
  onMeasureClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (measureMode) onMeasureClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToController({ target }: { target: FlyToTarget | null }) {
  const map = useMap();
  const lastNonce = useRef<number | null>(null);

  useEffect(() => {
    if (!target || target.nonce === lastNonce.current) return;
    lastNonce.current = target.nonce;
    map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.1 });
  }, [target, map]);

  return null;
}

export default function MapCanvas({
  onMouseMove,
  onMouseLeave,
  visibleLayers,
  layerOpacity,
  basemap,
  buildings,
  utilities,
  incidents,
  reportMode,
  measureMode,
  measurePoints,
  bufferCenter,
  flyToTarget,
  onSelectBuilding,
  onSelectUtility,
  onSelectIncident,
  onMapClick,
  onMeasureClick,
}: MapCanvasProps) {
  // onEachFeature closures are captured once when a GeoJSON layer is (re)created,
  // so tool-mode flags are read through refs to avoid acting on stale values on click.
  const reportModeRef = useRef(reportMode);
  useEffect(() => {
    reportModeRef.current = reportMode;
  }, [reportMode]);
  const measureModeRef = useRef(measureMode);
  useEffect(() => {
    measureModeRef.current = measureMode;
  }, [measureMode]);

  const buildingsKey = useMemo(
    () =>
      `buildings-${Math.round(layerOpacity.buildings * 20)}-${buildings.features
        .map((f) => `${f.properties.id}:${f.properties.condition}`)
        .join("|")}`,
    [buildings, layerOpacity.buildings]
  );
  const utilitiesKey = useMemo(
    () =>
      `utilities-${Math.round(layerOpacity.utilities * 20)}-${utilities.features
        .map((f) => `${f.properties.id}:${f.properties.status}`)
        .join("|")}`,
    [utilities, layerOpacity.utilities]
  );
  const roadsKey = useMemo(() => `roads-${Math.round(layerOpacity.roads * 20)}`, [layerOpacity.roads]);

  const activeBasemap = getBasemap(basemap);
  const toolActive = reportMode || measureMode;

  return (
    <MapContainer
      center={CITY_CENTER}
      zoom={DEFAULT_ZOOM}
      className={`h-full w-full bg-slate-950 ${toolActive ? "reporting-cursor" : ""}`}
      zoomControl={false}
    >
      <TileLayer
        key={activeBasemap.id}
        attribution={activeBasemap.attribution}
        url={activeBasemap.url}
        maxZoom={activeBasemap.maxZoom}
      />
      <ZoomControl position="bottomright" />
      <MouseTracker onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} />
      <ReportClickHandler reportMode={reportMode} onMapClick={onMapClick} />
      <MeasureClickHandler measureMode={measureMode} onMeasureClick={onMeasureClick} />
      <FlyToController target={flyToTarget} />

      {visibleLayers.roads && (
        <GeoJSON
          key={roadsKey}
          data={roadsData}
          style={(feature) =>
            roadStyle(
              feature!.properties!.surface_type,
              feature!.properties!.traffic_load,
              layerOpacity.roads
            )
          }
          onEachFeature={(feature, layer) => {
            layer.bindTooltip(feature.properties!.street_name, {
              direction: "top",
              sticky: true,
              className: "map-tooltip",
            });
          }}
        />
      )}

      {visibleLayers.buildings && (
        <GeoJSON
          key={buildingsKey}
          data={buildings}
          style={(feature) => buildingStyle(feature!.properties!.condition, layerOpacity.buildings)}
          onEachFeature={(feature, layer: Layer) => {
            const props = (feature as Feature<Polygon, BuildingProperties>).properties;
            layer.bindTooltip(props.name, {
              direction: "top",
              sticky: true,
              className: "map-tooltip",
            });
            layer.on("click", (e) => {
              if (reportModeRef.current || measureModeRef.current) return;
              L.DomEvent.stopPropagation(e);
              onSelectBuilding(props.id);
            });
          }}
        />
      )}

      {visibleLayers.utilities && (
        <GeoJSON
          key={utilitiesKey}
          data={utilities}
          pointToLayer={(feature, latlng) =>
            L.marker(latlng, {
              icon: createUtilityIcon(
                feature.properties.utility_type,
                feature.properties.status,
                layerOpacity.utilities
              ),
            })
          }
          onEachFeature={(feature, layer: Layer) => {
            const props = (feature as Feature<Point, UtilityProperties>).properties;
            layer.bindTooltip(`${props.utility_type} Asset`, {
              direction: "top",
              sticky: true,
              className: "map-tooltip",
            });
            layer.on("click", (e) => {
              if (reportModeRef.current || measureModeRef.current) return;
              L.DomEvent.stopPropagation(e);
              onSelectUtility(props.id);
            });
          }}
        />
      )}

      {visibleLayers.incidents &&
        incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.lat, incident.lng]}
            icon={createIncidentIcon(incident.priority, layerOpacity.incidents)}
            eventHandlers={{
              click: () => {
                if (reportMode || measureMode) return;
                onSelectIncident(incident.id);
              },
            }}
          >
            <Tooltip direction="top" className="map-tooltip">
              {incident.title} · {incident.category}
            </Tooltip>
          </Marker>
        ))}

      {bufferCenter && (
        <Circle
          center={[bufferCenter.lat, bufferCenter.lng]}
          radius={BUFFER_RADIUS_M}
          pathOptions={{
            color: "#34d399",
            weight: 1.5,
            fillColor: "#10b981",
            fillOpacity: 0.12,
            dashArray: "6 4",
          }}
        />
      )}

      {measurePoints.length > 0 && (
        <>
          <Polyline
            positions={measurePoints.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: "#facc15", weight: 2, dashArray: "5 5" }}
          />
          {measurePoints.length >= 3 && (
            <LeafletPolygon
              positions={measurePoints.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: "#facc15", weight: 1, fillColor: "#facc15", fillOpacity: 0.08 }}
            />
          )}
          {measurePoints.map((p, i) => (
            <CircleMarker
              key={i}
              center={[p.lat, p.lng]}
              radius={4}
              pathOptions={{ color: "#facc15", fillColor: "#0f172a", fillOpacity: 1, weight: 2 }}
            />
          ))}
        </>
      )}
    </MapContainer>
  );
}
