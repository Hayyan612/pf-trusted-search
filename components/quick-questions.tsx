"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FINANCING_LABEL, HOUSEHOLD_LABEL, USE_LABEL, missingEssentials, moveInLabel, type Brief } from "@/lib/brief";
import { NEARBY_KEYS, NEARBY_KINDS, type NearbyKind } from "@/lib/nearby";
import { WORKPLACES, WORKPLACE_IDS, type WorkplaceId } from "@/lib/workplaces";
import { cn } from "@/lib/utils";

const RENT_BUDGETS = [80_000, 100_000, 130_000, 160_000, 200_000, 300_000];
const BUY_BUDGETS = [1_500_000, 2_000_000, 2_500_000, 3_000_000, 4_000_000, 6_000_000];
const MOVES = ["asap", "2026-12", "2027-01", "2027-02", "2027-03", "flexible"];
const fmt = (n: number) => (n >= 1e6 ? `AED ${(n / 1e6).toFixed(n % 1e6 ? 1 : 0)}M` : `AED ${n / 1000}k`);

function Chips<T extends string | number>({ options, value, onPick, label }: { options: T[]; value: T | null; onPick: (v: T) => void; label: (v: T) => string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o)}
          type="button"
          onClick={() => onPick(o)}
          className={cn("rounded-full border px-3.5 py-1.5 text-[14px] transition-[background-color,border-color,color,transform] duration-200 active:scale-95", value === o ? "border-primary bg-primary text-primary-foreground shadow-sm" : "hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent")}
        >
          {label(o)}
        </button>
      ))}
    </div>
  );
}

/** Only the essentials the person's words left out, one tap each. */
export function QuickQuestions({ draft, onDone }: { draft: Brief; onDone: (b: Brief) => void }) {
  const [b, setB] = useState(draft);
  const asks = missingEssentials(draft);
  const rent = b.purpose === "rent";
  const answered = asks.filter((k) => !missingEssentials(b).includes(k)).length;

  return (
    <Card className="mx-auto max-w-xl motion-safe:animate-in motion-safe:fade-in">
      <CardHeader>
        <CardTitle className="font-display text-[28px] font-normal">A few quick questions</CardTitle>
        <CardDescription>So Scout only shows flats that work for you. Skip any you are not sure about.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {asks.includes("budget") && (
          <div className="space-y-2">
            <div className="text-[14px] font-medium">What is your budget{rent ? " a year" : ""}?</div>
            <Chips options={rent ? RENT_BUDGETS : BUY_BUDGETS} value={b.budgetMax} onPick={(v) => setB({ ...b, budgetMax: v })} label={(v) => `Up to ${fmt(v)}`} />
          </div>
        )}
        {asks.includes("beds") && (
          <div className="space-y-2">
            <div className="text-[14px] font-medium">How many bedrooms?</div>
            <Chips options={[1, 2, 3, 4]} value={b.beds.length === 1 ? b.beds[0] : null} onPick={(v) => setB({ ...b, beds: [v] })} label={(v) => `${v} bed`} />
          </div>
        )}
        {asks.includes("moveIn") && (
          <div className="space-y-2">
            <div className="text-[14px] font-medium">{rent ? "When do you want to move in?" : "When do you want to take the keys?"}</div>
            <Chips options={MOVES} value={b.moveIn} onPick={(v) => setB({ ...b, moveIn: v })} label={moveInLabel} />
          </div>
        )}
        {asks.includes("household") && (
          <div className="space-y-2">
            <div className="text-[14px] font-medium">Who is moving in?</div>
            <Chips options={Object.keys(HOUSEHOLD_LABEL) as (keyof typeof HOUSEHOLD_LABEL)[]} value={b.household} onPick={(v) => setB({ ...b, household: v })} label={(v) => HOUSEHOLD_LABEL[v]} />
            {b.household === "sharing" && <p className="text-[12px] text-muted-foreground">Many Dubai landlords do not allow sharing, so Scout will ask each agent.</p>}
          </div>
        )}
        {asks.includes("use") && (
          <div className="space-y-2">
            <div className="text-[14px] font-medium">Are you buying to live in it or to rent it out?</div>
            <Chips options={Object.keys(USE_LABEL) as (keyof typeof USE_LABEL)[]} value={b.use} onPick={(v) => setB({ ...b, use: v })} label={(v) => USE_LABEL[v]} />
            {b.use === "invest" && <p className="text-[12px] text-muted-foreground">Then a tenanted flat is a plus: rent from day one. Scout will ask for the current rent and lease end.</p>}
          </div>
        )}
        {asks.includes("financing") && (
          <div className="space-y-2">
            <div className="text-[14px] font-medium">Cash or mortgage?</div>
            <Chips options={Object.keys(FINANCING_LABEL) as (keyof typeof FINANCING_LABEL)[]} value={b.financing} onPick={(v) => setB({ ...b, financing: v })} label={(v) => FINANCING_LABEL[v]} />
          </div>
        )}
        {asks.includes("priorities") && (
          <div className="space-y-3 rounded-xl border bg-muted/30 p-3">
            <div className="space-y-2">
              <div className="text-[14px] font-medium">Where will you work?</div>
              <Chips options={[...WORKPLACE_IDS, "none"] as (WorkplaceId | "none")[]} value={b.workplace ?? null} onPick={(v) => setB({ ...b, workplace: v === "none" ? null : v })} label={(v) => (v === "none" ? "Remote / not sure" : WORKPLACES[v].label)} />
            </div>
            {b.workplace && (
              <div className="space-y-2">
                <div className="text-[14px] font-medium">Longest commute you would accept, each way?</div>
                <Chips options={[15, 20, 30, 45]} value={b.maxCommuteMin} onPick={(v) => setB({ ...b, maxCommuteMin: v })} label={(v) => `${v} min`} />
              </div>
            )}
            <div className="space-y-2">
              <div className="text-[14px] font-medium">What do you want close by? <span className="font-normal text-muted-foreground">(pick any)</span></div>
              <div className="flex flex-wrap gap-2">
                {NEARBY_KEYS.map((k) => {
                  const on = b.nearby.includes(k);
                  return (
                    <button key={k} type="button" onClick={() => setB({ ...b, nearby: on ? b.nearby.filter((x) => x !== k) : [...b.nearby, k as NearbyKind] })}
                      className={cn("rounded-full border px-3.5 py-1.5 text-[14px] transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50 hover:bg-accent")}>
                      {NEARBY_KINDS[k].label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {asks.includes("newToDubai") && (
          <div className="space-y-2">
            <div className="text-[14px] font-medium">Is this your first home in Dubai?</div>
            <Chips options={["yes", "no"]} value={b.newToDubai == null ? null : b.newToDubai ? "yes" : "no"} onPick={(v) => setB({ ...b, newToDubai: v === "yes" })} label={(v) => (v === "yes" ? "Yes, explain things" : "No, I know how it works")} />
            {b.newToDubai && <p className="text-[12px] text-muted-foreground">Scout will explain Ejari, DEWA, cheques and chiller charges, and show what you pay to move in.</p>}
          </div>
        )}
        <div className="flex gap-2">
          <Button size="lg" className="flex-1" onClick={() => onDone(b)}>{answered ? "Continue" : "Skip for now"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
