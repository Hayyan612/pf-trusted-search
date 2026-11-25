import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { HiddenAds } from "@/components/hidden-ads";
import { Suspense } from "react";
import { SearchFilters } from "@/components/search-filters";
import { listingsFor, unitsFor, BUILDING, type Listing } from "@/lib/data";
import { heading, matches, parseFilters, sorter, toParams, type Facet } from "@/lib/search-filters";
import { cn } from "@/lib/utils";

type SP = Promise<Record<string, string | undefined>>;

const facet = (l: Listing): Facet => ({
  id: l.id, unitId: l.unitId, kind: l.kind, beds: l.beds, baths: l.baths, price: l.price, size: l.size,
  furnished: l.furnished ?? null, amenities: l.amenities, ageDays: l.ageDays, status: l.status,
});

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const f = parseFilters((k) => sp[k]);
  const view = sp.view === "ads" ? "ads" : "flats";
  const q = (patch: Record<string, string>) => `/search?${toParams(f, { view, ...patch })}`;
  const all = [...listingsFor("rent"), ...listingsFor("sale")];
  const facets = all.map(facet);
  const ok = (l: Listing) => matches(facet(l), f);
  const sort = sorter(f.sort);
  const units = unitsFor(f.kind).filter((u) => ok(u.listing)).sort((a, b) => sort(a.listing, b.listing));
  const visible = units.filter((u) => u.listing.status !== "hide");
  const hidden = units.filter((u) => u.listing.status === "hide");
  const ads = listingsFor(f.kind).filter(ok).sort(sort);
  const s = {
    ads: ads.length,
    flats: units.length,
    hidden: hidden.length,
    ask: units.filter((u) => u.listing.status === "ask").length,
    clear: units.filter((u) => u.listing.status === "ok").length,
  };

  return (
    <div className="mx-auto max-w-7xl pt-3 md:px-8 md:pt-6">
      <header className="mb-4 space-y-3 px-4 md:mb-6 md:rounded-2xl md:border md:bg-card md:p-5 md:shadow-sm">
        <h1 className="text-[20px] leading-tight font-semibold md:text-[24px]">
          {heading(f, BUILDING)} <span className="ml-1 text-[14px] font-normal text-muted-foreground">{s.flats} {s.flats === 1 ? "flat" : "flats"} · {s.ads} ads</span>
        </h1>
        <Suspense fallback={<div className="h-9" />}>
          <SearchFilters filters={f} facets={facets} building={BUILDING} />
        </Suspense>
      </header>
      <div className="md:grid md:grid-cols-[300px_1fr] md:gap-8 lg:grid-cols-[320px_minmax(0,820px)] lg:justify-center">
      <aside className="space-y-4 md:sticky md:top-24 md:self-start">

      {/* TrueUnit banner: the moment of "this list is noisy" */}
      <Card className="mx-4 gap-0 border-primary/20 bg-accent p-4 shadow-none md:mx-0">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-primary">
          <Sparkles className="size-4" /> Scout checked these {s.ads} ads
        </div>
        <p className="mt-1 text-[15px] leading-snug">
          {s.flats === 0 ? "No flats match these filters." : <>They are <b>{s.flats} real flats</b>.</>} {s.clear} look genuine, {s.ask} need a question to the agent
          {s.hidden > 0 && <>, and {s.hidden} look misleading</>}.
        </p>
        <div className={cn("mt-3 grid grid-cols-2 gap-1 rounded-xl bg-white p-1 text-[13px] font-medium", s.flats === 0 && "hidden")}>
          <Link href={q({ view: "flats" })} className={cn("rounded-lg py-2 text-center transition-colors duration-200", view === "flats" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            Real flats ({s.flats - s.hidden})
          </Link>
          <Link href={q({ view: "ads" })} className={cn("rounded-lg py-2 text-center transition-colors duration-200", view === "ads" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            All ads ({s.ads})
          </Link>
        </div>
      </Card>

      <p className="hidden px-1 text-[12px] text-muted-foreground md:block">Real ads captured from propertyfinder.ae. Checks explained in <Link href="/how" className="underline">How it decides</Link>.</p>
      </aside>

      <div className="mt-4 grid gap-4 px-4 md:mt-0 md:px-0">
        {s.flats === 0 && (
          <Card className="items-center gap-2 border-dashed p-8 text-center shadow-none">
            <p className="text-[15px] font-medium">No flats in {BUILDING} match all of these.</p>
            <p className="text-[13px] text-muted-foreground">Remove a filter above, or tell Scout what matters and it will ask agents about the rest.</p>
            <Link href="/assistant" className="text-[13px] font-medium text-primary underline underline-offset-4">Ask Scout</Link>
          </Card>
        )}
        {view === "flats" ? (
          <>
            {visible.map(({ listing, unit }, i) => (
              <ListingCard key={unit.id} listing={listing} unit={unit} showUnit index={i} />
            ))}
            {hidden.length > 0 && (
              <HiddenAds count={hidden.length}>
                {hidden.map(({ listing, unit }) => (
                  <ListingCard key={unit.id} listing={listing} unit={unit} showUnit />
                ))}
              </HiddenAds>
            )}
          </>
        ) : (
          ads.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)
        )}
      </div>
    </div>
    </div>
  );
}
