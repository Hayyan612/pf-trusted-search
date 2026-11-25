import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Layers, MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BUILDING, CAPTURED_AT, summary } from "@/lib/data";

const prompts = [
  { q: "2-bed to rent in Princess Tower under AED 130k", href: "/search?kind=rent&beds=2" },
  { q: "1-bed to rent, move in this month", href: "/search?kind=rent&beds=1" },
  { q: "Buy a 2-bed in Princess Tower", href: "/search?kind=sale&beds=2" },
  { q: "3-bed for my family, buying", href: "/search?kind=sale&beds=3" },
];

export default function Home() {
  const rent = summary("rent");
  const sale = summary("sale");
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pt-6 md:grid md:grid-cols-[1.1fr_1fr] md:gap-x-12 md:gap-y-8 md:space-y-0 md:px-8 md:pt-14">
      <section className="space-y-3">
        <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
          <Sparkles className="size-3" /> Scout, with TrueUnit
        </Badge>
        <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-balance md:text-[44px] md:leading-[1.1]">
          Tell Scout what you need. It shows you the real flats, not the ads.
        </h1>
        <p className="text-[15px] text-muted-foreground md:text-[17px]">
          The same flat is often advertised several times, at different prices, or after it is already let. TrueUnit checks
          every ad, groups them into real flats, and asks the agent before you call.
        </p>
      </section>

      <section className="space-y-2 md:col-start-1">
        <div className="flex items-center gap-2 rounded-full border bg-white px-4 py-3 shadow-sm">
          <Sparkles className="size-4 text-primary" />
          <span className="text-[15px] text-muted-foreground">What are you looking for?</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => (
            <Link
              key={p.q}
              href={p.href}
              className="rounded-full border border-primary/25 px-3 py-1.5 text-[13px] text-primary transition-colors duration-200 hover:bg-accent active:scale-[0.98]"
            >
              {p.q}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:col-start-1">
        <Link href="/search?kind=rent" className="rounded-2xl bg-primary p-4 text-primary-foreground transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] motion-reduce:hover:translate-y-0">
          <div className="text-[13px] opacity-80">I want to</div>
          <div className="text-lg font-semibold">Rent</div>
          <div className="mt-3 flex items-center gap-1 text-[13px]">
            {rent.ads} ads <ArrowRight className="size-3" /> {rent.flats} flats
          </div>
        </Link>
        <Link href="/search?kind=sale" className="rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:scale-[0.98] motion-reduce:hover:translate-y-0">
          <div className="text-[13px] text-muted-foreground">I want to</div>
          <div className="text-lg font-semibold">Buy</div>
          <div className="mt-3 flex items-center gap-1 text-[13px] text-muted-foreground">
            {sale.ads} ads <ArrowRight className="size-3" /> {sale.flats} flats
          </div>
        </Link>
      </section>

      <Card className="gap-3 p-4 md:col-start-2 md:row-span-3 md:row-start-1 md:self-start md:p-6">
        <h2 className="text-[15px] font-semibold">How TrueUnit helps</h2>
        <ul className="space-y-3 text-[14px]">
          <li className="flex gap-3">
            <Layers className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>
              <b>One card per real flat.</b> Ads that use the same photos for the same flat are merged, with every agency&apos;s price shown.
            </span>
          </li>
          <li className="flex gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>
              <b>Every ad checked, with reasons.</b> Price against similar flats in the tower, photos reused from another flat, &quot;tenanted&quot; or holiday-home wording.
            </span>
          </li>
          <li className="flex gap-3">
            <MessageSquareText className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>
              <b>Confirm before you call.</b> Scout asks the agent if it is free, the final price and terms, and books a viewing. The agent stays in the deal.
            </span>
          </li>
        </ul>
      </Card>

      <p className="pb-2 text-[12px] text-muted-foreground md:col-span-2">
        Real listings from {BUILDING}, captured from propertyfinder.ae on {CAPTURED_AT}. Agent replies in this prototype are simulated.{" "}
        <Link href="/how" className="underline">
          How TrueUnit decides
        </Link>
      </p>
    </div>
  );
}
