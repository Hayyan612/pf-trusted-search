"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BellRing, CalendarCheck, Check, ClipboardList, HandCoins, Pencil, Sparkles, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AskAgents } from "@/components/ask-agents";
import { AgentAvatar } from "@/components/agent-avatar";
import { StatusPill } from "@/components/status-pill";
import { bedsLabel, budgetLabel, moveInLabel, type Brief } from "@/lib/brief";
import { matchBrief } from "@/lib/match";
import { getListing, priceLine, type Listing } from "@/lib/data";
import { negotiation } from "@/lib/negotiate";
import { useShortlist, type ShortlistItem } from "@/lib/shortlist";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const NUDGE_AFTER_MS = 25_000;
const time = (t: number) => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

type Msg = { key: string; at: number; group?: number; seq?: number; from: "scout" | "agent" | "you"; agent?: Listing; body: React.ReactNode; actions?: React.ReactNode; tone?: "good" | "warn" | "bad" };

function Bubble({ m }: { m: Msg }) {
  const you = m.from === "you";
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 12, x: you ? 16 : -16 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className={cn("flex gap-2.5", you && "flex-row-reverse")}
    >
      {m.from === "scout" && <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-[var(--brand)] text-white shadow"><Sparkles className="size-4" /></span>}
      {m.from === "agent" && m.agent && <AgentAvatar name={m.agent.agent} image={m.agent.agentImage} size={32} />}
      <div className={cn("min-w-0 max-w-[88%] space-y-2", you && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed",
            you ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm border bg-card shadow-xs",
            m.tone === "good" && "border-emerald-200 bg-emerald-50/70",
            m.tone === "warn" && "border-amber-200 bg-amber-50/70",
            m.tone === "bad" && "border-red-200 bg-red-50/60",
          )}
        >
          {m.from === "agent" && m.agent && <div className="mb-1 text-[12px] font-medium text-muted-foreground">{m.agent.agent} · {m.agent.broker}</div>}
          {m.body}
        </div>
        {m.actions && <div className="flex flex-wrap gap-2">{m.actions}</div>}
        <div className={cn("text-[11px] text-muted-foreground", you && "text-right")}>{time(m.at)}</div>
      </div>
    </motion.div>
  );
}

function Typing({ label }: { label: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5 pl-10 text-[12px] text-muted-foreground">
      <span className="flex items-center gap-1 rounded-2xl bg-muted px-3 py-2">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className="size-1.5 rounded-full bg-muted-foreground" animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} />
        ))}
      </span>
      {label}
    </motion.div>
  );
}

const CHECKLIST = [
  "Ask if it is chiller-free, and the cooling deposit if not",
  "Check the parking slot number and the access card",
  "Run the AC and taps: cooling, water pressure, hot water",
  "Ask about the building's move-in permit and fee",
  "Bring your Emirates ID or passport and visa copy",
];

