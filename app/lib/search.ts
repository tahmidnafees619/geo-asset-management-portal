import type { Feature, LineString, Point, Polygon } from "geojson";
import type { BuildingProperties, RoadProperties, UtilityProperties } from "./data/infrastructure";
import { lineMidpoint, polygonCentroid } from "./geo";

export interface SearchResult {
  refId: string;
  label: string;
  subtitle: string;
  category: "Building" | "Utility" | "Road";
  kind: "building" | "utility" | "road";
  lat: number;
  lng: number;
  zoom: number;
}

export function buildSearchIndex(
  buildings: Feature<Polygon, BuildingProperties>[],
  utilities: Feature<Point, UtilityProperties>[],
  roads: Feature<LineString, RoadProperties>[]
): SearchResult[] {
  const buildingResults: SearchResult[] = buildings.map((feature) => {
    const [lat, lng] = polygonCentroid(feature);
    return {
      refId: feature.properties.id,
      label: feature.properties.name,
      subtitle: `${feature.properties.id} · ${feature.properties.type} · ${feature.properties.condition}`,
      category: "Building",
      kind: "building",
      lat,
      lng,
      zoom: 16,
    };
  });

  const utilityResults: SearchResult[] = utilities.map((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    return {
      refId: feature.properties.id,
      label: `${feature.properties.utility_type} Asset — ${feature.properties.id}`,
      subtitle: `${feature.properties.capacity} · ${feature.properties.status}`,
      category: "Utility",
      kind: "utility",
      lat,
      lng,
      zoom: 17,
    };
  });

  const roadResults: SearchResult[] = roads.map((feature) => {
    const [lat, lng] = lineMidpoint(feature);
    return {
      refId: feature.properties.id,
      label: feature.properties.street_name,
      subtitle: `${feature.properties.surface_type} · ${feature.properties.traffic_load} traffic`,
      category: "Road",
      kind: "road",
      lat,
      lng,
      zoom: 15,
    };
  });

  return [...buildingResults, ...utilityResults, ...roadResults];
}

export function searchIndex(index: SearchResult[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return index.slice(0, 8);
  return index
    .filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.refId.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    )
    .slice(0, 8);
}
