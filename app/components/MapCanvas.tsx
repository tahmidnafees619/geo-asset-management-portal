"use client";

import type { Layer } from "leaflet";
import L from "leaflet";
import { GeoJSON, MapContainer, TileLayer, ZoomControl, useMapEvents } from "react-leaflet";
import type { Feature, Point } from "geojson";
import {
  buildingsData,
  roadsData,
  utilitiesData,
  type BuildingProperties,
  type RoadProperties,
  type UtilityProperties,
} from "../lib/data/infrastructure";
import { buildingStyle, createUtilityIcon, roadStyle } from "../lib/mapStyles";

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
}

interface MapCanvasProps {
  onMouseMove: (lat: number, lng: number) => void;
  onMouseLeave?: () => void;
  visibleLayers: LayerVisibility;
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

function bindBuildingPopup(feature: Feature<never, BuildingProperties>, layer: Layer) {
  const { name, type, condition, built_year, last_inspected } = feature.properties;
  layer.bindPopup(
    `<div class="text-xs leading-relaxed">
      <p class="font-semibold text-slate-100">${name}</p>
      <p class="text-slate-400">${type} &middot; Built ${built_year}</p>
      <p class="mt-1">Condition: <span class="font-medium">${condition}</span></p>
      <p class="text-slate-400">Last inspected ${last_inspected}</p>
    </div>`
  );
}

function bindUtilityPopup(feature: Feature<Point, UtilityProperties>, layer: Layer) {
  const { utility_type, capacity, status } = feature.properties;
  layer.bindPopup(
    `<div class="text-xs leading-relaxed">
      <p class="font-semibold text-slate-100">${utility_type} Asset</p>
      <p class="text-slate-400">${capacity}</p>
      <p class="mt-1">Status: <span class="font-medium">${status}</span></p>
    </div>`
  );
}

function bindRoadPopup(feature: Feature<never, RoadProperties>, layer: Layer) {
  const { street_name, surface_type, traffic_load } = feature.properties;
  layer.bindPopup(
    `<div class="text-xs leading-relaxed">
      <p class="font-semibold text-slate-100">${street_name}</p>
      <p class="text-slate-400">${surface_type} surface</p>
      <p class="mt-1">Traffic load: <span class="font-medium">${traffic_load}</span></p>
    </div>`
  );
}

export default function MapCanvas({ onMouseMove, onMouseLeave, visibleLayers }: MapCanvasProps) {
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

      {visibleLayers.roads && (
        <GeoJSON
          key="roads"
          data={roadsData}
          style={(feature) =>
            roadStyle(feature!.properties!.surface_type, feature!.properties!.traffic_load)
          }
          onEachFeature={bindRoadPopup as (feature: Feature, layer: Layer) => void}
        />
      )}

      {visibleLayers.buildings && (
        <GeoJSON
          key="buildings"
          data={buildingsData}
          style={(feature) => buildingStyle(feature!.properties!.condition)}
          onEachFeature={bindBuildingPopup as (feature: Feature, layer: Layer) => void}
        />
      )}

      {visibleLayers.utilities && (
        <GeoJSON
          key="utilities"
          data={utilitiesData}
          pointToLayer={(feature, latlng) =>
            L.marker(latlng, {
              icon: createUtilityIcon(feature.properties.utility_type, feature.properties.status),
            })
          }
          onEachFeature={bindUtilityPopup as (feature: Feature, layer: Layer) => void}
        />
      )}
    </MapContainer>
  );
}
