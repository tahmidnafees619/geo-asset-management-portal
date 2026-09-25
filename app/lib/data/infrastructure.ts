import type { FeatureCollection, LineString, Point, Polygon } from "geojson";

export type AssetCondition = "Optimal" | "Warning" | "Critical";
export type UtilityType = "Power" | "Water";
export type UtilityStatus = "Active" | "Maintenance";
export type SurfaceType = "Asphalt" | "Concrete" | "Gravel";
export type TrafficLoad = "Low" | "Medium" | "High";

export interface BuildingProperties {
  id: string;
  name: string;
  type: string;
  condition: AssetCondition;
  built_year: number;
  last_inspected: string;
}

export interface UtilityProperties {
  id: string;
  utility_type: UtilityType;
  capacity: string;
  status: UtilityStatus;
}

export interface RoadProperties {
  id: string;
  street_name: string;
  surface_type: SurfaceType;
  traffic_load: TrafficLoad;
}

// Small helper to build a rectangular building footprint from a center point.
function footprint(
  [lng, lat]: [number, number],
  halfWidth = 0.0009,
  halfHeight = 0.0006
): Polygon {
  return {
    type: "Polygon",
    coordinates: [
      [
        [lng - halfWidth, lat - halfHeight],
        [lng + halfWidth, lat - halfHeight],
        [lng + halfWidth, lat + halfHeight],
        [lng - halfWidth, lat + halfHeight],
        [lng - halfWidth, lat - halfHeight],
      ],
    ],
  };
}

export const buildingsData: FeatureCollection<Polygon, BuildingProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "BLD-001",
        name: "Gulshan Municipal Hall",
        type: "Civic Building",
        condition: "Optimal",
        built_year: 1998,
        last_inspected: "2026-06-12",
      },
      geometry: footprint([90.4152, 23.8121]),
    },
    {
      type: "Feature",
      properties: {
        id: "BLD-002",
        name: "Banani Water Treatment Facility",
        type: "Utility Plant",
        condition: "Warning",
        built_year: 1985,
        last_inspected: "2026-03-04",
      },
      geometry: footprint([90.4051, 23.8188], 0.0011, 0.0008),
    },
    {
      type: "Feature",
      properties: {
        id: "BLD-003",
        name: "Mohakhali Fire Station 4",
        type: "Emergency Services",
        condition: "Optimal",
        built_year: 2011,
        last_inspected: "2026-08-01",
      },
      geometry: footprint([90.4021, 23.7784]),
    },
    {
      type: "Feature",
      properties: {
        id: "BLD-004",
        name: "Tejgaon Substation Complex",
        type: "Power Facility",
        condition: "Critical",
        built_year: 1979,
        last_inspected: "2025-11-19",
      },
      geometry: footprint([90.3964, 23.7654], 0.001, 0.0007),
    },
    {
      type: "Feature",
      properties: {
        id: "BLD-005",
        name: "Dhanmondi Public Library",
        type: "Civic Building",
        condition: "Optimal",
        built_year: 2005,
        last_inspected: "2026-05-22",
      },
      geometry: footprint([90.3742, 23.7461]),
    },
    {
      type: "Feature",
      properties: {
        id: "BLD-006",
        name: "Mirpur Sewage Pumping Station",
        type: "Utility Plant",
        condition: "Warning",
        built_year: 1992,
        last_inspected: "2026-02-14",
      },
      geometry: footprint([90.3654, 23.8069], 0.0009, 0.0009),
    },
    {
      type: "Feature",
      properties: {
        id: "BLD-007",
        name: "Uttara Zone Administration Center",
        type: "Civic Building",
        condition: "Optimal",
        built_year: 2016,
        last_inspected: "2026-07-30",
      },
      geometry: footprint([90.3995, 23.8759]),
    },
    {
      type: "Feature",
      properties: {
        id: "BLD-008",
        name: "Motijheel Central Depot",
        type: "Maintenance Yard",
        condition: "Critical",
        built_year: 1972,
        last_inspected: "2025-09-27",
      },
      geometry: footprint([90.4172, 23.7331], 0.0012, 0.0007),
    },
    {
      type: "Feature",
      properties: {
        id: "BLD-009",
        name: "Bashundhara Community Center",
        type: "Civic Building",
        condition: "Optimal",
        built_year: 2019,
        last_inspected: "2026-08-15",
      },
      geometry: footprint([90.4265, 23.8154]),
    },
    {
      type: "Feature",
      properties: {
        id: "BLD-010",
        name: "Lalbagh Storm Drain Control House",
        type: "Utility Plant",
        condition: "Warning",
        built_year: 1988,
        last_inspected: "2026-01-09",
      },
      geometry: footprint([90.3888, 23.7188], 0.0008, 0.0006),
    },
    {
      type: "Feature",
      properties: {
        id: "BLD-011",
        name: "Khilgaon Transformer House",
        type: "Power Facility",
        condition: "Critical",
        built_year: 1981,
        last_inspected: "2025-12-02",
      },
      geometry: footprint([90.4276, 23.7492], 0.0009, 0.0007),
    },
    {
      type: "Feature",
      properties: {
        id: "BLD-012",
        name: "Shyamoli Traffic Command Post",
        type: "Civic Building",
        condition: "Optimal",
        built_year: 2021,
        last_inspected: "2026-09-02",
      },
      geometry: footprint([90.3634, 23.7712]),
    },
  ],
};

