import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BedDouble, Bath, Maximize, ExternalLink, ShieldCheck, ShieldAlert, ShieldX, Layers, ChevronLeft,
  Clock, Building2, Sofa, Languages, FileText, Check, TrendingUp, Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/status-pill";
import { ConfirmBar } from "@/components/confirm-drawer";
import { FadeImage } from "@/components/fade-image";
import { AgentAvatar } from "@/components/agent-avatar";
import { PhotoGallery } from "@/components/photo-gallery";
import { PriceTrend } from "@/components/price-trend";
import { ListingDescription } from "@/components/listing-description";
import { UpfrontCosts, Glossary } from "@/components/expat-guide";
import { LocationCard } from "@/components/location-card";
import { ListingScout } from "@/components/listing-scout";
import { negotiation } from "@/lib/negotiate";
import { HandCoins } from "lucide-react";
import { getListing, getUnit, aed, listedAgo, trendFor, BUILDING_DETAILS, type Severity } from "@/lib/data";
import { cn } from "@/lib/utils";

const ICON: Record<Severity, typeof ShieldCheck> = { ok: ShieldCheck, ask: ShieldAlert, hide: ShieldX };
const TONE: Record<Severity, string> = { ok: "text-emerald-600", ask: "text-amber-600", hide: "text-red-600" };
const HEADLINE: Record<Severity, string> = {
  ok: "Nothing looks wrong. Still worth confirming it is free before you call.",
  ask: "Some things need an answer from the agent before you spend time on it.",
  hide: "This ad is likely misleading. Scout hid it from your results.",
};
const FURNISHED: Record<string, string> = { YES: "Furnished", NO: "Unfurnished", PARTLY: "Partly furnished" };
const clean = (s?: string) => (s ?? "").toLowerCase().replace(/\s+\((llc|p\.j\.s\.c)\)/, "").replace(/\s+/g, " ").trim();

