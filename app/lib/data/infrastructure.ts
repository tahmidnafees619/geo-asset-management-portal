import type { Feature, FeatureCollection, LineString, Point, Polygon } from "geojson";

export type AssetCondition = "Optimal" | "Warning" | "Critical";
export type UtilityType = "Power" | "Water" | "Gas" | "Fiber";
export type UtilityStatus = "Active" | "Maintenance";
export type SurfaceType = "Asphalt" | "Concrete" | "Gravel";
export type TrafficLoad = "Low" | "Medium" | "High";
export type MaintenancePriority = "Low" | "Medium" | "High";

// HawarIT / BGT-style topography classification carried on every feature so
// the dataset reads like a real municipal CAD/GIS export rather than a demo.
export type BgtBuildingClass = "Pand";
export type BgtUtilityClass = "KabelEnLeiding";
export type BgtRoadClass = "Wegvak";

export interface BuildingProperties {
  id: string;
  name: string;
  type: string;
  condition: AssetCondition;
  built_year: number;
  last_inspected: string;
  bgt_classification: BgtBuildingClass;
  cad_ref_id: string;
  inspected_date: string;
  maintenance_priority: MaintenancePriority;
}

export interface UtilityProperties {
  id: string;
  utility_type: UtilityType;
  capacity: string;
  status: UtilityStatus;
  bgt_classification: BgtUtilityClass;
  cad_ref_id: string;
  inspected_date: string;
  maintenance_priority: MaintenancePriority;
}

