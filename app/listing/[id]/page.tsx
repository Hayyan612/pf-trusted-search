import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BedDouble, Bath, Maximize, ExternalLink, ShieldCheck, ShieldAlert, ShieldX, Layers, ChevronLeft,
  Clock, Building2, Sofa, BadgeCheck, Languages, FileText, Check,
} from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { ConfirmBar } from "@/components/confirm-drawer";
import { FadeImage } from "@/components/fade-image";
import { PhotoGallery } from "@/components/photo-gallery";
import { AgentAvatar } from "@/components/agent-avatar";
import { getListing, getUnit, aed, listedAgo, trendFor, BUILDING_DETAILS, type Severity } from "@/lib/data";
import { TrendChart } from "@/components/trend-chart";
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

      <PhotoGallery images={l.images} total={l.imageCount} verified={l.verified} superAgent={l.agentSuper} sourceUrl={l.url} title={l.title ?? "Listing photos"} />

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
              {l.vsRegistered !== null && (
                <span className={cn("rounded-lg px-2.5 py-1", l.vsRegistered <= -15 ? "bg-amber-50 text-amber-800" : "bg-accent text-primary")}>
                  {l.vsRegistered > 0 ? "+" : ""}{l.vsRegistered}% vs registered {l.kind === "rent" ? "rents" : "sales"}
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

          {l.registered.length > 0 && (
            <section className="border-t pt-5">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[16px] font-semibold">Registered {l.kind === "rent" ? "rents" : "sales"} for this size</h2>
                <span className="text-[12px] text-muted-foreground">DLD records via DataGuru</span>
              </div>
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-[14px] tabular-nums">
                  <thead className="bg-muted/60 text-left text-[12px] text-muted-foreground">
                    <tr><th className="px-3 py-2 font-medium">Date</th><th className="px-3 py-2 font-medium">Price (AED)</th><th className="px-3 py-2 text-right font-medium">Size</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="bg-accent/70 font-medium">
                      <td className="px-3 py-2">This ad</td><td className="px-3 py-2">{l.price.toLocaleString("en-US")}</td><td className="px-3 py-2 text-right">{l.size.toLocaleString()} sq ft</td>
                    </tr>
                    {l.registered.map((t) => (
                      <tr key={t.date + t.amount}>
                        <td className="px-3 py-2">{new Date(t.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td className="px-3 py-2">{t.amount.toLocaleString("en-US")}</td>
                        <td className="px-3 py-2 text-right">{t.size.toLocaleString()} sq ft</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {l.vsRegistered !== null && l.registeredMedian && (
                <p className="mt-2 text-[13px] text-muted-foreground">
                  This ad is <b className="text-foreground">{l.vsRegistered > 0 ? `${l.vsRegistered}% above` : l.vsRegistered < 0 ? `${Math.abs(l.vsRegistered)}% below` : "equal to"}</b> the median of these registered {l.kind === "rent" ? "rents" : "sales"} (AED {Math.round(l.registeredMedian).toLocaleString("en-US")}).
                  {median > 0 && l.vsMedian !== null && <> Against other live ads in the tower it is {l.vsMedian > 0 ? "+" : ""}{l.vsMedian}% per sq ft.</>}
                </p>
              )}
            </section>
          )}

          {trendFor(l.kind, l.beds).length > 1 && (
            <section className="border-t pt-5">
              <h2 className="mb-1 text-[16px] font-semibold">Prices and trends</h2>
              <p className="mb-3 text-[13px] text-muted-foreground">Average {l.beds}-bed {l.kind === "rent" ? "yearly rent" : "sale price"}, last 12 months. DataGuru.</p>
              <TrendChart points={trendFor(l.kind, l.beds)} unit={l.kind === "rent" ? "yearly rent" : "price"} />
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

          {BUILDING_DETAILS && (
            <section className="border-t pt-5">
              <h2 className="mb-3 flex items-center gap-2 text-[16px] font-semibold"><Building2 className="size-4" /> About Princess Tower</h2>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-[14px] sm:grid-cols-2">
                <div className="flex gap-3"><dt className="w-28 shrink-0 text-muted-foreground">Developer</dt><dd className="font-medium capitalize">{BUILDING_DETAILS.developer_name?.toLowerCase().replace(/\s+\(llc\)/, "").trim()}</dd></div>
                <div className="flex gap-3"><dt className="w-28 shrink-0 text-muted-foreground">Master plan</dt><dd className="font-medium capitalize">{BUILDING_DETAILS.master_developer_name?.toLowerCase().replace(/\s+\(p\.j\.s\.c\)/, "").trim()}</dd></div>
                <div className="flex gap-3"><dt className="w-28 shrink-0 text-muted-foreground">Completed</dt><dd className="font-medium">{BUILDING_DETAILS.completion_year}</dd></div>
                <div className="flex gap-3"><dt className="w-28 shrink-0 text-muted-foreground">Floors</dt><dd className="font-medium">101, same layouts repeat on most floors</dd></div>
              </dl>
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
