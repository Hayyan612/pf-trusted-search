import Link from "next/link";
import { BedDouble, Bath, Maximize, BadgeCheck, Layers } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { priceLine, type Listing, type Unit } from "@/lib/data";
import { cn } from "@/lib/utils";
import { FadeImage } from "@/components/fade-image";

export function ListingCard({ listing: l, unit, showUnit, index = 0 }: { listing: Listing; unit?: Unit; showUnit?: boolean; index?: number }) {
  const reasons = l.checks.filter((c) => c.severity !== "ok").slice(0, 2);
  const multi = showUnit && unit && unit.listingIds.length > 1;
  return (
    <Link
      href={`/listing/${l.id}`}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      className={cn(
        "group block overflow-hidden rounded-2xl border bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-both motion-safe:duration-300 motion-reduce:hover:translate-y-0",
        l.status === "hide" && "opacity-70",
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {l.images[0] && (
          <FadeImage src={l.images[0]} alt="" loading="lazy" className="size-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100" />
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {l.verified && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-medium">
              <BadgeCheck className="size-3 text-sky-600" /> Verified
            </span>
          )}
        </div>
        <StatusPill status={l.status} className="absolute right-2 bottom-2 bg-white/95" />
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-[18px] font-semibold tracking-tight">{priceLine(l)}</div>
          {l.vsMedian !== null && (
            <span className={cn("text-[12px]", l.vsMedian <= -15 ? "text-amber-700" : "text-muted-foreground")}>
              {l.vsMedian > 0 ? "+" : ""}
              {l.vsMedian}% vs tower
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <BedDouble className="size-4" /> {l.beds}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-4" /> {l.baths}
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="size-4" /> {l.size.toLocaleString()} sq ft
          </span>
        </div>
        <div className="truncate text-[13px]">{l.title}</div>
        {multi && unit && (
          <div className="flex items-center gap-1.5 rounded-lg bg-accent px-2 py-1.5 text-[12px] text-primary">
            <Layers className="size-3.5" />
            Advertised {unit.listingIds.length} times by {unit.agencies} {unit.agencies === 1 ? "agency" : "agencies"}
            {unit.priceMin !== unit.priceMax && <> · AED {unit.priceMin.toLocaleString()}–{unit.priceMax.toLocaleString()}</>}
          </div>
        )}
        {reasons.length > 0 && (
          <ul className="space-y-0.5 text-[12px] text-muted-foreground">
            {reasons.map((r) => (
              <li key={r.code + (r.other ?? "")}>• {r.label}</li>
            ))}
          </ul>
        )}
        <div className="text-[12px] text-muted-foreground">
          {l.agent} · {l.broker}
        </div>
      </div>
    </Link>
  );
}
