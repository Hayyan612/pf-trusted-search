import Link from "next/link";
import { BedDouble, Bath, Maximize, BadgeCheck, Layers, Camera, Sparkles } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { FadeImage } from "@/components/fade-image";
import { AgentAvatar } from "@/components/agent-avatar";
import { listedAgo, type Listing, type Unit } from "@/lib/data";
import { cn } from "@/lib/utils";

/** Property Finder-style result card, with TrueUnit's status and reasons added. */
export function ListingCard({ listing: l, unit, showUnit, index = 0 }: { listing: Listing; unit?: Unit; showUnit?: boolean; index?: number }) {
  const reasons = l.checks.filter((c) => c.severity !== "ok").slice(0, 2);
  const multi = showUnit && unit && unit.listingIds.length > 1;
  return (
    <Link
      href={`/listing/${l.id}`}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-xs transition duration-200 hover:shadow-md active:scale-[0.995] sm:flex-row",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-both motion-safe:duration-300",
        l.status === "hide" && "opacity-75",
      )}
    >
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:w-[42%] sm:min-h-[220px]">
        {l.images[0] && (
          <FadeImage src={l.images[0]} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100" />
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {l.verified && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-medium">
              <BadgeCheck className="size-3 text-sky-600" /> Verified
            </span>
          )}
          {l.agentSuper && <span className="rounded-md bg-primary/90 px-1.5 py-0.5 text-[11px] font-medium text-white">SuperAgent</span>}
        </div>
        {l.imageCount ? (
          <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] text-white">
            <Camera className="size-3" /> {l.imageCount}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] text-muted-foreground">Listed {listedAgo(l.ageDays)}</div>
            <div className="text-[19px] font-semibold tracking-tight">
              AED {l.price.toLocaleString("en-US")}
              {l.kind === "rent" && <span className="text-[14px] font-normal text-muted-foreground"> yearly</span>}
            </div>
          </div>
          {l.brokerLogo && (
            <span className="relative size-11 shrink-0 overflow-hidden rounded-md border bg-white">
              <FadeImage src={l.brokerLogo} alt={l.broker ?? ""} loading="lazy" className="absolute inset-0 size-full object-contain p-0.5" />
            </span>
          )}
        </div>
        <div className="line-clamp-1 text-[14px]">{l.title}</div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-1"><BedDouble className="size-4" /> {l.beds}</span>
          <span className="flex items-center gap-1"><Bath className="size-4" /> {l.baths}</span>
          <span className="flex items-center gap-1"><Maximize className="size-4" /> {l.size.toLocaleString()} sq ft</span>
          <span>Princess Tower, Dubai Marina</span>
        </div>

        <div className="mt-1 space-y-1.5 rounded-xl border border-primary/15 bg-accent/60 p-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-[12px] font-semibold text-primary"><Sparkles className="size-3.5" /> TrueUnit</span>
            <StatusPill status={l.status} />
          </div>
          {multi && unit && (
            <div className="flex items-center gap-1.5 text-[12px] text-primary">
              <Layers className="size-3.5 shrink-0" />
              Advertised {unit.listingIds.length}× by {unit.agencies} {unit.agencies === 1 ? "agency" : "agencies"}
              {unit.priceMin !== unit.priceMax && <> · AED {unit.priceMin.toLocaleString()}–{unit.priceMax.toLocaleString()}</>}
            </div>
          )}
          {reasons.length > 0 ? (
            <ul className="space-y-0.5 text-[12px] text-foreground/80">
              {reasons.map((r) => <li key={r.code + (r.other ?? "")}>• {r.label}</li>)}
            </ul>
          ) : (
            <p className="text-[12px] text-foreground/80">No warning signs. Confirm it is free before you call.</p>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1 text-[12px] text-muted-foreground">
          <AgentAvatar name={l.agent} image={l.agentImage} size={26} />
          <span className="truncate">{l.agent}</span>
          <span className="truncate">· {l.broker}</span>
        </div>
      </div>
    </Link>
  );
}
