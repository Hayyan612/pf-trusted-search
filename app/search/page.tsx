import Link from "next/link";
import { Sparkles, ChevronDown } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { listingsFor, unitsFor, summary, BUILDING, type Kind } from "@/lib/data";
import { cn } from "@/lib/utils";

type SP = Promise<{ kind?: string; beds?: string; view?: string }>;

function chip(active: boolean) {
  return cn(
    "rounded-full border px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors duration-200 hover:border-primary/50",
    active ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground",
  );
}

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const kind: Kind = sp.kind === "sale" ? "sale" : "rent";
  const beds = sp.beds ? Number(sp.beds) : undefined;
  const view = sp.view === "ads" ? "ads" : "flats";
  const s = summary(kind, beds);
  const q = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams({ kind, ...(beds ? { beds: String(beds) } : {}), view, ...patch } as Record<string, string>);
    for (const [k, v] of Object.entries(patch)) if (v === undefined) p.delete(k);
    return `/search?${p.toString()}`;
  };
  const units = unitsFor(kind, beds);
  const visible = units.filter((u) => u.listing.status !== "hide");
  const hidden = units.filter((u) => u.listing.status === "hide");
  const ads = listingsFor(kind, beds);

  return (
    <div className="mx-auto max-w-7xl pt-3 md:grid md:grid-cols-[320px_1fr] md:gap-8 md:px-8 md:pt-8">
      <aside className="space-y-4 md:sticky md:top-24 md:self-start">
      <div className="space-y-2 px-4 md:px-0">
        <div className="text-[13px] text-muted-foreground">{BUILDING}</div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
          <Link href={q({ kind: "rent" })} className={chip(kind === "rent")}>Rent</Link>
          <Link href={q({ kind: "sale" })} className={chip(kind === "sale")}>Buy</Link>
          <span className="mx-1 w-px bg-border" />
          <Link href={q({ beds: undefined })} className={chip(!beds)}>Any beds</Link>
          {[1, 2, 3, 4].map((b) => (
            <Link key={b} href={q({ beds: String(b) })} className={chip(beds === b)}>
              {b} bed
            </Link>
          ))}
        </div>
      </div>

      {/* TrueUnit banner: the moment of "this list is noisy" */}
      <div className="mx-4 rounded-2xl border border-primary/20 bg-accent p-4 md:mx-0">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-primary">
          <Sparkles className="size-4" /> Scout checked these {s.ads} ads
        </div>
        <p className="mt-1 text-[15px] leading-snug">
          They are <b>{s.flats} real flats</b>. {s.clear} look genuine, {s.ask} need a question to the agent
          {s.hidden > 0 && <>, and {s.hidden} look misleading</>}.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-white p-1 text-[13px] font-medium">
          <Link href={q({ view: "flats" })} className={cn("rounded-lg py-2 text-center transition-colors duration-200", view === "flats" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            Real flats ({s.flats - s.hidden})
          </Link>
          <Link href={q({ view: "ads" })} className={cn("rounded-lg py-2 text-center transition-colors duration-200", view === "ads" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            All ads ({s.ads})
          </Link>
        </div>
      </div>

      <p className="hidden px-1 text-[12px] text-muted-foreground md:block">Real ads captured from propertyfinder.ae. Checks explained in <Link href="/how" className="underline">How it decides</Link>.</p>
      </aside>

      <div className="mt-4 grid gap-3 px-4 sm:grid-cols-2 md:mt-0 md:px-0 xl:grid-cols-3">
        {view === "flats" ? (
          <>
            {visible.map(({ listing, unit }, i) => (
              <ListingCard key={unit.id} listing={listing} unit={unit} showUnit index={i} />
            ))}
            {hidden.length > 0 && (
              <details className="group rounded-2xl border p-3 sm:col-span-2 xl:col-span-3">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-medium">
                  {hidden.length} hidden as likely misleading
                  <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-[13px] text-muted-foreground">Hidden, not deleted. Open one to see why. You can still contact the agent.</p>
                <div className="mt-3 grid gap-3 motion-safe:animate-in motion-safe:fade-in sm:grid-cols-2 xl:grid-cols-3">
                  {hidden.map(({ listing, unit }) => (
                    <ListingCard key={unit.id} listing={listing} unit={unit} showUnit />
                  ))}
                </div>
              </details>
            )}
          </>
        ) : (
          ads.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)
        )}
      </div>
    </div>
  );
}
