"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StatusPill } from "@/components/status-pill";
import { FadeImage } from "@/components/fade-image";
import { AskAgents } from "@/components/ask-agents";
import { matchBrief, type Match } from "@/lib/match";
import { priceLine } from "@/lib/data";
import type { Brief } from "@/lib/brief";

function MatchRow({ m, rank }: { m: Match; rank?: number }) {
  const l = m.listing;
  return (
    <Link href={`/listing/${l.id}`} className="group flex gap-3 rounded-xl border p-2.5 transition hover:border-primary/40 hover:shadow-sm">
      <span className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-24">
        {l.images[0] && <FadeImage src={l.images[0]} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
        {rank && <span className="absolute top-1 left-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white">{rank}</span>}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="text-[15px] font-semibold">{priceLine(l)}</span>
          <StatusPill status={l.status} />
        </div>
        <div className="truncate text-[12px] text-muted-foreground">{l.beds}-bed · {l.size.toLocaleString()} sq ft · {l.broker}</div>
        <div className="flex flex-wrap gap-1">
          {m.fits.slice(0, 3).map((f) => (
            <Badge key={f} variant="secondary" className="gap-1 bg-emerald-50 font-normal text-emerald-800"><CheckCircle2 /> {f}</Badge>
          ))}
          {m.toAsk.slice(0, 2).map((q) => (
            <Badge key={q} variant="secondary" className="gap-1 bg-amber-50 font-normal text-amber-800"><HelpCircle /> {q}</Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}

/** Scout's trusted shortlist for the brief: the funnel, the top 5 with reasons, and one action. */
export function TopFive({ brief }: { brief: Brief }) {
  const m = useMemo(() => matchBrief(brief), [brief]);
  return (
    <Card className="border-primary/25">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Your trusted shortlist</CardTitle>
        <CardDescription>
          {m.counts.flats} real flats {m.kind === "rent" ? "to rent" : "for sale"} in Princess Tower <ArrowRight className="inline size-3" /> {m.counts.fit} fit your brief{" "}
          <ArrowRight className="inline size-3" /> {m.counts.trusted} look genuine. Here are the best {Math.min(5, m.top.length)}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {m.top.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-[14px] text-muted-foreground">
            Nothing fits this brief yet. Try a higher budget or another bedroom count.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {m.top.map((x, i) => <MatchRow key={x.listing.id} m={x} rank={i + 1} />)}
            </div>
            <AskAgents items={m.top.map((x) => ({ id: x.listing.id, toAsk: x.toAsk }))} />
            <p className="text-[12px] text-muted-foreground">
              Ranked by TrueUnit&apos;s checks, how well each fits your brief, and price against registered deals. Amber items are things the ad does not say; Scout asks the agent.
            </p>
            {m.more.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger className="text-[13px] font-medium text-primary underline-offset-4 hover:underline">
                  {m.more.length} more that fit
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {m.more.map((x) => <MatchRow key={x.listing.id} m={x} />)}
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
