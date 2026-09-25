export type IncidentCategory = "Pipe Leak" | "Pothole" | "Power Outage";
export type IncidentPriority = "Low" | "Medium" | "High";

export interface Incident {
  id: string;
  title: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  lat: number;
  lng: number;
  reportedAt: string;
}

export const INCIDENT_CATEGORIES: IncidentCategory[] = ["Pipe Leak", "Pothole", "Power Outage"];
export const INCIDENT_PRIORITIES: IncidentPriority[] = ["Low", "Medium", "High"];
