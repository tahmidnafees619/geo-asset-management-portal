export type BasemapId = "dark" | "satellite" | "osm";

export interface BasemapConfig {
  id: BasemapId;
  label: string;
  description: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export const BASEMAPS: BasemapConfig[] = [
  {
    id: "dark",
    label: "Dark Canvas",
    description: "Low-glare vector basemap for operations consoles",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  {
    id: "satellite",
    label: "Satellite Imagery",
    description: "High-resolution Esri World Imagery",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
  },
  {
    id: "osm",
    label: "Standard OSM",
    description: "Classic OpenStreetMap cartography",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
];

export const DEFAULT_BASEMAP: BasemapId = "dark";

export function getBasemap(id: BasemapId): BasemapConfig {
  return BASEMAPS.find((b) => b.id === id) ?? BASEMAPS[0];
}