export interface RoadProperties {
  id: string;
  street_name: string;
  surface_type: SurfaceType;
  traffic_load: TrafficLoad;
  bgt_classification: BgtRoadClass;
  cad_ref_id: string;
  inspected_date: string;
  maintenance_priority: MaintenancePriority;
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

function mkBuilding(
  id: string,
  name: string,
  type: string,
  condition: AssetCondition,
  built_year: number,
  inspected_date: string,
  center: [number, number],
  maintenance_priority: MaintenancePriority,
  size?: [number, number]
): Feature<Polygon, BuildingProperties> {
  return {
    type: "Feature",
    properties: {
      id,
      name,
      type,
      condition,
      built_year,
      last_inspected: inspected_date,
      bgt_classification: "Pand",
      cad_ref_id: `CAD-${id}`,
      inspected_date,
      maintenance_priority,
    },
    geometry: footprint(center, size?.[0], size?.[1]),
  };
}

function mkUtility(
  id: string,
  utility_type: UtilityType,
  capacity: string,
  status: UtilityStatus,
  coordinates: [number, number],
  inspected_date: string,
  maintenance_priority: MaintenancePriority
): Feature<Point, UtilityProperties> {
  return {
    type: "Feature",
    properties: {
      id,
      utility_type,
      capacity,
      status,
      bgt_classification: "KabelEnLeiding",
      cad_ref_id: `CAD-${id}`,
      inspected_date,
      maintenance_priority,
    },
    geometry: { type: "Point", coordinates },
  };
}

function mkRoad(
  id: string,
  street_name: string,
  surface_type: SurfaceType,
  traffic_load: TrafficLoad,
  coordinates: [number, number][],
  inspected_date: string,
  maintenance_priority: MaintenancePriority
): Feature<LineString, RoadProperties> {
  return {
    type: "Feature",
    properties: {
      id,
      street_name,
      surface_type,
      traffic_load,
      bgt_classification: "Wegvak",
      cad_ref_id: `CAD-${id}`,
      inspected_date,
      maintenance_priority,
    },
    geometry: { type: "LineString", coordinates },
  };
}

export const buildingsData: FeatureCollection<Polygon, BuildingProperties> = {
  type: "FeatureCollection",
  features: [
    mkBuilding("BLD-001", "Gulshan Municipal Hall", "Civic Building", "Optimal", 1998, "2026-06-12", [90.4152, 23.8121], "Low"),
    mkBuilding("BLD-002", "Banani Water Treatment Facility", "Utility Plant", "Warning", 1985, "2026-03-04", [90.4051, 23.8188], "Medium", [0.0011, 0.0008]),
    mkBuilding("BLD-003", "Mohakhali Fire Station 4", "Emergency Services", "Optimal", 2011, "2026-08-01", [90.4021, 23.7784], "Low"),
    mkBuilding("BLD-004", "Tejgaon Substation Complex", "Power Facility", "Critical", 1979, "2025-11-19", [90.3964, 23.7654], "High", [0.001, 0.0007]),
    mkBuilding("BLD-005", "Dhanmondi Public Library", "Civic Building", "Optimal", 2005, "2026-05-22", [90.3742, 23.7461], "Low"),
    mkBuilding("BLD-006", "Mirpur Sewage Pumping Station", "Utility Plant", "Warning", 1992, "2026-02-14", [90.3654, 23.8069], "Medium", [0.0009, 0.0009]),
    mkBuilding("BLD-007", "Uttara Zone Administration Center", "Civic Building", "Optimal", 2016, "2026-07-30", [90.3995, 23.8759], "Low"),
    mkBuilding("BLD-008", "Motijheel Central Depot", "Maintenance Yard", "Critical", 1972, "2025-09-27", [90.4172, 23.7331], "High", [0.0012, 0.0007]),
    mkBuilding("BLD-009", "Bashundhara Community Center", "Civic Building", "Optimal", 2019, "2026-08-15", [90.4265, 23.8154], "Low"),
    mkBuilding("BLD-010", "Lalbagh Storm Drain Control House", "Utility Plant", "Warning", 1988, "2026-01-09", [90.3888, 23.7188], "Medium", [0.0008, 0.0006]),
    mkBuilding("BLD-011", "Khilgaon Transformer House", "Power Facility", "Critical", 1981, "2025-12-02", [90.4276, 23.7492], "High", [0.0009, 0.0007]),
    mkBuilding("BLD-012", "Shyamoli Traffic Command Post", "Civic Building", "Optimal", 2021, "2026-09-02", [90.3634, 23.7712], "Low"),
    mkBuilding("BLD-013", "Nagar Bhaban", "Civic Building", "Optimal", 1952, "2026-07-01", [90.4145, 23.725], "Low"),
    mkBuilding("BLD-014", "Tejgaon Power Hub", "Power Facility", "Warning", 1995, "2026-04-18", [90.3945, 23.7695], "Medium", [0.001, 0.0007]),
    mkBuilding("BLD-015", "Kurmitola Water Works", "Utility Plant", "Optimal", 2008, "2026-08-20", [90.3925, 23.8465], "Low", [0.0011, 0.0009]),
    mkBuilding("BLD-016", "Mirpur Maintenance Yard", "Maintenance Yard", "Critical", 1975, "2025-10-05", [90.36, 23.801], "High", [0.0012, 0.0008]),
    mkBuilding("BLD-017", "Rampura Water Pumping Station", "Utility Plant", "Warning", 1990, "2026-02-27", [90.423, 23.758], "Medium", [0.0009, 0.0008]),
    mkBuilding("BLD-018", "Hatirjheel Traffic Control Center", "Civic Building", "Optimal", 2015, "2026-06-30", [90.413, 23.7495], "Low"),
    mkBuilding("BLD-019", "Badda Fire Station 7", "Emergency Services", "Optimal", 2012, "2026-07-22", [90.426, 23.7805], "Low"),
    mkBuilding("BLD-020", "Kawran Bazar Transformer House", "Power Facility", "Critical", 1978, "2025-11-30", [90.3925, 23.7515], "High", [0.0009, 0.0007]),
    mkBuilding("BLD-021", "Farmgate Public Library", "Civic Building", "Optimal", 2003, "2026-05-10", [90.389, 23.757], "Low"),
    mkBuilding("BLD-022", "Jatrabari Sewage Treatment Plant", "Utility Plant", "Warning", 1987, "2026-01-15", [90.433, 23.7115], "Medium", [0.0011, 0.0008]),
  ],
};

export const utilitiesData: FeatureCollection<Point, UtilityProperties> = {
  type: "FeatureCollection",
  features: [
    mkUtility("UTL-001", "Power", "11 kV Feeder", "Active", [90.412, 23.809], "2026-05-01", "Low"),
    mkUtility("UTL-002", "Water", "450 mm Main", "Active", [90.4083, 23.8016], "2026-04-14", "Low"),
    mkUtility("UTL-003", "Power", "33 kV Substation Tap", "Maintenance", [90.3982, 23.793], "2026-08-10", "High"),
    mkUtility("UTL-004", "Water", "300 mm Distribution", "Active", [90.3861, 23.7801], "2026-03-22", "Low"),
    mkUtility("UTL-005", "Power", "11 kV Feeder", "Active", [90.375, 23.7554], "2026-06-02", "Low"),
    mkUtility("UTL-006", "Water", "600 mm Trunk Main", "Maintenance", [90.3699, 23.8112], "2026-08-05", "High"),
    mkUtility("UTL-007", "Power", "0.4 kV Distribution", "Active", [90.4041, 23.8703], "2026-02-19", "Medium"),
    mkUtility("UTL-008", "Water", "250 mm Distribution", "Active", [90.4211, 23.7419], "2026-05-27", "Low"),
    mkUtility("UTL-009", "Power", "132 kV Grid Substation", "Active", [90.4185, 23.7605], "2026-07-11", "Medium"),
    mkUtility("UTL-010", "Power", "33 kV Substation Tap", "Active", [90.3705, 23.794], "2026-06-19", "Low"),
    mkUtility("UTL-011", "Power", "11 kV Feeder", "Maintenance", [90.429, 23.809], "2026-08-22", "High"),
    mkUtility("UTL-012", "Power", "0.4 kV Distribution", "Active", [90.383, 23.83], "2026-03-30", "Low"),
    mkUtility("UTL-013", "Power", "33 kV Substation Tap", "Active", [90.406, 23.725], "2026-04-09", "Medium"),
    mkUtility("UTL-014", "Water", "600 mm Trunk Main", "Active", [90.42, 23.746], "2026-05-14", "Medium"),
    mkUtility("UTL-015", "Water", "450 mm Main", "Maintenance", [90.378, 23.81], "2026-08-17", "High"),
    mkUtility("UTL-016", "Water", "300 mm Distribution", "Active", [90.395, 23.855], "2026-02-08", "Low"),
    mkUtility("UTL-017", "Water", "250 mm Distribution", "Active", [90.431, 23.79], "2026-06-25", "Low"),
    mkUtility("UTL-018", "Water", "600 mm Trunk Main", "Active", [90.366, 23.75], "2026-01-30", "Medium"),
    mkUtility("UTL-019", "Gas", "Medium Pressure Regulator Station", "Active", [90.4, 23.74], "2026-07-04", "Medium"),
    mkUtility("UTL-020", "Gas", "High Pressure Regulator Station", "Active", [90.388, 23.79], "2026-05-19", "Medium"),
    mkUtility("UTL-021", "Gas", "Medium Pressure Regulator Station", "Maintenance", [90.423, 23.8], "2026-08-28", "High"),
    mkUtility("UTL-022", "Gas", "Low Pressure Regulator Station", "Active", [90.37, 23.825], "2026-04-02", "Low"),
    mkUtility("UTL-023", "Fiber", "Backbone Junction Box", "Active", [90.41, 23.77], "2026-06-08", "Low"),
    mkUtility("UTL-024", "Fiber", "Distribution Node", "Active", [90.396, 23.805], "2026-03-15", "Low"),
    mkUtility("UTL-025", "Fiber", "Backbone Junction Box", "Maintenance", [90.428, 23.755], "2026-08-30", "High"),
  ],
};

export const roadsData: FeatureCollection<LineString, RoadProperties> = {
  type: "FeatureCollection",
  features: [
    mkRoad(
      "RD-001",
      "Gulshan Avenue",
      "Asphalt",
      "High",
      [
        [90.4109, 23.7938],
        [90.413, 23.801],
        [90.4142, 23.809],
        [90.415, 23.815],
        [90.4159, 23.821],
        [90.4165, 23.8177],
      ],
      "2026-06-01",
      "Medium"
    ),
    mkRoad(
      "RD-002",
      "Mirpur Road (N5)",
      "Asphalt",
      "High",
      [
        [90.386, 23.73],
        [90.382, 23.742],
        [90.379, 23.755],
        [90.376, 23.768],
        [90.372, 23.781],
        [90.369, 23.794],
        [90.3667, 23.8069],
        [90.3654, 23.818],
      ],
      "2026-05-20",
      "High"
    ),
    mkRoad(
      "RD-003",
      "Airport Road (N3)",
      "Concrete",
      "High",
      [
        [90.4021, 23.8759],
        [90.4015, 23.86],
        [90.4008, 23.844],
        [90.4, 23.828],
        [90.3995, 23.812],
        [90.399, 23.796],
        [90.3985, 23.78],
        [90.398, 23.765],
      ],
      "2026-07-08",
      "Medium"
    ),
    mkRoad(
      "RD-004",
      "Pragati Sarani",
      "Asphalt",
      "High",
      [
        [90.4224, 23.755],
        [90.4235, 23.766],
        [90.4249, 23.7789],
        [90.4258, 23.79],
        [90.4265, 23.801],
        [90.427, 23.8154],
        [90.4278, 23.828],
      ],
      "2026-04-28",
      "Medium"
    ),
    mkRoad(
      "RD-005",
      "Kazi Nazrul Islam Avenue",
      "Concrete",
      "Medium",
      [
        [90.387, 23.753],
        [90.391, 23.7545],
        [90.3955, 23.7558],
        [90.3995, 23.757],
        [90.4035, 23.7585],
        [90.4075, 23.76],
      ],
      "2026-03-11",
      "Low"
    ),
    mkRoad(
      "RD-006",
      "Dhaka Elevated Expressway",
      "Concrete",
      "High",
      [
        [90.4005, 23.855],
        [90.3995, 23.839],
        [90.3985, 23.823],
        [90.3975, 23.807],
        [90.3968, 23.791],
        [90.3958, 23.775],
        [90.395, 23.759],
        [90.394, 23.743],
        [90.393, 23.727],
      ],
      "2026-08-02",
      "High"
    ),
    mkRoad(
      "RD-007",
      "VIP Road",
      "Asphalt",
      "Medium",
      [
        [90.405, 23.793],
        [90.403, 23.8],
        [90.401, 23.808],
        [90.399, 23.816],
        [90.397, 23.824],
        [90.396, 23.832],
      ],
      "2026-02-24",
      "Medium"
    ),
    mkRoad(
      "RD-008",
      "Dhanmondi Lake Road",
      "Concrete",
      "Low",
      [
        [90.3699, 23.7412],
        [90.3742, 23.7461],
        [90.3781, 23.7508],
      ],
      "2026-01-19",
      "Low"
    ),
    mkRoad(
      "RD-009",
      "Motijheel By-Lane",
      "Gravel",
      "Low",
      [
        [90.4152, 23.729],
        [90.4172, 23.7331],
        [90.4198, 23.7367],
      ],
      "2025-12-30",
      "Low"
    ),
  ],
};
