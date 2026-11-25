import { TOWER, meters } from "@/lib/nearby";

/** Common Dubai work areas (approximate centre points) for commute estimates from Princess Tower. */
export const WORKPLACES = {
  "pf-media-city": { label: "Property Finder, Dubai Media City", lat: 25.0927, lon: 55.1521 },
  "internet-city": { label: "Dubai Internet City", lat: 25.0957, lon: 55.1589 },
  jlt: { label: "JLT", lat: 25.0693, lon: 55.1413 },
  "business-bay": { label: "Business Bay", lat: 25.1866, lon: 55.2636 },
  downtown: { label: "Downtown Dubai", lat: 25.1955, lon: 55.276 },
  difc: { label: "DIFC", lat: 25.2112, lon: 55.2797 },
} as const;

export type WorkplaceId = keyof typeof WORKPLACES;
export const WORKPLACE_IDS = Object.keys(WORKPLACES) as WorkplaceId[];

/** Rough car time: straight line x1.35 for roads, 45 km/h off-peak and 22 km/h peak, plus 4 min to park. */
export function commuteEstimate(id: WorkplaceId) {
  const w = WORKPLACES[id];
  const km = (meters(TOWER, w) * 1.35) / 1000;
  return {
    km: Math.round(km * 10) / 10,
    carMin: Math.round((km / 45) * 60 + 4),
    carPeakMin: Math.round((km / 22) * 60 + 4),
    directions: (mode: "driving" | "transit" | "walking") =>
      `https://www.google.com/maps/dir/?api=1&origin=${TOWER.lat},${TOWER.lon}&destination=${w.lat},${w.lon}&travelmode=${mode}`,
  };
}
