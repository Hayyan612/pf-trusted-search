"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, animate, motion, useInView } from "motion/react";
import { CheckCircle2, ChevronRight, HelpCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StatusPill } from "@/components/status-pill";
import { FadeImage } from "@/components/fade-image";
import { AskAgents } from "@/components/ask-agents";
import { matchBrief, type Match } from "@/lib/match";
import { priceLine } from "@/lib/data";
import type { Brief } from "@/lib/brief";
import { negotiation } from "@/lib/negotiate";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A number that counts to its value when it appears or changes. */
function Count({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const from = useRef(0);
  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(from.current, to, { duration: 0.9, ease: EASE, onUpdate: (v) => (node.textContent = Math.round(v).toLocaleString("en-US")) });
    from.current = to;
    return () => controls.stop();
  }, [to, inView]);
  return <span ref={ref} className="tabular-nums">0</span>;
}

function Funnel({ flats, fit, trusted, kind }: { flats: number; fit: number; trusted: number; kind: "rent" | "sale" }) {
  const steps = [
    { n: flats, label: kind === "rent" ? "real flats to rent" : "real flats for sale" },
    { n: fit, label: "fit your brief" },
    { n: trusted, label: "look genuine" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {steps.map((s, i) => (
        <div key={s.label} className="relative rounded-xl bg-muted/50 px-3 py-2.5">
          <div className="font-display text-[30px] leading-none text-foreground"><Count to={s.n} /></div>
          <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{s.label}</div>
          {i < 2 && <ChevronRight className="absolute top-1/2 -right-2.5 z-10 size-4 -translate-y-1/2 rounded-full bg-background text-muted-foreground" />}
        </div>
      ))}
    </div>
  );
}

function MatchRow({ m, rank }: { m: Match; rank?: number }) {
  const l = m.listing;
  const n = negotiation(l);
  return (
    <Link href={`/listing/${l.id}`} className="group flex gap-3 rounded-xl border bg-card p-2.5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md motion-reduce:hover:translate-y-0">
      <span className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-24">
        {l.images[0] && <FadeImage src={l.images[0]} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100" />}
        {rank && <span className="absolute top-1 left-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white shadow">{rank}</span>}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="text-[15px] font-semibold">{priceLine(l)}</span>
          <StatusPill status={l.status} />
        </div>
        <div className="truncate text-[12px] text-muted-foreground">{l.beds}-bed · {l.size.toLocaleString()} sq ft · {l.broker}</div>
        <div className="flex flex-wrap gap-1">
          {m.fits.slice(0, 3).map((f) => (
            <Badge key={f} variant="secondary" className="max-w-full gap-1 bg-emerald-50 text-left font-normal whitespace-normal text-emerald-800"><CheckCircle2 /> {f}</Badge>
          ))}
          {n && n.tone === "high" && <Badge variant="secondary" className="max-w-full bg-sky-50 font-normal whitespace-normal text-sky-800">Offer ~AED {n.offer.toLocaleString("en-US")}</Badge>}
          {m.toAsk.slice(0, 2).map((q) => (
            <Badge key={q} variant="secondary" className="max-w-full gap-1 bg-amber-50 text-left font-normal whitespace-normal text-amber-800"><HelpCircle /> {q}</Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}

/** Scout's trusted shortlist for the brief: the funnel, the top 5 with reasons, and one action. Rows re-sort smoothly when the brief changes. */
export function TopFive({ brief }: { brief: Brief }) {
  const m = useMemo(() => matchBrief(brief), [brief]);
  return (
    <Card className="border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader className="space-y-3">
        <CardTitle className="flex items-center gap-2 font-display text-[28px] font-normal"><Sparkles className="size-5 text-primary" /> Your trusted shortlist</CardTitle>
        <Funnel flats={m.counts.flats} fit={m.counts.fit} trusted={m.counts.trusted} kind={m.kind} />
        <CardDescription>Here are the best {Math.min(5, m.top.length)}, ranked by TrueUnit&apos;s checks, how well each fits, and price against registered deals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {m.top.length === 0 ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-dashed p-4 text-[14px] text-muted-foreground">
            Nothing fits this brief yet. Try a higher budget or another bedroom count.
          </motion.p>
        ) : (
          <>
            <motion.div layout className="space-y-2">
              <AnimatePresence initial={true} mode="popLayout">
                {m.top.map((x, i) => (
                  <motion.div
                    key={x.listing.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE, delay: i * 0.06 } }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                    transition={{ layout: { duration: 0.45, ease: EASE } }}
                  >
                    <MatchRow m={x} rank={i + 1} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            <AskAgents items={m.top.map((x) => ({ id: x.listing.id, toAsk: x.toAsk }))} />
            <p className="text-[12px] text-muted-foreground">Amber items are things the ad does not say; Scout asks the agent. Blue is a fair offer from registered deals.</p>
            {m.more.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger className="text-[13px] font-medium text-primary underline-offset-4 hover:underline">
                  {m.more.length} more that fit
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-1">
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
