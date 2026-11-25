import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BUILDING, CAPTURED_AT, summary } from "@/lib/data";
import { cn } from "@/lib/utils";

const PROMPTS = [
  { q: "2-bed to rent under 130k", href: "/search?kind=rent&beds=2" },
  { q: "1-bed, moving this month", href: "/search?kind=rent&beds=1" },
  { q: "Buy a 2-bed", href: "/search?kind=sale&beds=2" },
];

const IDEAS = [
  { n: "01", t: "One card per real flat", d: "Ads that show the same flat are grouped, with every agency's price side by side." },
  { n: "02", t: "Every ad checked, with the reason", d: "Price against registered deals, reused photos, stale or “tenanted” wording." },
  { n: "03", t: "Confirmed before you call", d: "Scout asks the agent what the ad leaves out. The agent stays in the deal." },
];

const RISE = "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:fill-mode-both motion-safe:duration-700";
/** Staggered entrance: each block fades up a little after the one before. */
const delay = (i: number) => ({ animationDelay: `${i * 90}ms` });

export default function Home() {
  const rent = summary("rent");
  const sale = summary("sale");
  const ads = rent.ads + sale.ads;
  const flats = rent.flats + sale.flats;
  const flagged = rent.ask + rent.hidden + sale.ask + sale.hidden;
  const stats: [number, string][] = [
    [ads, "ads in the tower"],
    [flats, "real flats behind them"],
    [flagged, "flats worth a question first"],
  ];

  return (
    <div className="relative overflow-hidden">
      {/* soft light from above, nothing else */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-40 h-[520px] bg-[radial-gradient(ellipse_at_top,oklch(0.93_0.04_285/0.55),transparent_65%)]" />

      <div className="relative mx-auto max-w-3xl px-5 pt-14 pb-16 md:pt-28 md:pb-24">
        <p className={cn(RISE, "text-[12px] font-medium tracking-[0.18em] text-muted-foreground uppercase")} style={delay(0)}>
          {BUILDING}
        </p>

        <h1 className={cn(RISE, "mt-5 font-display text-[46px] leading-[1.02] tracking-[-0.01em] text-balance text-foreground md:text-[78px]")} style={delay(1)}>
          The real flats,
          <br />
          <span className="text-primary italic">not the ads.</span>
        </h1>

        <p className={cn(RISE, "mt-6 max-w-xl text-[16px] leading-relaxed text-muted-foreground md:text-[18px]")} style={delay(2)}>
          Tell Scout what you need. It checks every ad in the building, sets aside the misleading ones, and asks the agents
          for you before you spend a call.
        </p>

        <div className={cn(RISE, "mt-10")} style={delay(3)}>
          <Link
            href="/assistant"
            className="group flex items-center gap-3 rounded-full border border-foreground/10 bg-white/80 py-2 pr-2 pl-5 shadow-[0_12px_40px_-20px_oklch(0.35_0.12_285/0.45)] backdrop-blur transition-[border-color,box-shadow] duration-300 hover:border-primary/30 hover:shadow-[0_18px_50px_-18px_oklch(0.35_0.12_285/0.6)]"
          >
            <span className="flex-1 truncate text-[15px] text-muted-foreground">What are you looking for?</span>
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[14px] font-medium text-primary-foreground transition-transform duration-300 group-hover:translate-x-0.5">
              Ask Scout <ArrowRight className="size-4" />
            </span>
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 pl-1 text-[13px]">
            {PROMPTS.map((p) => (
              <Link key={p.q} href={p.href} className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
                {p.q}
              </Link>
            ))}
            <Link href="/assistant?demo=1" className="font-medium text-primary underline-offset-4 hover:underline">
              60-second demo
            </Link>
          </div>
        </div>

        <dl className={cn(RISE, "mt-16 grid grid-cols-3 border-y border-foreground/10 py-6 md:mt-20")} style={delay(4)}>
          {stats.map(([n, label], i) => (
            <div key={label} className={i > 0 ? "border-l border-foreground/10 pl-4 md:pl-8" : ""}>
              <dt className="sr-only">{label}</dt>
              <dd className="font-display text-[34px] leading-none tabular-nums md:text-[48px]">{n}</dd>
              <dd className="mt-2 text-[12px] leading-snug text-muted-foreground md:text-[13px]">{label}</dd>
            </div>
          ))}
        </dl>

        <ol className={cn(RISE, "mt-14 divide-y divide-foreground/10")} style={delay(5)}>
          {IDEAS.map((x) => (
            <li key={x.n} className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-5 md:grid-cols-[3.5rem_15rem_1fr] md:items-baseline">
              <span className="font-display text-[15px] text-muted-foreground italic md:text-[17px]">{x.n}</span>
              <span className="text-[15px] font-medium">{x.t}</span>
              <span className="col-start-2 mt-1 text-[14px] leading-relaxed text-muted-foreground md:col-start-3 md:mt-0">{x.d}</span>
            </li>
          ))}
        </ol>

        <div className={cn(RISE, "mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px]")} style={delay(6)}>
          <Link href="/search?kind=rent" className="group inline-flex items-center gap-1 font-medium">
            Browse {rent.flats} flats to rent <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Link href="/search?kind=sale" className="group inline-flex items-center gap-1 font-medium">
            {sale.flats} for sale <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <p className="mt-16 text-[12px] leading-relaxed text-muted-foreground">
          Real listings captured on {CAPTURED_AT}. Agent replies in this prototype are simulated.{" "}
          <Link href="/how" className="underline underline-offset-4 hover:text-foreground">
            How TrueUnit decides
          </Link>
        </p>
      </div>
    </div>
  );
}
