"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { AnimatePresence, motion } from "motion/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, CalendarCheck, Loader2, ShieldAlert, ShieldCheck, ShieldX, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AskAgents } from "@/components/ask-agents";
import { StatusPill } from "@/components/status-pill";
import { bedsLabel, budgetLabel, extraTags, moveInLabel, type Brief } from "@/lib/brief";
import { saveBrief } from "@/lib/brief-store";
import { getListing, priceLine, type Severity } from "@/lib/data";
import { cn } from "@/lib/utils";

const SUGGESTIONS = ["Only furnished flats", "Raise my budget by 10%", "Why is the first one ranked top?", "Ask the top 3 agents"];
const SEV: Record<Severity, typeof ShieldCheck> = { ok: ShieldCheck, ask: ShieldAlert, hide: ShieldX };

type TopItem = { id: string; status: Severity; fits: string[]; toAsk: string[] };

function ShortlistMini({ top }: { top: TopItem[] }) {
  return (
    <div className="space-y-1.5">
      {top.map((t, i) => {
        const l = getListing(t.id);
        if (!l) return null;
        return (
          <Link key={t.id} href={`/listing/${t.id}`} className="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[13px] transition-colors hover:bg-accent/60">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate">{priceLine(l)} · {l.beds}-bed · {l.size.toLocaleString()} sq ft</span>
            <StatusPill status={l.status} />
          </Link>
        );
      })}
    </div>
  );
}

/** Generative UI: the model picks a tool; each tool result renders as one of our components, filled from real data. */
function ToolCard({ part }: { part: { type: string; state?: string; toolCallId?: string; output?: unknown } }) {
  const applied = useRef(false);
  const out = part.output as Record<string, unknown> | undefined;
  useEffect(() => {
    if (part.type === "tool-updateBrief" && part.state === "output-available" && out?.brief && !applied.current) {
      applied.current = true;
      saveBrief(out.brief as Brief);
    }
  }, [part.type, part.state, out]);

  if (part.state !== "output-available" || !out) {
    return <div className="flex items-center gap-2 text-[13px] text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Scout is checking…</div>;
  }
  if (part.type === "tool-updateBrief") {
    const b = out.brief as Brief;
    const counts = out.counts as { fit: number; trusted: number };
    return (
      <Card className="gap-2 py-3"><CardContent className="space-y-2 px-3">
        <div className="text-[13px] font-medium">Brief updated · {counts.fit} flats fit, {counts.trusted} look genuine</div>
        <div className="flex flex-wrap gap-1">
          {[b.purpose === "rent" ? "Rent" : "Buy", budgetLabel(b), bedsLabel(b.beds), b.furnished === "any" ? "Any furnishing" : b.furnished === "yes" ? "Furnished" : "Unfurnished", `Move in: ${moveInLabel(b.moveIn)}`, ...extraTags(b), ...b.mustHaves.map((m) => m[0].toUpperCase() + m.slice(1))].map((t) => (
            <Badge key={t} variant="secondary" className="max-w-full font-normal whitespace-normal">{t}</Badge>
          ))}
        </div>
        <ShortlistMini top={(out.top as TopItem[]).slice(0, 5)} />
      </CardContent></Card>
    );
  }
  if (part.type === "tool-showShortlist") return <ShortlistMini top={(out.top as TopItem[]).slice(0, 5)} />;
  if (part.type === "tool-explainListing") {
    if (out.error) return null;
    const checks = out.checks as { severity: Severity; label: string; detail: string }[];
    return (
      <Card className="gap-2 py-3"><CardContent className="space-y-2 px-3">
        {checks.map((c) => {
          const Icon = SEV[c.severity];
          return (
            <div key={c.label} className="flex gap-2 text-[13px]">
              <Icon className={cn("mt-0.5 size-4 shrink-0", c.severity === "ok" ? "text-emerald-600" : c.severity === "ask" ? "text-amber-600" : "text-red-600")} />
              <div><div className="font-medium">{c.label}</div><div className="text-muted-foreground">{c.detail}</div></div>
            </div>
          );
        })}
      </CardContent></Card>
    );
  }
  if (part.type === "tool-askAgents") {
    const ids = out.listingIds as string[];
    return <AskAgents items={ids.map((id) => ({ id, toAsk: [] }))} label={`Review and ask ${ids.length} ${ids.length === 1 ? "agent" : "agents"}`} />;
  }
  if (part.type === "tool-bookViewing") {
    return (
      <Button asChild variant="outline" className="w-full"><Link href="/shortlist"><CalendarCheck /> Pick a viewing time in your shortlist</Link></Button>
    );
  }
  return null;
}

export function ScoutChat({ brief, enabled }: { brief: Brief; enabled: boolean }) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({ transport: new DefaultChatTransport({ api: "/api/assistant" }) });
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // scrollIntoView returns a Promise in newer browsers; never hand it to React as a cleanup.
    void end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);
  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text }, { body: { brief } });
    setInput("");
  };

  if (!enabled) {
    return (
      <Card className="gap-1 py-4"><CardContent className="px-4 text-[13px] text-muted-foreground">
        Chat with Scout is switched off in this copy. Edit your brief above and the shortlist updates straight away.
      </CardContent></Card>
    );
  }

  return (
    <Card className="gap-3 py-4">
      <CardContent className="space-y-3 px-4">
        <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /><span className="font-display text-[24px] leading-none">Ask Scout</span></div>
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <motion.button key={s} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => send(s)} className="rounded-full border border-primary/25 px-3 py-1.5 text-[13px] text-primary transition-colors hover:bg-accent">{s}</motion.button>
            ))}
          </div>
        )}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              layout="position"
              initial={{ opacity: 0, y: 10, x: m.role === "user" ? 12 : -12 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn("space-y-2", m.role === "user" && "flex justify-end")}
            >
              {m.parts.map((p, i) => {
                if (p.type === "text") {
                  return (
                    <p key={i} className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-[14px] whitespace-pre-line", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>{p.text}</p>
                  );
                }
                if (p.type.startsWith("tool-")) return <ToolCard key={i} part={p as never} />;
                return null;
              })}
            </motion.div>
          ))}
          </AnimatePresence>
          {status === "submitted" && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex w-fit items-center gap-1 rounded-2xl bg-muted px-3 py-2.5" aria-label="Scout is thinking">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="size-1.5 rounded-full bg-muted-foreground" animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} />
              ))}
            </motion.div>
          )}
          {error && <p className="text-[13px] text-red-600">Scout could not answer just now. Try again, or edit your brief above.</p>}
          <div ref={end} />
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input id="scout-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. only high floors, budget 140k" disabled={busy} />
          <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send"><ArrowUp /></Button>
        </form>
      </CardContent>
    </Card>
  );
}
