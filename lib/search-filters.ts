/** Search filters, kept in the URL like Property Finder's. Pure functions, used by the server page and the client bar. */

export type Furnishing = "furnished" | "unfurnished" | "partly";
export type SortKey = "price-asc" | "price-desc" | "newest" | "size-desc";
export type Period = "yearly" | "monthly";

export interface Filters {
  kind: "rent" | "sale";
  beds: number[]; // 0 = Studio, 5 = 5+
  baths: number[]; // 5 = 5+
  pmin?: number;
  pmax?: number;
  period: Period; // how the person typed the price (rent only); stored values are always per year
  fu?: Furnishing;
  smin?: number;
  smax?: number;
  am: string[];
  sort: SortKey;
}

/** The fields filtering needs; small enough to send to the browser for live counts. */
export interface Facet {
  id: string;
  unitId: string;
  kind: "rent" | "sale";
  beds: number;
  baths: number;
  price: number;
  size: number;
  furnished: string | null;
  amenities: string[];
  ageDays: number | null;
  status: string;
}

export const BEDS_MAX = 5;
export const BATHS_MAX = 5;
/** Amenity names exactly as Property Finder writes them, in its order. */
export const AMENITIES = [
  "Central A/C", "Maids Room", "Balcony", "Shared Pool", "Shared Spa", "Shared Gym", "Concierge", "Covered Parking",
  "View of Water", "View of Landmark", "Pets Allowed", "Study", "Private Garden", "Private Pool", "Private Gym", "Private Jacuzzi",
  "Built in Wardrobes", "Walk-in Closet", "Kitchen Appliances", "Maid Service", "Children's Play Area", "Children's Pool",
  "Barbecue Area", "Security", "Lobby in Building",
] as const;
export const FURNISHING: { id: Furnishing | undefined; label: string }[] = [
  { id: undefined, label: "All furnishings" },
  { id: "furnished", label: "Furnished" },
  { id: "unfurnished", label: "Unfurnished" },
  { id: "partly", label: "Partly furnished" },
];
export const SORTS: { id: SortKey; label: string }[] = [
  { id: "price-asc", label: "Price (low to high)" },
  { id: "price-desc", label: "Price (high to low)" },
  { id: "newest", label: "Newest" },
  { id: "size-desc", label: "Size (largest first)" },
];

const num = (v: string | null | undefined) => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};
const list = (v: string | null | undefined, max: number) =>
  (v ?? "").split(",").filter((x) => x.trim() !== "").map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= max);

type Get = (k: string) => string | null | undefined;
export function parseFilters(get: Get): Filters {
  const fu = get("fu");
  const sort = get("sort");
  return {
    kind: get("kind") === "sale" ? "sale" : "rent",
    // `beds=2` from older links still works
    beds: list(get("beds"), BEDS_MAX),
    baths: list(get("baths"), BATHS_MAX),
    pmin: num(get("pmin")),
    pmax: num(get("pmax")),
    period: get("period") === "monthly" ? "monthly" : "yearly",
    fu: fu === "furnished" || fu === "unfurnished" || fu === "partly" ? fu : undefined,
    smin: num(get("smin")),
    smax: num(get("smax")),
    am: (get("am") ?? "").split(",").filter((a) => (AMENITIES as readonly string[]).includes(a)),
    sort: SORTS.some((s) => s.id === sort) ? (sort as SortKey) : "price-asc",
  };
}

export function toParams(f: Filters, extra: Record<string, string> = {}): string {
  const p = new URLSearchParams();
  p.set("kind", f.kind);
  if (f.beds.length) p.set("beds", [...f.beds].sort().join(","));
  if (f.baths.length) p.set("baths", [...f.baths].sort().join(","));
  if (f.pmin !== undefined) p.set("pmin", String(f.pmin));
  if (f.pmax !== undefined) p.set("pmax", String(f.pmax));
  if (f.period === "monthly" && f.kind === "rent") p.set("period", "monthly");
  if (f.fu) p.set("fu", f.fu);
  if (f.smin !== undefined) p.set("smin", String(f.smin));
  if (f.smax !== undefined) p.set("smax", String(f.smax));
  if (f.am.length) p.set("am", f.am.join(","));
  if (f.sort !== "price-asc") p.set("sort", f.sort);
  for (const [k, v] of Object.entries(extra)) p.set(k, v);
  return p.toString();
}