/** Scout's side of the conversation: proactive updates and follow-ups as agents answer. Agent replies are simulated. */
export function ScoutThread({ brief, onEdit }: { brief: Brief; onEdit: () => void }) {
  const { items, update } = useShortlist();
  const m = useMemo(() => matchBrief(brief), [brief]);
  const [now, setNow] = useState(() => Date.now());
  const [start] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 2_000);
    return () => clearInterval(t);
  }, []);

  const active = items.filter((i) => !i.dropped);
  const asked = new Set(items.map((i) => i.id));
  const nextBest = m.top.concat(m.more).find((x) => !asked.has(x.listing.id));
  const msgs: Msg[] = [];

  msgs.push({
    key: "intro",
    at: items.length ? Math.min(...items.map((i) => i.requestedAt)) - 60_000 : start,
    from: "scout",
    body: (
      <div className="space-y-2">
        <p>
          I read your brief: <b>{brief.purpose === "rent" ? "to rent" : "to buy"}</b>, {bedsLabel(brief.beds).toLowerCase()}, {budgetLabel(brief).toLowerCase()}, moving {moveInLabel(brief.moveIn).toLowerCase()}.
          Of <b>{m.counts.flats}</b> real flats in Princess Tower, <b>{m.counts.fit}</b> fit and <b>{m.counts.trusted}</b> look genuine. I would start with these {Math.min(5, m.top.length)}.
        </p>
        <ol className="space-y-1">
          {m.top.map((x, i) => (
            <li key={x.listing.id}>
              <Link href={`/listing/${x.listing.id}`} className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 text-[13px] transition-colors hover:bg-accent/60">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{priceLine(x.listing)} · {x.listing.size.toLocaleString()} sq ft</span>
                <StatusPill status={x.listing.status} />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    ),
    actions: items.length ? undefined : (
      <>
        <div className="w-full sm:w-auto sm:min-w-64"><AskAgents items={m.top.map((x) => ({ id: x.listing.id, toAsk: x.toAsk }))} /></div>
        <Button variant="outline" size="lg" onClick={onEdit}><Pencil /> Change my brief</Button>
      </>
    ),
  });

  if (items.length) {
    const first = Math.min(...items.map((i) => i.requestedAt));
    msgs.push({ key: "you-sent", at: first, from: "you", body: <>Ask {items.length === 1 ? "this agent" : `these ${items.length} agents`} for me.</> });
    msgs.push({
      key: "sent",
      at: first + 1_000,
      from: "scout",
      body: <>Sent to {items.length} {items.length === 1 ? "agent" : "agents"} with only the questions for their flat{items[0]?.contact ? `, signed as ${items[0].contact.name}` : ""}. Most agents answer within the hour. I will tell you as answers come in, and nudge anyone who goes quiet.</>,
    });
  }

  for (const it of [...items].sort((a, b) => (a.reply?.at ?? a.requestedAt) - (b.reply?.at ?? b.requestedAt))) {
    const l = getListing(it.id);
    if (!l) continue;
    if (!it.reply) {
      if (it.nudgedAt) msgs.push({ key: `nudged-${it.id}`, at: it.nudgedAt, from: "scout", body: <>I nudged {l.agent} again. If there is still no answer in a day, I will drop this flat and ask about the next best one.</> });
      else if (now - it.requestedAt > NUDGE_AFTER_MS && !it.dropped) {
        msgs.push({
          key: `nudge-${it.id}`,
          at: it.requestedAt + NUDGE_AFTER_MS,
          from: "scout",
          tone: "warn",
          body: <>{l.agent} has not answered about the {priceLine(l)} flat yet. Want me to nudge, or skip it?</>,
          actions: (
            <>
              <Button size="sm" onClick={() => update(it.id, { nudgedAt: Date.now() })}><BellRing /> Nudge</Button>
              <Button size="sm" variant="outline" onClick={() => update(it.id, { dropped: true })}><X /> Skip it</Button>
            </>
          ),
        });
      }
      continue;
    }
    pushReplyThread(msgs, it, l, update, nextBest?.listing);
  }

  const waiting = active.filter((i) => !i.reply).length;
  const ordered = msgs
    .map((x, i) => ({ ...x, group: x.group ?? x.at, seq: x.seq ?? i }))
    .sort((a, b) => a.group - b.group || a.seq - b.seq);

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2"><span className="font-display text-[24px] leading-none">Scout</span><Badge variant="secondary" className="font-normal">your assistant</Badge></div>
        <span className="text-[11px] text-muted-foreground">Agent replies are simulated</span>
      </div>
      <CardContent className="space-y-4 p-4">
        <AnimatePresence initial={false}>
          {ordered.map((msg) => <Bubble key={msg.key} m={msg} />)}
          {waiting > 0 && <Typing key="typing" label={`Waiting for ${waiting} ${waiting === 1 ? "agent" : "agents"}…`} />}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function pushReplyThread(all: Msg[], it: ShortlistItem, l: Listing, update: (id: string, p: Partial<ShortlistItem>) => void, nextBest?: Listing) {
  const r = it.reply!;
  // Everything about one flat stays together, in the order it happened.
  let seq = 0;
  const msgs = { push: (m: Msg) => all.push({ ...m, group: r.at, seq: seq++ }) };
  const tone = r.outcome === "confirmed" ? "good" : r.outcome === "changed" ? "warn" : "bad";
  msgs.push({
    key: `reply-${it.id}`,
    at: r.at,
    from: "agent",
    agent: l,
    tone,
    body: (
      <ul className="space-y-0.5">
        {r.lines.filter((x) => !x.startsWith("Viewing:")).map((x) => <li key={x}>{x}</li>)}
      </ul>
    ),
  });

  if (r.outcome === "unavailable") {
    msgs.push({
      key: `gone-${it.id}`,
      at: r.at + 1_000,
      from: "scout",
      body: <>That one is gone, so I took it off your list. {nextBest ? <>The next best match is <b>{priceLine(nextBest)}</b>, {nextBest.size.toLocaleString()} sq ft.</> : null}</>,
      actions: nextBest ? <div className="w-full sm:w-auto sm:min-w-64"><AskAgents items={[{ id: nextBest.id, toAsk: [] }]} label="Ask about the next best" /></div> : undefined,
    });
    return;
  }

  const flat = `the ${priceLine(l)} flat (${l.size.toLocaleString()} sq ft)`;
  const summary = r.outcome === "confirmed" ? `Good news on ${flat}: available on the terms in the ad.` : `${l.agent} answered about ${flat}, but something changed. Check the details before you go.`;
  const slots = r.slots ?? [];
  msgs.push({
    key: `next-${it.id}`,
    at: r.at + 1_000,
    from: "scout",
    body: <>{summary} {slots.length && !it.viewing && !it.dropped ? "Want me to book a viewing?" : ""}</>,
    actions:
      !it.viewing && !it.dropped ? (
        <>
          {slots.map((s) => (
            <Button key={s} size="sm" onClick={() => update(it.id, { viewing: { slot: s, status: "requested", at: Date.now() } })}><CalendarCheck /> {s}</Button>
          ))}
          <Button size="sm" variant="outline" onClick={() => update(it.id, { dropped: true })}><X /> Not for me</Button>
        </>
      ) : undefined,
  });
  if (it.dropped) {
    msgs.push({ key: `dropped-${it.id}`, at: r.at + 2_000, from: "you", body: <>Not for me.</> });
    return;
  }
  if (!it.viewing) return;

  msgs.push({ key: `book-${it.id}`, at: it.viewing.at, from: "you", body: <>Book {it.viewing.slot}.</> });
  if (it.viewing.status === "requested") {
    msgs.push({ key: `booking-${it.id}`, at: it.viewing.at + 500, from: "scout", body: <>Asking {l.agent} to confirm {it.viewing.slot}…</> });
    return;
  }
  msgs.push({
    key: `booked-${it.id}`,
    at: it.viewing.at + 4_000,
    from: "scout",
    tone: "good",
    body: (
      <div className="space-y-2">
        <p><b>Viewing confirmed:</b> {it.viewing.slot} with {l.agent}, Princess Tower lobby. I will remind you 2 hours before.</p>
        <div className="rounded-lg border bg-background p-2.5">
          <div className="mb-1 flex items-center gap-1.5 text-[13px] font-medium"><ClipboardList className="size-4" /> At the viewing</div>
          <ul className="space-y-0.5 text-[13px] text-muted-foreground">{CHECKLIST.map((c) => <li key={c} className="flex gap-1.5"><Check className="mt-0.5 size-3.5 shrink-0 text-primary" /> {c}</li>)}</ul>
        </div>
      </div>
    ),
    actions: !it.viewedAt ? <Button size="sm" variant="outline" onClick={() => update(it.id, { viewedAt: Date.now() })}>I have seen it (demo: skip ahead)</Button> : undefined,
  });
  if (!it.viewedAt) return;

  msgs.push({
    key: `ask-feedback-${it.id}`,
    at: it.viewedAt,
    from: "scout",
    body: <>How was it? Was the flat as the ad and {l.agent} said?</>,
    actions: !it.feedback ? (
      <>
        <Button size="sm" onClick={() => update(it.id, { feedback: "as-described" })}><ThumbsUp /> Yes, as described</Button>
        <Button size="sm" variant="outline" onClick={() => update(it.id, { feedback: "different" })}><ThumbsDown /> Something was different</Button>
      </>
    ) : undefined,
  });
  if (!it.feedback) return;
  msgs.push({ key: `fb-${it.id}`, at: it.viewedAt + 1_000, from: "you", body: <>{it.feedback === "as-described" ? "Yes, as described." : "Something was different."}</> });

  const n = negotiation(l);
  const offerAmount = n && n.tone === "high" ? n.offer : l.price;
  const cheques = l.kind === "rent" ? 2 : 0;
  msgs.push({
    key: `fb-thanks-${it.id}`,
    at: it.viewedAt + 2_000,
    from: "scout",
    tone: it.feedback === "different" ? "warn" : undefined,
    body: (
      <div className="space-y-1.5">
        <p>{it.feedback === "as-described" ? `Thanks. That counts toward ${l.agent}'s reliability score, so honest agents rank higher.` : `Noted. That counts against the ad's accuracy, and I will flag it for Property Finder's quality team.`}</p>
        {it.feedback === "as-described" && (
          <p>
            <HandCoins className="mr-1 inline size-4 align-[-2px] text-primary" />
            {n?.tone === "high" ? n.why : n?.tone === "low" ? "It is already below registered deals for this size, so I would not push the price." : "The price is in line with registered deals for this size."}{" "}
            Shall I make an offer of <b>AED {offerAmount.toLocaleString("en-US")}</b>{cheques ? ` with ${cheques} cheques` : ""}?
          </p>
        )}
      </div>
    ),
    actions: it.feedback === "as-described" && !it.offer ? <Button size="sm" onClick={() => update(it.id, { offer: { amount: offerAmount, cheques, at: Date.now(), status: "sent" } })}><HandCoins /> Send offer</Button> : undefined,
  });
  if (!it.offer) return;

  msgs.push({ key: `offer-${it.id}`, at: it.offer.at, from: "you", body: <>Offer AED {it.offer.amount.toLocaleString("en-US")}{it.offer.cheques ? `, ${it.offer.cheques} cheques` : ""}.</> });
  if (it.offer.status === "sent") return;
  msgs.push({
    key: `offer-reply-${it.id}`,
    at: it.offer.answeredAt ?? it.offer.at + 5_000,
    from: "agent",
    agent: l,
    tone: it.offer.status === "accepted" ? "good" : "warn",
    body: it.offer.status === "accepted" ? <>The owner accepts AED {it.offer.amount.toLocaleString("en-US")}. I will send the tenancy contract for Ejari.</> : <>The owner can do AED {it.offer.counter?.toLocaleString("en-US")}. Shall I go ahead?</>,
  });
  msgs.push({
    key: `close-${it.id}`,
    at: (it.offer.answeredAt ?? it.offer.at) + 1_000,
    from: "scout",
    body: (
      <div className="space-y-1.5">
        <p>{it.offer.status === "accepted" ? "Done. From here the deal is between you and the agent: contract, Ejari, deposit and DEWA." : "Your call. AED " + (it.offer.counter ?? 0).toLocaleString("en-US") + " is still " + (l.registeredMedian && (it.offer.counter ?? 0) <= l.registeredMedian * 1.05 ? "in line with" : "above") + " registered deals for this size."}</p>
        <Link href={`/listing/${l.id}`} className="text-primary underline underline-offset-4">See what you pay to move in</Link>
      </div>
    ),
  });
}
