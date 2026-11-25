import { NextResponse } from "next/server";
import snapshot from "@/data/nearby-snapshot.json";
import { NEARBY_KEYS, overpassQuery, toPlaces, type Place } from "@/lib/nearby";

const SERVERS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
const TTL_MS = 6 * 60 * 60 * 1000;
let cache: { at: number; places: Place[]; source: "live" | "snapshot"; loaded: string[] } | null = null;

async function live(): Promise<Place[] | null> {
  for (const url of SERVERS) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "trueunit-prototype/1.0" },
        body: new URLSearchParams({ data: overpassQuery(2000) }),
        signal: AbortSignal.timeout(12_000),
      });
      if (!r.ok) continue;
      const places = toPlaces(await r.json());
      if (places.length) return places;
    } catch {
      /* try the next server */
    }
  }
  return null;
}

/** Places near Princess Tower from OpenStreetMap: live when the public servers answer, else the saved snapshot. */
export async function GET() {
  if (!cache || Date.now() - cache.at > TTL_MS) {
    const fresh = await live();
    const snap = snapshot as unknown as { kinds?: string[] };
    cache = fresh
      ? { at: Date.now(), places: fresh, source: "live", loaded: NEARBY_KEYS }
      : { at: Date.now(), places: toPlaces(snapshot as never), source: "snapshot", loaded: snap.kinds ?? [] };
  }
  return NextResponse.json({ places: cache.places, source: cache.source, loaded: cache.loaded }, { headers: { "Cache-Control": "public, max-age=600" } });
}
