import appData from "@/data/app-data.json";

export type Kind = "rent" | "sale";
export type Severity = "ok" | "ask" | "hide";

export interface Check {
  code: string;
  severity: Severity;
  label: string;
  detail: string;
  other?: string;
  others?: string[];
}

export interface Listing {
  id: string;
  kind: Kind;
  price: number;
  beds: number;
  baths: number;
  size: number;
  ppsf: number | null;
  furnished: string | null;
  agent: string | null;
  broker: string | null;
  verified: boolean;
  listed: string;
  ageDays: number | null;
  imageCount: number | null;
  images: string[];
  title: string | null;
  url: string;
  level: string | null;
  description: string;
  vsMedian: number | null;
  medianPpsf: number | null;
  checks: Check[];
  status: Severity;
  unitId: string;
}

export interface Unit {
  id: string;
  kind: Kind;
  beds: number;
  size: number;
  listingIds: string[];
  priceMin: number;
  priceMax: number;
  agencies: number;
  bestId: string;
}

const data = appData as unknown as {
  building: string;
  capturedAt: string;
  listings: Listing[];
  units: Unit[];
};

const byId = new Map(data.listings.map((l) => [l.id, l]));
const unitById = new Map(data.units.map((u) => [u.id, u]));

export const BUILDING = data.building;
export const CAPTURED_AT = data.capturedAt;

export function getListing(id: string): Listing | undefined {
  return byId.get(id);
}

export function getUnit(id: string): Unit | undefined {
  return unitById.get(id);
}

export function listingsFor(kind: Kind, beds?: number): Listing[] {
  return data.listings
    .filter((l) => l.kind === kind && (beds === undefined || l.beds === beds))
    .sort((a, b) => a.price - b.price);
}

/** One entry per real flat: the best non-hidden ad of each unit, plus counts. */
export function unitsFor(kind: Kind, beds?: number) {
  const ls = listingsFor(kind, beds);
  const seen = new Set<string>();
  const shown: { listing: Listing; unit: Unit }[] = [];
  for (const l of ls) {
    if (seen.has(l.unitId)) continue;
    seen.add(l.unitId);
    const unit = unitById.get(l.unitId);
    if (!unit) continue;
    const best = byId.get(unit.bestId) ?? l;
    shown.push({ listing: best, unit });
  }
  return shown;
}

export function summary(kind: Kind, beds?: number) {
  const ls = listingsFor(kind, beds);
  const units = unitsFor(kind, beds);
  return {
    ads: ls.length,
    flats: units.length,
    hidden: units.filter((u) => u.listing.status === "hide").length,
    ask: units.filter((u) => u.listing.status === "ask").length,
    clear: units.filter((u) => u.listing.status === "ok").length,
  };
}

export function aed(n: number) {
  return "AED " + n.toLocaleString("en-US");
}

export function priceLine(l: Pick<Listing, "price" | "kind">) {
  return l.kind === "rent" ? `${aed(l.price)} / year` : aed(l.price);
}

export const STATUS_COPY: Record<Severity, { label: string; tone: string }> = {
  ok: { label: "Looks genuine", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ask: { label: "Ask first", tone: "bg-amber-50 text-amber-800 border-amber-200" },
  hide: { label: "Likely misleading", tone: "bg-red-50 text-red-700 border-red-200" },
};