function Row({ k, v, icon: Icon }: { k: string; v: React.ReactNode; icon?: typeof Clock }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
      <dt className="w-28 shrink-0 text-muted-foreground">{k}</dt>
      <dd className="min-w-0 font-medium break-words">{v}</dd>
    </div>
  );
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = getListing(id);
  if (!l) notFound();
  const unit = getUnit(l.unitId);
  const siblings = (unit?.listingIds ?? []).filter((x) => x !== l.id).map((x) => getListing(x)!).filter(Boolean);
  const order = { hide: 0, ask: 1, ok: 2 } as const;
  const checks = [...l.checks].sort((a, b) => order[a.severity] - order[b.severity]);
  const trend = trendFor(l.kind, l.beds);
  const deal = negotiation(l);
  const what = l.kind === "rent" ? "rents" : "sales";

  return (
    <div className="mx-auto max-w-7xl pb-24 md:px-8 md:pt-4 md:pb-12">
      <Link href={`/search?kind=${l.kind}&beds=${l.beds}`} className="hidden items-center gap-1 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground md:inline-flex">
        <ChevronLeft className="size-4" /> Back to results
      </Link>

      <PhotoGallery images={l.images} total={l.imageCount} verified={l.verified} superAgent={l.agentSuper} sourceUrl={l.url} title={l.title ?? "Listing photos"} />

      <div className="mt-4 grid gap-6 px-4 md:grid-cols-[minmax(0,1fr)_380px] md:gap-8 md:px-0">
        <div className="min-w-0 space-y-5">
          <Link href={`/search?kind=${l.kind}&beds=${l.beds}`} className="inline-flex items-center gap-1 text-[13px] text-muted-foreground md:hidden">
            <ChevronLeft className="size-4" /> Back to results
          </Link>

          <div className="space-y-3">
            <div className="text-[26px] font-semibold tracking-tight">
              AED {l.price.toLocaleString("en-US")}
              {l.kind === "rent" && <span className="text-[17px] font-normal text-muted-foreground"> yearly</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {l.vsRegistered !== null && (
                <Badge variant="secondary" className={cn("rounded-md px-2.5 py-1 text-[13px] font-normal", l.vsRegistered <= -15 ? "bg-amber-50 text-amber-800" : "bg-accent text-primary")}>
                  {l.vsRegistered > 0 ? "+" : ""}{l.vsRegistered}% vs registered {what}
                </Badge>
              )}
              {siblings.length > 0 && (
                <Badge variant="secondary" className="rounded-md bg-accent px-2.5 py-1 text-[13px] font-normal text-primary">
                  <Layers /> Also advertised {siblings.length}× elsewhere
                </Badge>
              )}
              <Badge asChild variant="secondary" className="rounded-md bg-accent px-2.5 py-1 text-[13px] font-normal text-primary hover:bg-primary/10">
                <a href={l.url} target="_blank" rel="noreferrer">View on Property Finder <ExternalLink /></a>
              </Badge>
            </div>
          </div>

          {l.kind === "rent" && <UpfrontCosts rent={l.price} furnished={l.furnished} />}

          <Card>
            <CardHeader><CardTitle>Property details</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-8 text-[14px] sm:grid-cols-2">
                <Row icon={Clock} k="Listed" v={listedAgo(l.ageDays)} />
                <Row icon={Building2} k="Property type" v="Apartment" />
                <Row icon={BedDouble} k="Bedrooms" v={`${l.beds} ${l.beds === 1 ? "Bed" : "Beds"}`} />
                <Row icon={Bath} k="Bathrooms" v={`${l.baths} ${l.baths === 1 ? "Bath" : "Baths"}`} />
                <Row icon={Maximize} k="Area" v={`${l.size.toLocaleString()} sq ft`} />
                <Row icon={Sofa} k="Furnishing" v={l.furnished ? FURNISHED[l.furnished] ?? l.furnished : "Not stated"} />
              </dl>
            </CardContent>
          </Card>

          {l.registered.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Receipt className="size-4 text-primary" /> Registered {what} for this size</CardTitle>
                <CardDescription>What a {l.size.toLocaleString()} sq ft flat in this tower actually {l.kind === "rent" ? "rented" : "sold"} for. DLD records via DataGuru.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="overflow-hidden rounded-lg border">
                  <Table className="tabular-nums">
                    <TableHeader>
                      <TableRow><TableHead>Date</TableHead><TableHead>Price (AED)</TableHead><TableHead className="text-right">Size</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="bg-accent/70 font-medium hover:bg-accent/70">
                        <TableCell>This ad</TableCell><TableCell>{l.price.toLocaleString("en-US")}</TableCell><TableCell className="text-right">{l.size.toLocaleString()} sq ft</TableCell>
                      </TableRow>
                      {l.registered.map((t) => (
                        <TableRow key={t.date + t.amount}>
                          <TableCell>{new Date(t.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                          <TableCell>{t.amount.toLocaleString("en-US")}</TableCell>
                          <TableCell className="text-right">{t.size.toLocaleString()} sq ft</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {l.vsRegistered !== null && l.registeredMedian && (
                  <p className="text-[13px] text-muted-foreground">
                    This ad is <b className="text-foreground">{l.vsRegistered > 0 ? `${l.vsRegistered}% above` : l.vsRegistered < 0 ? `${Math.abs(l.vsRegistered)}% below` : "equal to"}</b> the median of these registered {what} (AED {Math.round(l.registeredMedian).toLocaleString("en-US")}).
                    {l.vsMedian !== null && <> Against other live ads in the tower it is {l.vsMedian > 0 ? "+" : ""}{l.vsMedian}% per sq ft.</>}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {deal && (
            <Card className={cn(deal.tone === "high" ? "border-amber-200" : deal.tone === "low" ? "border-sky-200" : "border-emerald-200")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><HandCoins className="size-4 text-primary" /> What to offer</CardTitle>
                <CardDescription>From the registered deals above. A suggestion, not a promise.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-[14px]">
                <div className="text-[18px] font-semibold">{deal.headline}</div>
                <p className="text-muted-foreground">{deal.why}</p>
                <p>{deal.tip}</p>
              </CardContent>
            </Card>
          )}

          {Object.keys(trend).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="size-4 text-primary" /> Prices and trends</CardTitle>
                <CardDescription>Average {l.beds}-bed {l.kind === "rent" ? "yearly rent" : "sale price"} in Princess Tower and Dubai Marina. DataGuru.</CardDescription>
              </CardHeader>
              <CardContent><PriceTrend series={trend} /></CardContent>
            </Card>
          )}

          {siblings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Layers className="size-4 text-primary" /> Same flat, other ads</CardTitle>
                <CardDescription>The same photos, bedrooms and size, from other ads.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {siblings.map((s) => (
                    <li key={s.id}>
                      <Link href={`/listing/${s.id}`} className="flex items-center gap-3 px-6 py-3 text-[14px] transition-colors hover:bg-accent/60">
                        <AgentAvatar name={s.agent} image={s.agentImage} size={28} />
                        <span className="min-w-0 flex-1 truncate">{s.broker}</span>
                        <span className="font-medium tabular-nums">{aed(s.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardDescription>Apartment for {l.kind === "rent" ? "rent" : "sale"} in Princess Tower, Dubai Marina</CardDescription>
              <CardTitle className="text-[18px]">{l.title}</CardTitle>
            </CardHeader>
            <CardContent><ListingDescription text={l.descriptionText || l.description} /></CardContent>
          </Card>

          <ListingScout listing={l} />

          <LocationCard />

          {l.kind === "rent" && (
            <Card>
              <CardHeader>
                <CardTitle>New to Dubai?</CardTitle>
                <CardDescription>The terms this ad assumes you know.</CardDescription>
              </CardHeader>
              <CardContent><Glossary only={["ejari", "dewa", "cheques", "chiller", "housing-fee", "deposit", "agency-fee"]} /></CardContent>
            </Card>
          )}

          {l.amenities.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {l.amenities.map((a) => (
                  <Badge key={a} variant="outline" className="gap-1 rounded-md px-2.5 py-1 text-[13px] font-normal"><Check className="text-emerald-600" /> {a}</Badge>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            {BUILDING_DETAILS && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="size-4" /> About Princess Tower</CardTitle></CardHeader>
                <CardContent>
                  <dl className="text-[14px]">
                    <Row k="Developer" v={<span className="capitalize">{clean(BUILDING_DETAILS.developer_name)}</span>} />
                    <Row k="Master plan" v={<span className="capitalize">{clean(BUILDING_DETAILS.master_developer_name)}</span>} />
                    <Row k="Completed" v={BUILDING_DETAILS.completion_year} />
                    <Row k="Floors" v="101, layouts repeat" />
                  </dl>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="size-4" /> Regulatory information</CardTitle>
                <CardDescription>The permit and its DLD QR code are on the original ad.</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="text-[14px]">
                  <Row k="Reference" v={<span className="break-all">{l.reference ?? "-"}</span>} />
                  <Row k="Listed" v={l.listed} />
                  <Row k="Agency" v={l.broker} />
                  <Row k="Ad ID" v={l.id} />
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>

        <aside className="space-y-4 md:sticky md:top-24 md:self-start">
          <Card className="border-primary/25">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>TrueUnit check</CardTitle>
                <StatusPill status={l.status} />
              </div>
              <CardDescription className="text-foreground">{HEADLINE[l.status]}</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card className="gap-4 border-0 bg-gradient-to-br from-primary to-[oklch(0.42_0.16_290)] text-white">
            <CardContent className="flex items-center gap-3">
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
            </CardContent>
            <CardContent className="hidden md:block"><ConfirmBar listing={l} inline /></CardContent>
          </Card>

          <Card className="py-3">
            <CardContent className="flex items-center gap-3 px-3">
              {l.brokerLogo ? (
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-white">
                  <FadeImage src={l.brokerLogo} alt="" className="absolute inset-0 size-full object-contain p-1" />
                </span>
              ) : null}
              <div className="min-w-0 text-[14px] font-medium">{l.broker}</div>
            </CardContent>
          </Card>
          <Separator className="md:hidden" />
        </aside>
      </div>
      <ConfirmBar listing={l} />
    </div>
  );
}