const FU_MAP: Record<Furnishing, string> = { furnished: "YES", unfurnished: "NO", partly: "PARTLY" };
const inBucket = (v: number, picked: number[], max: number) => !picked.length || picked.some((b) => (b === max ? v >= max : v === b));

export function matches(x: Facet, f: Filters): boolean {
  return (
    x.kind === f.kind &&
    inBucket(x.beds, f.beds, BEDS_MAX) &&
    inBucket(x.baths, f.baths, BATHS_MAX) &&
    (f.pmin === undefined || x.price >= f.pmin) &&
    (f.pmax === undefined || x.price <= f.pmax) &&
    (!f.fu || x.furnished === FU_MAP[f.fu]) &&
    (f.smin === undefined || x.size >= f.smin) &&
    (f.smax === undefined || x.size <= f.smax) &&
    f.am.every((a) => x.amenities.includes(a))
  );
}

export function sorter(sort: SortKey) {
  return <T extends { price: number; size: number; ageDays: number | null }>(a: T, b: T) =>
    sort === "price-desc" ? b.price - a.price
    : sort === "newest" ? (a.ageDays ?? 9e9) - (b.ageDays ?? 9e9)
    : sort === "size-desc" ? b.size - a.size
    : a.price - b.price;
}

/** Number of real flats (not ads) that pass the filters. */
export function countFlats(facets: Facet[], f: Filters) {
  return new Set(facets.filter((x) => matches(x, f)).map((x) => x.unitId)).size;
}

/** "More Filters" count shown on the Filters pill, as Property Finder does. */
export function moreCount(f: Filters) {
  return (f.fu ? 1 : 0) + (f.smin !== undefined || f.smax !== undefined ? 1 : 0) + f.am.length;
}

export const bedLabel = (b: number) => (b === 0 ? "Studio" : b === BEDS_MAX ? `${BEDS_MAX}+` : String(b));
const bedsText = (beds: number[]) => {
  if (!beds.length) return "";
  const s = [...beds].sort();
  if (s.length === 1) return s[0] === 0 ? "Studio" : `${bedLabel(s[0])}-bed`;
  return `${s.map(bedLabel).join(", ")}-bed`;
};
export const aedShort = (n: number) => (n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(2)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : String(n));

/** Heading in Property Finder's style, e.g. "Furnished 2-bed flats for rent in Princess Tower". */
export function heading(f: Filters, building: string) {
  const fu = f.fu ? FURNISHING.find((x) => x.id === f.fu)!.label + " " : "";
  const beds = bedsText(f.beds);
  const what = `${fu}${beds ? beds + " " : ""}flats`;
  const cap = what.charAt(0).toUpperCase() + what.slice(1);
  return `${cap} for ${f.kind === "rent" ? "rent" : "sale"} in ${building}`;
}

export function priceLabel(f: Filters) {
  if (f.pmin === undefined && f.pmax === undefined) return "Price";
  const per = f.kind === "rent" && f.period === "monthly" ? 12 : 1;
  const lo = f.pmin !== undefined ? aedShort(Math.round(f.pmin / per)) : "";
  const hi = f.pmax !== undefined ? aedShort(Math.round(f.pmax / per)) : "";
  const unit = f.kind === "rent" ? (per === 12 ? "/mo" : "/yr") : "";
  return lo && hi ? `AED ${lo} to ${hi}${unit}` : lo ? `From AED ${lo}${unit}` : `Up to AED ${hi}${unit}`;
}

export function bedsBathsLabel(f: Filters) {
  const parts = [] as string[];
  if (f.beds.length) parts.push(f.beds.length === 1 && f.beds[0] === 0 ? "Studio" : `${[...f.beds].sort().map(bedLabel).join(", ")} Beds`);
  if (f.baths.length) parts.push(`${[...f.baths].sort().map((b) => (b === BATHS_MAX ? `${BATHS_MAX}+` : b)).join(", ")} Baths`);
  return parts.length ? parts.join(", ") : "Beds & Baths";
}
