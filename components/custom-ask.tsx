"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, Quote, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addExtraQuestion } from "@/lib/extra-questions";
import type { Draft } from "@/lib/custom-questions";
import type { Listing } from "@/lib/data";
import { cn } from "@/lib/utils";

const MAX = 600;

/** Ask in your own words, several at once. Scout rewrites them for the agent, answers what the ad already says, and you choose what to send. */
export function CustomAsk({ listing }: { listing: Listing }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<(Draft & { on: boolean })[] | null>(null);
  const first = listing.agent?.split(" ")[0] ?? "the agent";

  const prepare = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const r = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: listing.id, text }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setDrafts((j.items as Draft[]).map((d) => ({ ...d, on: !d.adQuote })));
    } catch {
      toast.error("Could not read that just now. Try again.");
    } finally {
      setBusy(false);
    }
  };
  const chosen = drafts?.filter((d) => d.on) ?? [];
  const add = () => {
    chosen.forEach((d) => addExtraQuestion(listing.id, d.question));
    toast.success(`${chosen.length} ${chosen.length === 1 ? "question" : "questions"} added for ${first}`, { description: "Nothing is sent until you tap Confirm before I call." });
    setDrafts(null);
    setText("");
  };

  return (
    <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
      <div className="text-[13px] font-medium">Ask your own questions</div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX))}
        placeholder="e.g. can i pay monthly? is the parking covered and is there a gym"
        className="min-h-16 bg-background text-[14px]"
        aria-label="Your questions for the agent"
      />
      <Button size="sm" className="w-full" onClick={prepare} disabled={busy || !text.trim()}>
        {busy ? <><Loader2 className="animate-spin" /> Scout is reading…</> : <><Sparkles /> Turn into questions for {first}</>}
      </Button>

      <AnimatePresence>
        {drafts && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2 pt-1">
            <p className="text-[12px] text-muted-foreground">Check before anything goes to {first}. Untick what you do not want to ask.</p>
            <ul className="space-y-1.5">
              {drafts.map((d, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setDrafts(drafts.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))}
                    className={cn("flex w-full items-start gap-2 rounded-lg border bg-background p-2 text-left text-[13px] transition-colors", d.on ? "border-primary/40" : "opacity-70")}
                    aria-pressed={d.on}
                  >
                    <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded border", d.on ? "border-primary bg-primary text-white" : "border-muted-foreground/40")}>{d.on && <Check className="size-3" />}</span>
                    <span className="min-w-0 flex-1">
                      {d.question}
                      {d.adQuote && (
                        <span className="mt-1 flex gap-1 text-[12px] text-emerald-700"><Quote className="mt-0.5 size-3 shrink-0" /> The ad already says: <i>{d.adQuote}</i></span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setDrafts(null)}>Edit</Button>
              <Button size="sm" className="flex-1" disabled={!chosen.length} onClick={add}><Send /> Add {chosen.length} for {first}</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