export const utilitiesData: FeatureCollection<Point, UtilityProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "UTL-001", utility_type: "Power", capacity: "11 kV Feeder", status: "Active" },
      geometry: { type: "Point", coordinates: [90.412, 23.809] },
    },
    {
      type: "Feature",
      properties: { id: "UTL-002", utility_type: "Water", capacity: "450 mm Main", status: "Active" },
      geometry: { type: "Point", coordinates: [90.4083, 23.8016] },
    },
    {
      type: "Feature",
      properties: { id: "UTL-003", utility_type: "Power", capacity: "33 kV Substation Tap", status: "Maintenance" },
      geometry: { type: "Point", coordinates: [90.3982, 23.793] },
    },
    {
      type: "Feature",
      properties: { id: "UTL-004", utility_type: "Water", capacity: "300 mm Distribution", status: "Active" },
      geometry: { type: "Point", coordinates: [90.3861, 23.7801] },
    },
    {
      type: "Feature",
      properties: { id: "UTL-005", utility_type: "Power", capacity: "11 kV Feeder", status: "Active" },
      geometry: { type: "Point", coordinates: [90.375, 23.7554] },
    },
    {
      type: "Feature",
      properties: { id: "UTL-006", utility_type: "Water", capacity: "600 mm Trunk Main", status: "Maintenance" },
      geometry: { type: "Point", coordinates: [90.3699, 23.8112] },
    },
    {
      type: "Feature",
      properties: { id: "UTL-007", utility_type: "Power", capacity: "0.4 kV Distribution", status: "Active" },
      geometry: { type: "Point", coordinates: [90.4041, 23.8703] },
    },
    {
      type: "Feature",
      properties: { id: "UTL-008", utility_type: "Water", capacity: "250 mm Distribution", status: "Active" },
      geometry: { type: "Point", coordinates: [90.4211, 23.7419] },
    },
  ],
};

export const roadsData: FeatureCollection<LineString, RoadProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "RD-001", street_name: "Gulshan Avenue", surface_type: "Asphalt", traffic_load: "High" },
      geometry: {
        type: "LineString",
        coordinates: [
          [90.4109, 23.7938],
          [90.4142, 23.8058],
          [90.4159, 23.8177],
        ],
      },
    },
    {
      type: "Feature",
      properties: { id: "RD-002", street_name: "Mirpur Road", surface_type: "Asphalt", traffic_load: "High" },
      geometry: {
        type: "LineString",
        coordinates: [
          [90.3688, 23.7318],
          [90.3702, 23.7601],
          [90.3679, 23.7889],
          [90.3654, 23.8069],
        ],
      },
    },
    {
      type: "Feature",
      properties: { id: "RD-003", street_name: "Airport Road", surface_type: "Concrete", traffic_load: "Medium" },
      geometry: {
        type: "LineString",
        coordinates: [
          [90.4021, 23.7955],
          [90.3999, 23.8342],
          [90.3995, 23.8759],
        ],
      },
    },
    {
      type: "Feature",
      properties: { id: "RD-004", street_name: "Tejgaon Link Road", surface_type: "Asphalt", traffic_load: "Medium" },
      geometry: {
        type: "LineString",
        coordinates: [
          [90.3964, 23.7654],
          [90.4012, 23.7712],
          [90.4066, 23.7768],
        ],
      },
    },
    {
      type: "Feature",
      properties: { id: "RD-005", street_name: "Motijheel By-Lane", surface_type: "Gravel", traffic_load: "Low" },
      geometry: {
        type: "LineString",
        coordinates: [
          [90.4152, 23.729],
          [90.4172, 23.7331],
          [90.4198, 23.7367],
        ],
      },
    },
    {
      type: "Feature",
      properties: { id: "RD-006", street_name: "Dhanmondi Lake Road", surface_type: "Concrete", traffic_load: "Low" },
      geometry: {
        type: "LineString",
        coordinates: [
          [90.3699, 23.7412],
          [90.3742, 23.7461],
          [90.3781, 23.7508],
        ],
      },
    },
    {
      type: "Feature",
      properties: { id: "RD-007", street_name: "Progoti Sarani", surface_type: "Asphalt", traffic_load: "High" },
      geometry: {
        type: "LineString",
        coordinates: [
          [90.4224, 23.7789],
          [90.4249, 23.7971],
          [90.4265, 23.8154],
        ],
      },
    },
  ],
};
