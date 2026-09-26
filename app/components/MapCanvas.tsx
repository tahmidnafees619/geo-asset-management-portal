"use client";

import type { Layer } from "leaflet";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
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
  flyToTarget: FlyToTarget | null;
  onSelectBuilding: (id: string) => void;
  onSelectUtility: (id: string) => void;
  onMapClick: (lat: number, lng: number) => void;
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
  flyToTarget,
  onSelectBuilding,
  onSelectUtility,
  onMapClick,
}: MapCanvasProps) {
  // onEachFeature closures are captured once when a GeoJSON layer is (re)created,
  // so reportMode is read through a ref to avoid acting on a stale value on click.
  const reportModeRef = useRef(reportMode);
  useEffect(() => {
    reportModeRef.current = reportMode;
  }, [reportMode]);

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

  return (
    <MapContainer
      center={CITY_CENTER}
      zoom={DEFAULT_ZOOM}
      className={`h-full w-full bg-slate-950 ${reportMode ? "reporting-cursor" : ""}`}
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
              if (reportModeRef.current) return;
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
              if (reportModeRef.current) return;
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
          >
            <Tooltip direction="top" className="map-tooltip">
              {incident.title} · {incident.category}
            </Tooltip>
          </Marker>
        ))}
    </MapContainer>
  );
}
