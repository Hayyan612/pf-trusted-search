/** Nearby places around Princess Tower from OpenStreetMap (Overpass API), fetched live with a saved fallback. */
export const TOWER = { lat: 25.08856, lon: 55.14705, name: "Princess Tower" };

export const NEARBY_KINDS = {
  metro: { label: "Metro", q: 'nwr["railway"="station"]["station"="subway"]' },
  tram: { label: "Tram stop", q: 'nwr["railway"="tram_stop"]' },
  gym: { label: "Gym", q: 'nwr["leisure"="fitness_centre"]' },
  supermarket: { label: "Supermarket", q: 'nwr["shop"="supermarket"]' },
  mall: { label: "Mall", q: 'nwr["shop"="mall"]' },
  beach: { label: "Beach", q: 'nwr["natural"="beach"]' },
  park: { label: "Park", q: 'nwr["leisure"="park"]' },
  school: { label: "School", q: 'nwr["amenity"~"^(school|kindergarten)$"]' },
  clinic: { label: "Clinic", q: 'nwr["amenity"~"^(clinic|hospital|doctors)$"]' },
  pharmacy: { label: "Pharmacy", q: 'nwr["amenity"="pharmacy"]' },
  mosque: { label: "Mosque", q: 'nwr["amenity"="place_of_worship"]["religion"="muslim"]' },
} as const;

export type NearbyKind = keyof typeof NEARBY_KINDS;
export const NEARBY_KEYS = Object.keys(NEARBY_KINDS) as NearbyKind[];

export interface Place { kind: NearbyKind; name: string; lat: number; lon: number; meters: number; walkMin: number }

export function meters(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/** Overpass query: up to 3 nearest of each kind within 2 km. */
export function overpassQuery(radius = 2000) {
  const parts = NEARBY_KEYS.map((k) => `${NEARBY_KINDS[k].q.replace(/^nwr/, `nwr(around:${radius},${TOWER.lat},${TOWER.lon})`)};`).join("");
  return `[out:json][timeout:25];(${parts});out center tags 400;`;
}

export function toPlaces(json: { elements?: { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[] }): Place[] {
  const out: Place[] = [];
  for (const e of json.elements ?? []) {
    const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon, t = e.tags ?? {};
    if (lat == null || lon == null) continue;
    const kind = NEARBY_KEYS.find((k) => {
      const q = NEARBY_KINDS[k].q;
      return [...q.matchAll(/\["([^"]+)"(=|~)"([^"]+)"\]/g)].every(([, key, op, val]) => (op === "=" ? t[key] === val : new RegExp(val).test(t[key] ?? "")));
    });
    if (!kind) continue;
    const m = meters(TOWER, { lat, lon });
    out.push({ kind, name: t["name:en"] || t.name || NEARBY_KINDS[kind].label, lat, lon, meters: m, walkMin: Math.max(1, Math.round((m * 1.3) / 80)) });
  }
  const byKind = new Map<NearbyKind, Place[]>();
  for (const p of out.sort((a, b) => a.meters - b.meters)) {
    const list = byKind.get(p.kind) ?? [];
    if (list.length < 3 && !list.some((x) => x.name === p.name)) list.push(p);
    byKind.set(p.kind, list);
  }
  return [...byKind.values()].flat();
}
