import type { Listing } from "@/lib/data";
import type { ShortlistItem } from "@/lib/shortlist";

/**
 * What Scout knows about one flat, and how it knows it. An agent's answer is not proof,
 * so each fact keeps its source: the agent said so, data or a viewing showed it, nobody has checked, or two sources disagree.
 */
export type FactStatus = "agent" | "verified" | "unverified" | "conflict";
export interface Fact { label: string; value: string; status: FactStatus; source: string }

export const FACT_STATUS: Record<FactStatus, { label: string; tone: string }> = {
  verified: { label: "Checked", tone: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  agent: { label: "Agent confirmed", tone: "bg-sky-50 text-sky-800 border-sky-200" },
  unverified: { label: "Not verified", tone: "bg-muted text-muted-foreground border-border" },
  conflict: { label: "Conflicting", tone: "bg-red-50 text-red-800 border-red-200" },
};

const aed = (n: number) => `AED ${n.toLocaleString("en-US")}`;
const time = (t: number) => new Date(t).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function factsFor(l: Listing, it?: ShortlistItem): Fact[] {
  const r = it?.reply;
  const codes = new Set(l.checks.map((c) => c.code));
  const said = r ? `${l.agent}, ${time(r.at)}` : "";
  const facts: Fact[] = [];

  // Availability
  if (!r) facts.push({ label: "Available", value: "Not asked yet", status: "unverified", source: it ? `Waiting for ${l.agent}` : "Ask the agent" });
  else if (r.outcome === "unavailable") facts.push({ label: "Available", value: `No, already ${l.kind === "rent" ? "let" : "sold"}`, status: "conflict", source: `The ad is still live; ${said}` });
  else if (r.lines.some((x) => /tenant leaves/i.test(x))) facts.push({ label: "Available", value: "After the tenant leaves", status: "conflict", source: `The ad does not say it is tenanted; ${said}` });
  else facts.push({ label: "Available", value: "Yes", status: "agent", source: said });

  // Price: what the agent said, and how it compares to registered deals
  const quoted = r?.lines.map((x) => /AED ([\d,]+)/.exec(x)?.[1]).find(Boolean);
  const quotedN = quoted ? Number(quoted.replace(/,/g, "")) : undefined;
  if (r?.outcome !== "unavailable") {
    if (quotedN && quotedN !== l.price) facts.push({ label: "Price", value: `${aed(quotedN)}, not ${aed(l.price)}`, status: "conflict", source: `The ad says ${aed(l.price)}; ${said}` });
    else if (r) facts.push({ label: "Price", value: aed(l.price), status: "agent", source: said });
    else facts.push({ label: "Price", value: aed(l.price), status: "unverified", source: "As advertised" });
  }
  if (l.registeredMedian) {
    const pct = l.vsRegistered ?? 0;
    facts.push({
      label: "Price vs registered deals",
      value: pct === 0 ? "In line" : `${Math.abs(pct)}% ${pct > 0 ? "above" : "below"}`,
      status: "verified",
      source: `${l.registered.length} registered ${l.kind === "rent" ? "rents" : "sales"} for this size (DataGuru)`,
    });
  }

  // Terms
  const terms = r?.lines.find((x) => /cheque|service charge/i.test(x));
  if (l.kind === "rent" || r) facts.push({ label: l.kind === "rent" ? "Cheques and deposit" : "Service charges", value: terms ?? "Not asked yet", status: terms ? "agent" : "unverified", source: terms ? said : "The ad does not say" });

  // Photos: only a viewing proves them
  if (it?.feedback === "as-described") facts.push({ label: "Photos match the flat", value: "Yes", status: "verified", source: `You saw it${it.viewedAt ? `, ${time(it.viewedAt)}` : ""}` });
  else if (it?.feedback === "different") facts.push({ label: "Photos match the flat", value: "No", status: "conflict", source: "You said something was different" });
  else if (codes.has("photos_other_unit")) facts.push({ label: "Photos match the flat", value: "Photos match another flat", status: "conflict", source: "TrueUnit photo check" });
  else facts.push({ label: "Photos match the flat", value: "Until you see it", status: "unverified", source: "Only a viewing proves this" });

  if (l.kind === "rent") facts.push({ label: "Chiller-free", value: "Ask at the viewing", status: "unverified", source: "None of the 144 rental ads say" });
  return facts;
}

export function factCounts(facts: Fact[]) {
  return facts.reduce((acc, f) => ({ ...acc, [f.status]: (acc[f.status] ?? 0) + 1 }), {} as Partial<Record<FactStatus, number>>);
}
