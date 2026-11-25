"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, HandCoins, Loader2, MessageCircleQuestion, Plus, Quote, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AD_QUESTIONS, answerFromAd, type AdAnswer } from "@/lib/ad-answers";
import { addExtraQuestion, useExtraQuestions } from "@/lib/extra-questions";
import { useBrief } from "@/lib/brief-store";
import { negotiation } from "@/lib/negotiate";
import type { NegotiationBrief } from "@/lib/negotiation-brief";
import type { Listing } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CustomAsk } from "@/components/custom-ask";

const EASE = [0.22, 1, 0.36, 1] as const;
const aed = (n: number) => `AED ${n.toLocaleString("en-US")}`;

function Answer({ a, listing, added }: { a: AdAnswer; listing: Listing; added: boolean }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="space-y-1.5">
      <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-1.5 text-[13px] text-primary-foreground">{a.q}</div>
      <div className={cn("max-w-[92%] rounded-2xl rounded-tl-sm border px-3 py-2 text-[13px]", a.found ? "bg-card" : "border-amber-200 bg-amber-50/70")}>
        <p>{a.text}</p>
        {a.quote && <p className="mt-1 flex gap-1.5 text-muted-foreground"><Quote className="mt-0.5 size-3.5 shrink-0" /> <span className="italic">{a.quote}</span></p>}
        {!a.found && (
          <Button size="sm" variant={added ? "secondary" : "default"} className="mt-2" disabled={added} onClick={() => { addExtraQuestion(listing.id, a.ask); toast.success("Added to your questions", { description: `It goes to ${listing.agent} with "Confirm before I call".` }); }}>
            {added ? <><Check /> Added</> : <><Plus /> Ask {listing.agent?.split(" ")[0] ?? "the agent"}</>}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function NegotiationCard({ b, source }: { b: NegotiationBrief; source: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/50 p-3 text-[13px]">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[["Open at", b.opening], ["Aim for", b.target], ["Walk away above", b.walkAway]].map(([k, v]) => (
          <div key={k as string} className="rounded-lg bg-background px-2 py-2">
            <div className="text-[11px] text-muted-foreground">{k}</div>
            <div className="text-[14px] font-semibold tabular-nums">{aed(v as number)}</div>
          </div>
        ))}
      </div>
      <p>{b.summary}</p>
      <div>
        <div className="font-medium">Use these</div>
        <ul className="mt-1 space-y-0.5">{b.arguments.map((x) => <li key={x} className="flex gap-1.5"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" /> {x}</li>)}</ul>
      </div>
      <div>
        <div className="font-medium">Offer instead of money</div>
        <ul className="mt-1 space-y-0.5">{b.tradeOffs.map((x) => <li key={x} className="flex gap-1.5"><HandCoins className="mt-0.5 size-3.5 shrink-0 text-primary" /> {x}</li>)}</ul>
      </div>
      <div>
        <div className="font-medium">Settle these first</div>
        <ul className="mt-1 space-y-0.5">{b.askFirst.map((x) => <li key={x} className="flex gap-1.5"><MessageCircleQuestion className="mt-0.5 size-3.5 shrink-0 text-amber-600" /> {x}</li>)}</ul>
      </div>
      <div className="rounded-lg border bg-background p-2.5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-medium">Message to the agent</span>
          <button type="button" className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline" onClick={() => navigator.clipboard?.writeText(b.message).then(() => toast.success("Message copied")).catch(() => toast("Select the text to copy it"))}>
            <Copy className="size-3.5" /> Copy
          </button>
        </div>
        <pre className="font-sans text-[13px] leading-relaxed whitespace-pre-wrap">{b.message}</pre>
      </div>
      <p className="text-[11px] text-muted-foreground">{source === "ai" ? "Written by Scout's AI from registered deals, other ads and TrueUnit's checks only." : "Built from registered deals and TrueUnit's checks."} A suggestion, not advice.</p>
    </motion.div>
  );
}

/** Scout, placed on the listing: quick answers from the ad, add what it does not say, and an AI negotiation brief. */
export function ListingScout({ listing, bare = false, asked: askedProp, onAsk }: { listing: Listing; bare?: boolean; asked?: string[]; onAsk?: (id: string) => void }) {
  const brief = useBrief();
  const extras = useExtraQuestions(listing.id);
  const [askedLocal, setAskedLocal] = useState<string[]>([]);
  const asked = askedProp ?? askedLocal;
  const ask = (id: string) => (onAsk ? onAsk(id) : setAskedLocal((x) => (x.includes(id) ? x : [...x, id])));
  const [neg, setNeg] = useState<{ b: NegotiationBrief; source: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const n = negotiation(listing);

  const write = async () => {
    setBusy(true);
    try {
      const r = await fetch("/api/negotiate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: listing.id, brief }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setNeg({ b: j.brief, source: j.source });
    } catch {
      toast.error("Could not write the brief just now. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const answers = asked.map((id) => answerFromAd(listing, id)).filter(Boolean) as AdAnswer[];

  const content = (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {AD_QUESTIONS(listing).map((d) => {
            const on = asked.includes(d.id);
            return (
              <motion.button
                key={d.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => ask(d.id)}
                className={cn("rounded-full border px-3 py-1.5 text-[12px] transition-colors", on ? "border-primary/40 bg-accent text-primary" : "border-primary/25 text-primary hover:bg-accent")}
              >
                {d.q}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {answers.map((a) => <Answer key={a.id} a={a} listing={listing} added={extras.includes(a.ask)} />)}
        </AnimatePresence>
        {extras.length > 0 && (
          <p className="rounded-lg bg-accent/60 px-3 py-2 text-[12px] text-primary">{extras.length} {extras.length === 1 ? "question" : "questions"} added. Tap <b>Confirm before I call</b> to send {extras.length === 1 ? "it" : "them"} to {listing.agent}.</p>
        )}

        <CustomAsk listing={listing} />

        <div className="space-y-2 border-t pt-3">
          <div className="flex items-center gap-2 text-[13px] font-medium"><HandCoins className="size-4 text-primary" /> Negotiation</div>
          {n && <p className="text-[13px] text-muted-foreground">{n.headline}. {n.why}</p>}
          {!neg && (
            <Button className="w-full" onClick={write} disabled={busy}>
              {busy ? <><Loader2 className="animate-spin" /> Writing your brief…</> : <><Sparkles /> Write my negotiation brief</>}
            </Button>
          )}
          {busy && <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="shimmer h-8 rounded-lg" />)}</div>}
          {neg && <NegotiationCard b={neg.b} source={neg.source} />}
        </div>
      </div>
  );
  if (bare) return content;
  return (
    <Card className="border-primary/25">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-primary to-[var(--brand)] text-white"><Sparkles className="size-3.5" /></span> Ask Scout about this flat</CardTitle>
        <CardDescription>Answers come from the ad itself. If the ad does not say, Scout asks {listing.agent} for you.</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
