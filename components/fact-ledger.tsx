"use client";

import { AlertTriangle, CircleDashed, MessageSquareText, ShieldCheck } from "lucide-react";
import { FACT_STATUS, factCounts, factsFor, type FactStatus } from "@/lib/facts";
import type { Listing } from "@/lib/data";
import type { ShortlistItem } from "@/lib/shortlist";
import { cn } from "@/lib/utils";

const ICON: Record<FactStatus, typeof ShieldCheck> = { verified: ShieldCheck, agent: MessageSquareText, unverified: CircleDashed, conflict: AlertTriangle };
const ORDER: FactStatus[] = ["conflict", "agent", "verified", "unverified"];

/** Each fact with how Scout knows it. Agent answers are labelled as the agent's word, not proof. */
export function FactLedger({ listing, item, compact = false }: { listing: Listing; item?: ShortlistItem; compact?: boolean }) {
  const facts = factsFor(listing, item);
  const counts = factCounts(facts);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {ORDER.filter((s) => counts[s]).map((s) => {
          const I = ICON[s];
          return (
            <span key={s} className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", FACT_STATUS[s].tone)}>
              <I className="size-3" /> {counts[s]} {FACT_STATUS[s].label.toLowerCase()}
            </span>
          );
        })}
      </div>
      {!compact && (
        <ul className="divide-y rounded-lg border bg-background text-[12px]">
          {facts.map((f) => {
            const I = ICON[f.status];
            return (
              <li key={f.label} className="flex items-start gap-2 px-2.5 py-1.5">
                <I className={cn("mt-0.5 size-3.5 shrink-0", f.status === "verified" ? "text-emerald-600" : f.status === "agent" ? "text-sky-600" : f.status === "conflict" ? "text-red-600" : "text-muted-foreground")} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap justify-between gap-x-2">
                    <span className="font-medium">{f.label}</span>
                    <span className={cn(f.status === "conflict" && "text-red-700")}>{f.value}</span>
                  </div>
                  <div className="text-muted-foreground">{FACT_STATUS[f.status].label} · {f.source}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
