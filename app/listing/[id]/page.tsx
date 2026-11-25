import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, Bath, Maximize, ExternalLink, ShieldCheck, ShieldAlert, ShieldX, Layers, ChevronLeft } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { ConfirmBar } from "@/components/confirm-drawer";
import { getListing, getUnit, priceLine, aed, type Severity } from "@/lib/data";
import { cn } from "@/lib/utils";

const ICON: Record<Severity, typeof ShieldCheck> = { ok: ShieldCheck, ask: ShieldAlert, hide: ShieldX };
const TONE: Record<Severity, string> = { ok: "text-emerald-600", ask: "text-amber-600", hide: "text-red-600" };

const HEADLINE: Record<Severity, string> = {
  ok: "Nothing looks wrong. Still worth confirming it is free before you call.",
  ask: "Some things need an answer from the agent before you spend time on it.",
  hide: "This ad is likely misleading. Scout hid it from your results.",
};

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = getListing(id);
  if (!l) notFound();
  const unit = getUnit(l.unitId);
  const siblings = (unit?.listingIds ?? []).filter((x) => x !== l.id).map((x) => getListing(x)!).filter(Boolean);
  const checks = [...l.checks].sort((a, b) => ({ hide: 0, ask: 1, ok: 2 })[a.severity] - ({ hide: 0, ask: 1, ok: 2 })[b.severity]);
  const median = l.medianPpsf ?? 0;
  const pos = median && l.ppsf ? Math.min(95, Math.max(5, 50 + (l.vsMedian ?? 0))) : 50;

  return (
    <div className="mx-auto flex max-w-7xl flex-col pb-20 md:grid md:grid-cols-[1fr_400px] md:gap-x-8 md:px-8 md:pt-6 md:pb-12">
      <div className="order-1 md:col-start-1 md:row-start-1">
        <Link href={`/search?kind=${l.kind}&beds=${l.beds}`} className="mb-3 hidden items-center gap-1 text-[13px] text-muted-foreground md:inline-flex">
          <ChevronLeft className="size-4" /> Back to results
        </Link>
        <div className="flex snap-x snap-mandatory gap-1 overflow-x-auto md:grid md:grid-cols-3 md:grid-rows-2 md:gap-2 md:overflow-visible">
          {l.images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className={cn("aspect-[4/3] w-[88%] shrink-0 snap-start object-cover md:size-full md:rounded-xl", i === 0 && "md:col-span-2 md:row-span-2")} />
          ))}
        </div>
      </div>

      <aside className="order-2 space-y-4 px-4 pt-3 md:col-start-2 md:row-span-2 md:row-start-1 md:self-start md:px-0 md:pt-9 md:sticky md:top-24">
        <Link href={`/search?kind=${l.kind}&beds=${l.beds}`} className="inline-flex items-center gap-1 text-[13px] text-muted-foreground md:hidden">
          <ChevronLeft className="size-4" /> Back to results
        </Link>
        <div className="space-y-1">
          <div className="text-[22px] font-semibold tracking-tight">{priceLine(l)}</div>
          <div className="text-[14px]">{l.title}</div>
          <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
            <span className="flex items-center gap-1"><BedDouble className="size-4" /> {l.beds} bed</span>
            <span className="flex items-center gap-1"><Bath className="size-4" /> {l.baths}</span>
            <span className="flex items-center gap-1"><Maximize className="size-4" /> {l.size.toLocaleString()} sq ft</span>
          </div>
          <div className="text-[13px] text-muted-foreground">{l.agent} · {l.broker} · listed {l.listed}</div>
        </div>

        {/* TrueUnit check panel: the moment of "should I call?" */}
        <section className="space-y-3 rounded-2xl border border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">TrueUnit check</h2>
            <StatusPill status={l.status} />
          </div>
          <p className="text-[14px]">{HEADLINE[l.status]}</p>
          <ul className="space-y-3">
            {checks.map((c) => {
              const Icon = ICON[c.severity];
              return (
                <li key={c.code + (c.other ?? "")} className="flex gap-3">
                  <Icon className={cn("mt-0.5 size-5 shrink-0", TONE[c.severity])} />
                  <div className="text-[14px]">
                    <div className="font-medium">{c.label}</div>
                    <div className="text-[13px] text-muted-foreground">{c.detail}</div>
                    {c.other && (
                      <Link href={`/listing/${c.other}`} className="text-[13px] text-primary underline">
                        See listing #{c.other}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
        <ConfirmBar listing={l} inline />
      </aside>

      <div className="order-3 space-y-4 px-4 pt-4 md:col-start-1 md:row-start-2 md:px-0 md:pt-6">
        {median > 0 && l.ppsf && (
          <section className="space-y-2 rounded-2xl border p-4">
            <h2 className="text-[15px] font-semibold">Price against this tower</h2>
            <div className="relative h-2 rounded-full bg-gradient-to-r from-amber-200 via-emerald-200 to-neutral-200">
              <span className="absolute -top-1 size-4 -translate-x-1/2 rounded-full border-2 border-white bg-primary shadow" style={{ left: `${pos}%` }} />
            </div>
            <p className="text-[13px] text-muted-foreground">
              AED {l.ppsf.toLocaleString()} per sq ft. The median for {l.beds}-bed {l.kind === "rent" ? "rentals" : "sales"} in Princess Tower
              is AED {Math.round(median).toLocaleString()} ({l.vsMedian! > 0 ? "+" : ""}{l.vsMedian}%). Based on the live ads, not registered deals.
            </p>
          </section>
        )}

        {siblings.length > 0 && (
          <section className="space-y-2 rounded-2xl border p-4">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold"><Layers className="size-4 text-primary" /> Same flat, other ads</h2>
            <ul className="divide-y">
              {siblings.map((s) => (
                <li key={s.id}>
                  <Link href={`/listing/${s.id}`} className="flex items-center justify-between py-2 text-[14px]">
                    <span>{s.broker}</span>
                    <span className="font-medium">{aed(s.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-1">
          <h2 className="text-[15px] font-semibold">From the ad</h2>
          <p className="text-[14px] text-muted-foreground">{l.description}…</p>
        </section>

        <a href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] text-primary underline">
          Original listing on propertyfinder.ae <ExternalLink className="size-3" />
        </a>
      </div>
      <ConfirmBar listing={l} />
    </div>
  );
}
