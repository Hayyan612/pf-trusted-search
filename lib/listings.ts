import { readFile } from "node:fs/promises";
import path from "node:path";

export type Purpose = "rent" | "buy";

export interface Listing {
  id: string;
  purpose?: Purpose;
  building?: string;
  price?: number;
  currency?: string;
  beds?: number;
  sizeSqft?: number;
  agent?: string;
  placeholder?: boolean;
  [key: string]: unknown;
}

const LISTINGS_PATH = path.join(process.cwd(), "data", "listings.json");

export async function loadListings(): Promise<Listing[]> {
  try {
    const raw = await readFile(LISTINGS_PATH, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error("listings.json is not an array");
      return [];
    }
    return parsed as Listing[];
  } catch (error) {
    console.error("Failed to load listings.json", error);
    return [];
  }
}

export async function loadListingsFor(purpose: Purpose): Promise<Listing[]> {
  const all = await loadListings();
  return all.filter((l) => !l.purpose || l.purpose === purpose);
}
