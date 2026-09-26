export type SelectedFeature =
  | { kind: "building"; id: string }
  | { kind: "utility"; id: string }
  | { kind: "incident"; id: string };
