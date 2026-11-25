"use client";

import { useState } from "react";
import { ChevronDown, Globe, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EXPAT_SOURCES, GLOSSARY, upfrontCost } from "@/lib/expat";
import { cn } from "@/lib/utils";

const aed = (n: number) => `AED ${n.toLocaleString("en-US")}`;
const range = (lo: number, hi: number) => (lo === hi ? aed(lo) : `${aed(lo)} to ${hi.toLocaleString("en-US")}`);
const ON = "data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground";

/** Dubai renting terms in plain English. */
export function Glossary({ only, defaultOpen = false }: { only?: string[]; defaultOpen?: boolean }) {
  const terms = only ? GLOSSARY.filter((t) => only.includes(t.key)) : GLOSSARY;
  return (
    <div className="divide-y rounded-xl border">
      {terms.map((t, i) => (
        <Collapsible key={t.key} defaultOpen={defaultOpen && i === 0}>
          <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-[14px] font-medium">
            {t.term}
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 px-3 pb-3 text-[13px]">
            <p>{t.plain}</p>
            <p className="text-muted-foreground">{t.tip}</p>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

/** Estimated move-in cash for a yearly rental, with the cheque trade-off. Shown on rental listings. */
export function UpfrontCosts({ rent, furnished }: { rent: number; furnished: string | null }) {
  const [cheques, setCheques] = useState(4);
  const c = upfrontCost(rent, cheques, furnished);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Wallet className="size-4 text-primary" /> Estimated cash to move in</CardTitle>
        <CardDescription>What a tenant usually pays at signing in Dubai, for this rent. Estimates from public renting guides; confirm with the agent and DEWA.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[13px] text-muted-foreground">Number of cheques</span>
          <ToggleGroup type="single" variant="outline" value={String(cheques)} onValueChange={(v) => v && setCheques(Number(v))} aria-label="Number of cheques">
            {[1, 2, 4, 12].map((n) => <ToggleGroupItem key={n} value={String(n)} aria-label={`${n} ${n === 1 ? "cheque" : "cheques"}`} className={`min-w-10 px-3 ${ON}`}>{n}</ToggleGroupItem>)}
          </ToggleGroup>
        </div>
        <ul className="divide-y rounded-xl border text-[14px]">
          {c.lines.map((l) => (
            <li key={l.label} className="flex items-start justify-between gap-3 px-3 py-2">
              <div className="min-w-0 break-words"><div>{l.label}</div><div className="text-[12px] text-muted-foreground">{l.note}</div></div>
              <div className="shrink-0 text-right font-medium tabular-nums">{range(l.low, l.high)}</div>
            </li>
          ))}
          <li className="flex items-center justify-between gap-3 bg-accent/60 px-3 py-2.5 font-semibold">
            <span>At signing</span><span className="tabular-nums">{range(c.low, c.high)}</span>
          </li>
        </ul>
        <div className="space-y-1 text-[13px]">
          <div className="font-medium">Then every month</div>
          {c.monthly.map((l) => (
            <div key={l.label} className="flex justify-between gap-3 text-muted-foreground"><span>{l.label}</span><span className="tabular-nums">{range(l.low, l.high)}</span></div>
          ))}
        </div>
        {cheques === 12 && <p className="rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-800">12 cheques are not always offered, and guides say landlords often charge more for them. Ask.</p>}
        {cheques === 1 && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">Paying in 1 cheque is often worth a 5-10% discount. Ask for it.</p>}
      </CardContent>
    </Card>
  );
}

/** The expat card shown in the assistant when "first home in Dubai" is on. */
export function ExpatGuide({ exampleRent, furnished }: { exampleRent?: number; furnished?: string | null }) {
  const [open, setOpen] = useState(true);
  return (
    <Card className="border-sky-200">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader>
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 text-left">
            <CardTitle className="flex items-center gap-2"><Globe className="size-4 text-sky-600" /> New to Dubai: renting, explained</CardTitle>
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </CollapsibleTrigger>
          <CardDescription>The words and costs every Dubai ad assumes you know. Tap any term.</CardDescription>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Glossary defaultOpen />
            {exampleRent ? (
              <div className="space-y-2">
                <div className="text-[13px] font-medium">For your #1 flat (AED {exampleRent.toLocaleString("en-US")} a year):</div>
                <UpfrontCosts rent={exampleRent} furnished={furnished ?? null} />
              </div>
            ) : null}
            <p className="text-[12px] text-muted-foreground">
              Sources:{" "}
              {EXPAT_SOURCES.map((s, i) => (
                <span key={s.url}>{i > 0 && " · "}<a href={s.url} target="_blank" rel="noreferrer" className="underline">{s.label}</a></span>
              ))}
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
