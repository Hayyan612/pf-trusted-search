"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownUp, Building2, Check, ChevronDown, Gem, Loader2, Ruler, Sofa, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  AMENITIES, BATHS_MAX, BEDS_MAX, FURNISHING, SORTS, bedLabel, bedsBathsLabel, countFlats, matches, moreCount, priceLabel, toParams,
  type Facet, type Filters,
} from "@/lib/search-filters";
import { cn } from "@/lib/utils";

const pill = (active: boolean) =>
  cn(
    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    active ? "border-primary bg-accent text-primary" : "border-border bg-background text-foreground hover:border-primary/40",
  );
const opt = (on: boolean, disabled = false) =>
  cn(
    "min-w-10 rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-150",
    on ? "border-primary bg-accent text-primary" : "border-border hover:border-primary/40",
    disabled && "pointer-events-none opacity-40",
  );
const toggle = (xs: number[], x: number) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);
const digits = (s: string) => s.replace(/[^\d]/g, "");
const PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Compound", "Duplex"];

/** Property Finder-style filter bar: pills that open small panels, a "More Filters" drawer with a live count, all kept in the URL. */
export function SearchFilters({ filters, facets, building }: { filters: Filters; facets: Facet[]; building: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const apply = (f: Filters) => start(() => router.push(`${pathname}?${toParams(f, sp.get("view") ? { view: sp.get("view")! } : {})}`, { scroll: false }));
  const f = filters;
  const ofKind = useMemo(() => facets.filter((x) => x.kind === f.kind), [facets, f.kind]);
  const has = (patch: Partial<Filters>) => ofKind.some((x) => matches(x, { ...f, ...patch }));
  const anyActive = f.beds.length || f.baths.length || f.pmin !== undefined || f.pmax !== undefined || moreCount(f) > 0;

  return (
    <div className="space-y-2">
      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {/* Rent / Buy */}
        <Popover>
          <PopoverTrigger className={pill(true)}>{f.kind === "rent" ? "Rent" : "Buy"} <ChevronDown className="size-3.5" /></PopoverTrigger>
          <PopoverContent align="start" className="w-44 p-1.5">
            {(["rent", "sale"] as const).map((k) => (
              <button key={k} type="button" onClick={() => apply({ ...f, kind: k, pmin: undefined, pmax: undefined })} className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-[14px] hover:bg-accent">
                {k === "rent" ? "Rent" : "Buy"} {f.kind === k && <Check className="size-4 text-primary" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Property type: Princess Tower only has apartments, so the rest say so instead of pretending */}
        <Popover>
          <PopoverTrigger className={pill(false)}>Property type <ChevronDown className="size-3.5" /></PopoverTrigger>
          <PopoverContent align="start" className="w-72 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_TYPES.map((t) => <span key={t} className={opt(t === "Apartment", t !== "Apartment")}>{t}</span>)}
            </div>
            <p className="text-[12px] text-muted-foreground">{building} has apartments only.</p>
          </PopoverContent>
        </Popover>

        {/* Beds & Baths: taps apply at once, like Property Finder */}
        <Popover>
          <PopoverTrigger className={pill(f.beds.length > 0 || f.baths.length > 0)}>{bedsBathsLabel(f)} <ChevronDown className="size-3.5" /></PopoverTrigger>
          <PopoverContent align="start" className="w-80 space-y-3">
            <div>
              <div className="mb-2 text-[13px] font-semibold">Bedrooms</div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: BEDS_MAX + 1 }, (_, b) => (
                  <button key={b} type="button" className={opt(f.beds.includes(b), !f.beds.includes(b) && !has({ beds: [b] }))} onClick={() => apply({ ...f, beds: toggle(f.beds, b) })}>
                    {bedLabel(b)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-[13px] font-semibold">Bathrooms</div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: BATHS_MAX }, (_, i) => i + 1).map((b) => (
                  <button key={b} type="button" className={opt(f.baths.includes(b), !f.baths.includes(b) && !has({ baths: [b] }))} onClick={() => apply({ ...f, baths: toggle(f.baths, b) })}>
                    {b === BATHS_MAX ? `${b}+` : b}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">Greyed out: none in this building right now.</p>
          </PopoverContent>
        </Popover>

        <PricePopover f={f} facets={ofKind} apply={apply} />
        <MoreFilters f={f} facets={ofKind} apply={apply} />

        <span className="mx-0.5 hidden h-6 w-px bg-border md:block" />
        <Popover>
          <PopoverTrigger className={pill(f.sort !== "price-asc")} aria-label="Sort by"><ArrowDownUp className="size-3.5" /> <span className="hidden sm:inline">{SORTS.find((s) => s.id === f.sort)!.label}</span></PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-1.5">
            {SORTS.map((s) => (
              <button key={s.id} type="button" onClick={() => apply({ ...f, sort: s.id })} className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-[14px] hover:bg-accent">
                {s.label} {f.sort === s.id && <Check className="size-4 text-primary" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        {pending && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-label="Updating results" />}
      </div>

      {anyActive ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {f.beds.length > 0 && <Applied label={bedsBathsLabel({ ...f, baths: [] })} onClear={() => apply({ ...f, beds: [] })} />}
          {f.baths.length > 0 && <Applied label={bedsBathsLabel({ ...f, beds: [] })} onClear={() => apply({ ...f, baths: [] })} />}
          {(f.pmin !== undefined || f.pmax !== undefined) && <Applied label={priceLabel(f)} onClear={() => apply({ ...f, pmin: undefined, pmax: undefined })} />}
          {f.fu && <Applied label={FURNISHING.find((x) => x.id === f.fu)!.label} onClear={() => apply({ ...f, fu: undefined })} />}
          {(f.smin !== undefined || f.smax !== undefined) && <Applied label={`${f.smin ?? 0} to ${f.smax ?? "any"} sqft`} onClear={() => apply({ ...f, smin: undefined, smax: undefined })} />}
          {f.am.map((a) => <Applied key={a} label={a} onClear={() => apply({ ...f, am: f.am.filter((x) => x !== a) })} />)}
          <button type="button" className="px-1 text-[12px] font-medium text-primary underline-offset-4 hover:underline" onClick={() => apply({ ...f, beds: [], baths: [], pmin: undefined, pmax: undefined, fu: undefined, smin: undefined, smax: undefined, am: [] })}>
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Applied({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent py-1 pr-1 pl-2.5 text-[12px] text-primary motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95">
      {label}
      <button type="button" onClick={onClear} aria-label={`Remove ${label}`} className="grid size-5 place-items-center rounded-full hover:bg-primary/10"><X className="size-3" /></button>
    </span>
  );
}

function PricePopover({ f, facets, apply }: { f: Filters; facets: Facet[]; apply: (f: Filters) => void }) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState(f.period);
  const per = f.kind === "rent" && period === "monthly" ? 12 : 1;
  const [lo, setLo] = useState(f.pmin !== undefined ? String(Math.round(f.pmin / per)) : "");
  const [hi, setHi] = useState(f.pmax !== undefined ? String(Math.round(f.pmax / per)) : "");
  const draft: Filters = { ...f, period, pmin: lo ? Number(lo) * per : undefined, pmax: hi ? Number(hi) * per : undefined };
  const n = countFlats(facets, draft);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={pill(f.pmin !== undefined || f.pmax !== undefined)}>{priceLabel(f)} <ChevronDown className="size-3.5" /></PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-3">
        <div className="text-[13px] font-semibold">Price</div>
        <div className="flex items-center gap-2">
          <Input inputMode="numeric" placeholder="Min. Price (AED)" value={lo} onChange={(e) => setLo(digits(e.target.value))} aria-label="Minimum price in AED" />
          <span className="text-muted-foreground">to</span>
          <Input inputMode="numeric" placeholder="Max. Price (AED)" value={hi} onChange={(e) => setHi(digits(e.target.value))} aria-label="Maximum price in AED" />
        </div>
        {f.kind === "rent" && (
          <div>
            <div className="mb-2 text-[13px] font-semibold">Rental Period</div>
            <div className="flex gap-1.5">
              {(["yearly", "monthly"] as const).map((p) => (
                <button key={p} type="button" className={opt(period === p)} onClick={() => setPeriod(p)}>{p === "yearly" ? "Yearly" : "Monthly"}</button>
              ))}
            </div>
            {period === "monthly" && <p className="mt-1.5 text-[11px] text-muted-foreground">Dubai rents are agreed per year. Scout multiplies by 12.</p>}
          </div>
        )}
        <Button className="w-full" disabled={n === 0} onClick={() => { apply(draft); setOpen(false); }}>{n === 0 ? "No flats in this range" : `Show ${n} ${n === 1 ? "flat" : "flats"}`}</Button>
      </PopoverContent>
    </Popover>
  );
}

function MoreFilters({ f, facets, apply }: { f: Filters; facets: Facet[]; apply: (f: Filters) => void }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState<Filters>(f);
  const onOpen = (o: boolean) => { if (o) setD(f); setOpen(o); };
  const n = countFlats(facets, d);
  const count = moreCount(f);
  const amCount = (a: string) => countFlats(facets, { ...d, am: d.am.includes(a) ? d.am : [...d.am, a] });
  return (
    <Sheet open={open} onOpenChange={onOpen}>
      <SheetTrigger className={pill(count > 0)}>Filters{count > 0 && ` (${count})`} <SlidersHorizontal className="size-3.5" /></SheetTrigger>
      <SheetContent side="left" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>More Filters</SheetTitle>
          <SheetDescription>Counts are real flats in Princess Tower, after TrueUnit groups repeat ads.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <section className="space-y-2.5">
            <h3 className="flex items-center gap-2 text-[14px] font-semibold"><Sofa className="size-4" /> Furnishing</h3>
            <div className="flex flex-wrap gap-1.5">
              {FURNISHING.map((x) => <button key={x.label} type="button" className={opt(d.fu === x.id)} onClick={() => setD({ ...d, fu: x.id })}>{x.label}</button>)}
            </div>
          </section>
          <section className="space-y-2.5 border-t pt-5">
            <h3 className="flex items-center gap-2 text-[14px] font-semibold"><Ruler className="size-4" /> Property Size (Sqft)</h3>
            <div className="flex items-center gap-2">
              <Input inputMode="numeric" placeholder="Min. sqft" value={d.smin ?? ""} onChange={(e) => setD({ ...d, smin: digits(e.target.value) ? Number(digits(e.target.value)) : undefined })} aria-label="Minimum size in square feet" />
              <span className="text-muted-foreground">to</span>
              <Input inputMode="numeric" placeholder="Max. sqft" value={d.smax ?? ""} onChange={(e) => setD({ ...d, smax: digits(e.target.value) ? Number(digits(e.target.value)) : undefined })} aria-label="Maximum size in square feet" />
            </div>
          </section>
          <section className="space-y-2.5 border-t pt-5">
            <h3 className="flex items-center gap-2 text-[14px] font-semibold"><Gem className="size-4" /> Amenities</h3>
            <div className="flex flex-wrap gap-1.5">
              {AMENITIES.map((a) => {
                const on = d.am.includes(a);
                const c = amCount(a);
                return (
                  <button key={a} type="button" className={opt(on, !on && c === 0)} onClick={() => setD({ ...d, am: on ? d.am.filter((x) => x !== a) : [...d.am, a] })}>
                    {a}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">As the agent ticked them on the ad. Scout still asks about anything you depend on.</p>
          </section>
          <section className="space-y-1.5 border-t pt-5">
            <h3 className="flex items-center gap-2 text-[14px] font-semibold"><Building2 className="size-4" /> Number Of Cheques</h3>
            <p className="text-[13px] text-muted-foreground">Most ads here do not say. Scout asks the agent instead of filtering out flats that might allow it.</p>
          </section>
        </div>
        <SheetFooter className="flex-row gap-2 border-t">
          <Button variant="ghost" onClick={() => setD({ ...d, fu: undefined, smin: undefined, smax: undefined, am: [] })}>Reset</Button>
          <Button className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand)]/90" disabled={n === 0} onClick={() => { apply(d); setOpen(false); }}>
            {n === 0 ? "No flats match" : `Show ${n} ${n === 1 ? "result" : "results"}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
