"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Briefcase, Car, ExternalLink, Footprints, MapPin, TrainFront } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NEARBY_KINDS, TOWER, type NearbyKind, type Place } from "@/lib/nearby";
import { WORKPLACES, commuteEstimate, type WorkplaceId } from "@/lib/workplaces";
import { cn } from "@/lib/utils";

const STYLE = "https://tiles.openfreemap.org/styles/positron";
const COLORS: Record<NearbyKind, string> = {
  metro: "#dc2626", tram: "#ea580c", gym: "#7c3aed", supermarket: "#059669", mall: "#db2777", beach: "#0284c7",
  park: "#16a34a", school: "#ca8a04", clinic: "#e11d48", pharmacy: "#0d9488", mosque: "#475569",
};
const DEFAULT_KINDS: NearbyKind[] = ["metro", "tram", "supermarket", "gym", "beach"];

function dot(color: string, size = 12, ring = "#fff") {
  const el = document.createElement("div");
  el.style.cssText = `width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2px solid ${ring};box-shadow:0 1px 3px rgba(0,0,0,.35)`;
  return el;
}

/** Map + nearby places + commute, for the person's priorities. Places come live from OpenStreetMap. */
export function LocationCard({ priorities = [], workplace = null, maxCommuteMin = null }: { priorities?: NearbyKind[]; workplace?: WorkplaceId | null; maxCommuteMin?: number | null }) {
  const box = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [source, setSource] = useState<string>("");
  const [loaded, setLoaded] = useState<string[]>([]);
  const kinds = useMemo(() => [...new Set([...priorities, ...DEFAULT_KINDS])], [priorities]);
  const nearest = useMemo(() => kinds.map((k) => places.find((p) => p.kind === k)).filter(Boolean) as Place[], [kinds, places]);
  const commute = workplace ? commuteEstimate(workplace) : null;

  useEffect(() => {
    let alive = true;
    fetch("/api/nearby")
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        setPlaces(j.places ?? []);
        setSource(j.source);
        setLoaded(j.loaded ?? []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!box.current) return;
    let map: import("maplibre-gl").Map | undefined;
    let cancelled = false;
    import("maplibre-gl").then(({ default: maplibregl }) => {
      if (cancelled || !box.current) return;
      map = new maplibregl.Map({ container: box.current, style: STYLE, center: [TOWER.lon, TOWER.lat], zoom: 14.2, attributionControl: { compact: true } });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      new maplibregl.Marker({ element: dot("#2f2a7a", 18) }).setLngLat([TOWER.lon, TOWER.lat]).setPopup(new maplibregl.Popup({ offset: 12 }).setText("Princess Tower")).addTo(map);
      if (workplace) {
        const w = WORKPLACES[workplace];
        new maplibregl.Marker({ element: dot("#111827", 16, "#facc15") }).setLngLat([w.lon, w.lat]).setPopup(new maplibregl.Popup({ offset: 12 }).setText(w.label)).addTo(map);
      }
      for (const p of nearest) {
        new maplibregl.Marker({ element: dot(COLORS[p.kind]) }).setLngLat([p.lon, p.lat]).setPopup(new maplibregl.Popup({ offset: 10 }).setText(`${p.name} · ${p.walkMin} min walk`)).addTo(map);
      }
      if (workplace || nearest.length) {
        const pts = [[TOWER.lon, TOWER.lat], ...nearest.map((p) => [p.lon, p.lat]), ...(workplace ? [[WORKPLACES[workplace].lon, WORKPLACES[workplace].lat]] : [])] as [number, number][];
        const b = pts.reduce((acc, c) => acc.extend(c), new maplibregl.LngLatBounds(pts[0], pts[0]));
        map.fitBounds(b, { padding: 40, maxZoom: 15, duration: 0 });
      }
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [nearest, workplace]);

  const over = commute && maxCommuteMin ? commute.carPeakMin > maxCommuteMin : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MapPin className="size-4 text-primary" /> Location and what is nearby</CardTitle>
        <CardDescription>
          Princess Tower, Dubai Marina. Places from OpenStreetMap{source === "live" ? ", live" : source ? " (saved today)" : ""}; walking times are estimates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={box} className="h-64 w-full overflow-hidden rounded-xl border bg-muted sm:h-72" role="img" aria-label="Map of Princess Tower and nearby places" />

        {commute && workplace && (
          <div className={cn("space-y-2 rounded-xl border p-3", over ? "border-amber-200 bg-amber-50/60" : "bg-muted/30")}>
            <div className="flex items-center gap-2 text-[14px] font-medium"><Briefcase className="size-4" /> To {WORKPLACES[workplace].label}</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
              <span className="flex items-center gap-1"><Car className="size-4" /> about {commute.carMin} min, {commute.carPeakMin} at rush hour ({commute.km} km)</span>
            </div>
            {over && <p className="text-[12px] text-amber-800">At rush hour this may be over your {maxCommuteMin} minutes. Check the metro or tram route.</p>}
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline"><a href={commute.directions("driving")} target="_blank" rel="noreferrer"><Car /> Driving route <ExternalLink /></a></Button>
              <Button asChild size="sm" variant="outline"><a href={commute.directions("transit")} target="_blank" rel="noreferrer"><TrainFront /> Metro / tram route <ExternalLink /></a></Button>
            </div>
          </div>
        )}

        <ul className="grid gap-2 sm:grid-cols-2">
          {kinds.map((k) => {
            const p = places.find((x) => x.kind === k);
            const wanted = priorities.includes(k);
            return (
              <li key={k} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px]">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: COLORS[k] }} />
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-medium">{NEARBY_KINDS[k].label}</span>
                  {p ? <span className="text-muted-foreground"> · {p.name}</span> : <span className="text-muted-foreground"> · {loaded.includes(k) ? "none within 2 km" : "could not load, check the map"}</span>}
                </span>
                {p && <span className="flex shrink-0 items-center gap-1 tabular-nums text-muted-foreground"><Footprints className="size-3.5" />{p.walkMin} min</span>}
                {wanted && <Badge variant="secondary" className="shrink-0 font-normal">You asked</Badge>}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
