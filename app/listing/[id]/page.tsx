import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BedDouble, Bath, Maximize, ExternalLink, ShieldCheck, ShieldAlert, ShieldX, Layers, ChevronLeft,
  Camera, Clock, Building2, Sofa, BadgeCheck, Languages, FileText, Check,
} from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { ConfirmBar } from "@/components/confirm-drawer";
import { FadeImage } from "@/components/fade-image";
import { AgentAvatar } from "@/components/agent-avatar";
import { getListing, getUnit, aed, listedAgo, type Severity } from "@/lib/data";
import { cn } from "@/lib/utils";

const ICON: Record<Severity, typeof ShieldCheck> = { ok: ShieldCheck, ask: ShieldAlert, hide: ShieldX };
const TONE: Record<Severity, string> = { ok: "text-emerald-600", ask: "text-amber-600", hide: "text-red-600" };
const HEADLINE: Record<Severity, string> = {
  ok: "Nothing looks wrong. Still worth confirming it is free before you call.",
  ask: "Some things need an answer from the agent before you spend time on it.",
  hide: "This ad is likely misleading. Scout hid it from your results.",
};
const FURNISHED: Record<string, string> = { YES: "Furnished", NO: "Unfurnished", PARTLY: "Partly furnished" };

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = getListing(id);
  if (!l) notFound();
  const unit = getUnit(l.unitId);
  const siblings = (unit?.listingIds ?? []).filter((x) => x !== l.id).map((x) => getListing(x)!).filter(Boolean);
  const order = { hide: 0, ask: 1, ok: 2 } as const;
  const checks = [...l.checks].sort((a, b) => order[a.severity] - order[b.severity]);
  const median = l.medianPpsf ?? 0;
  const pos = median && l.ppsf ? Math.min(95, Math.max(5, 50 + (l.vsMedian ?? 0))) : 50;
  const details = [
    { icon: Clock, k: "Listed", v: listedAgo(l.ageDays) },
    { icon: Building2, k: "Property type", v: "Apartment" },
    { icon: BedDouble, k: "Bedrooms", v: `${l.beds} ${l.beds === 1 ? "Bed" : "Beds"}` },
    { icon: Bath, k: "Bathrooms", v: `${l.baths} ${l.baths === 1 ? "Bath" : "Baths"}` },
    { icon: Maximize, k: "Area", v: `${l.size.toLocaleString()} sq ft` },
    { icon: Sofa, k: "Furnishing", v: l.furnished ? FURNISHED[l.furnished] ?? l.furnished : "Not stated" },
  ];

  return (
    <div className="mx-auto max-w-7xl pb-24 md:px-8 md:pt-4 md:pb-12">
      <Link href={`/search?kind=${l.kind}&beds=${l.beds}`} className="hidden items-center gap-1 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground md:inline-flex">
        <ChevronLeft className="size-4" /> Back to results
      </Link>

      {/* Gallery: one large, two small on desktop; swipeable on phones */}
      <div className="relative">
        <div className="flex snap-x snap-mandatory gap-1 overflow-x-auto md:grid md:aspect-[2.4/1] md:grid-cols-[1.6fr_1fr] md:grid-rows-2 md:gap-2 md:overflow-hidden md:rounded-2xl">
          {l.images.slice(0, 3).map((src, i) => (
            <div key={src} className={cn("relative aspect-[4/3] w-[88%] shrink-0 snap-start overflow-hidden bg-muted md:aspect-auto md:w-auto", i === 0 && "md:row-span-2")}>
              <FadeImage src={src} alt="" className="absolute inset-0 size-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 flex gap-1">
          {l.verified && <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 text-[12px] font-medium"><BadgeCheck className="size-3.5 text-sky-600" /> Verified</span>}
          {l.agentSuper && <span className="rounded-md bg-primary/90 px-2 py-0.5 text-[12px] font-medium text-white">SuperAgent</span>}
        </div>
        {l.imageCount ? (
          <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 text-[12px] text-white md:right-[calc(38%+0.75rem)]">
            <Camera className="size-3.5" /> {l.imageCount}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-6 px-4 md:grid-cols-[minmax(0,1fr)_380px] md:gap-8 md:px-0">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          <Link href={`/search?kind=${l.kind}&beds=${l.beds}`} className="inline-flex items-center gap-1 text-[13px] text-muted-foreground md:hidden">
            <ChevronLeft className="size-4" /> Back to results
          </Link>
          <div className="space-y-3">
            <div className="text-[26px] font-semibold tracking-tight">
              AED {l.price.toLocaleString("en-US")}
              {l.kind === "rent" && <span className="text-[17px] font-normal text-muted-foreground"> yearly</span>}
            </div>
            <div className="flex flex-wrap gap-2 text-[13px]">
              {l.vsMedian !== null && (
                <span className={cn("rounded-lg px-2.5 py-1", l.vsMedian <= -15 ? "bg-amber-50 text-amber-800" : "bg-accent text-primary")}>
                  {l.vsMedian > 0 ? "+" : ""}{l.vsMedian}% vs similar flats in the tower
                </span>
              )}
              {siblings.length > 0 && <span className="rounded-lg bg-accent px-2.5 py-1 text-primary">Also advertised {siblings.length}× elsewhere</span>}
              <a href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-primary transition-colors hover:bg-primary/10">
                View on Property Finder <ExternalLink className="size-3" />
              </a>
            </div>
          </div>

          <section className="border-t pt-5">
            <h2 className="mb-3 text-[16px] font-semibold">Property details</h2>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-[14px] sm:grid-cols-2">
              {details.map(({ icon: Icon, k, v }) => (
                <div key={k} className="flex items-center gap-3">
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <dt className="w-28 shrink-0 text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {median > 0 && l.ppsf && (
            <section className="border-t pt-5">
              <h2 className="mb-3 text-[16px] font-semibold">Price against this tower</h2>
              <div className="relative h-2 rounded-full bg-gradient-to-r from-amber-200 via-emerald-200 to-neutral-200">
                <span className="absolute -top-1 size-4 -translate-x-1/2 rounded-full border-2 border-white bg-primary shadow" style={{ left: `${pos}%` }} />
              </div>
              <p className="mt-2 text-[13px] text-muted-foreground">
                AED {l.ppsf.toLocaleString()} per sq ft. The median for {l.beds}-bed {l.kind === "rent" ? "rentals" : "sales"} in Princess Tower is AED{" "}
                {Math.round(median).toLocaleString()}. Based on today&apos;s live ads, not registered deals.
              </p>
            </section>
          )}

          {siblings.length > 0 && (
            <section className="border-t pt-5">
              <h2 className="mb-2 flex items-center gap-2 text-[16px] font-semibold"><Layers className="size-4 text-primary" /> Same flat, other ads</h2>
              <ul className="divide-y rounded-xl border">
                {siblings.map((s) => (
                  <li key={s.id}>
                    <Link href={`/listing/${s.id}`} className="flex items-center gap-3 px-3 py-2.5 text-[14px] transition-colors hover:bg-accent/60">
                      <AgentAvatar name={s.agent} image={s.agentImage} size={28} />
                      <span className="min-w-0 flex-1 truncate">{s.broker}</span>
                      <span className="font-medium">{aed(s.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="border-t pt-5">
            <div className="text-[12px] text-muted-foreground">Apartment for {l.kind === "rent" ? "rent" : "sale"} in Princess Tower, Dubai Marina</div>
            <h2 className="mt-1 text-[18px] font-semibold">{l.title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed whitespace-pre-line text-muted-foreground">{l.description}…</p>
          </section>

          {l.amenities.length > 0 && (
            <section className="border-t pt-5">
              <h2 className="mb-3 text-[16px] font-semibold">Amenities</h2>
              <ul className="flex flex-wrap gap-2">
                {l.amenities.map((a) => (
                  <li key={a} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[13px]"><Check className="size-3.5 text-emerald-600" /> {a}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="border-t pt-5">
            <h2 className="mb-3 flex items-center gap-2 text-[16px] font-semibold"><FileText className="size-4" /> Regulatory information</h2>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-[14px] sm:grid-cols-2">
              <div className="flex gap-3"><dt className="w-28 shrink-0 text-muted-foreground">Reference</dt><dd className="min-w-0 font-medium break-all">{l.reference ?? "-"}</dd></div>
              <div className="flex gap-3"><dt className="w-28 shrink-0 text-muted-foreground">Listed</dt><dd className="font-medium">{l.listed}</dd></div>
              <div className="flex gap-3"><dt className="w-28 shrink-0 text-muted-foreground">Agency</dt><dd className="min-w-0 font-medium">{l.broker}</dd></div>
              <div className="flex gap-3"><dt className="w-28 shrink-0 text-muted-foreground">Ad ID</dt><dd className="font-medium">{l.id}</dd></div>
            </dl>
            <p className="mt-2 text-[12px] text-muted-foreground">The permit and its DLD QR code are on the original ad.</p>
          </section>
        </div>

        {/* Sidebar: TrueUnit check, then agent and agency, like Property Finder's contact column */}
        <aside className="space-y-4 md:sticky md:top-24 md:self-start">
          <section className="space-y-3 rounded-2xl border border-primary/25 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">TrueUnit check</h2>
              <StatusPill status={l.status} />
            </div>
            <p className="text-[14px]">{HEADLINE[l.status]}</p>
            <ul className="space-y-3">
              {checks.map((c, i) => {
                const Icon = ICON[c.severity];
                return (
                  <li key={c.code + (c.other ?? "")} className="flex gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-1 motion-safe:fill-mode-both motion-safe:duration-300" style={{ animationDelay: `${120 + i * 60}ms` }}>
                    <Icon className={cn("mt-0.5 size-5 shrink-0", TONE[c.severity])} />
                    <div className="min-w-0 text-[14px]">
                      <div className="font-medium">{c.label}</div>
                      <div className="text-[13px] text-muted-foreground">{c.detail}</div>
                      {c.other && <Link href={`/listing/${c.other}`} className="text-[13px] text-primary underline">See listing #{c.other}</Link>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.42_0.16_290)] p-4 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AgentAvatar name={l.agent} image={l.agentImage} size={64} className="ring-2 ring-white" />
                {l.agentSuper && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap text-primary">SuperAgent</span>}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[16px] font-semibold">{l.agent}</div>
                {l.agentLanguages.length > 0 && (
                  <div className="flex items-center gap-1 text-[12px] opacity-85"><Languages className="size-3.5" /> {l.agentLanguages.slice(0, 3).join(", ")}</div>
                )}
              </div>
            </div>
            <div className="mt-4"><ConfirmBar listing={l} inline /></div>
          </section>

          <section className="flex items-center gap-3 rounded-2xl border p-3">
            {l.brokerLogo ? (
              <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-white">
                <FadeImage src={l.brokerLogo} alt="" className="absolute inset-0 size-full object-contain p-1" />
              </span>
            ) : null}
            <div className="min-w-0 text-[14px] font-medium">{l.broker}</div>
          </section>
        </aside>
      </div>
      <ConfirmBar listing={l} />
    </div>
  );
}
