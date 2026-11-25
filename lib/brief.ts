import { z } from "zod";

/** What the person is looking for. Filled from their own words, then editable. */
export const MUST_HAVES = ["parking", "pets", "sea view", "high floor", "balcony", "maid's room"] as const;

export const BriefSchema = z.object({
  purpose: z.enum(["rent", "buy"]).describe("rent or buy"),
  budgetMax: z.number().int().positive().nullable().describe("Maximum price in AED. For rent: per year. Convert monthly to yearly (x12). null if not given."),
  beds: z.array(z.number().int().min(0).max(6)).describe("Acceptable bedroom counts. Studio = 0. Empty if any."),
  moveIn: z.string().nullable().describe("When they want to move in or take possession, as YYYY-MM, or 'asap', or null."),
  furnished: z.enum(["yes", "no", "any"]).describe("Furnishing preference"),
  mustHaves: z.array(z.enum(MUST_HAVES)).describe("Only things the person said they need"),
  maxCheques: z.number().int().min(1).max(12).nullable().describe("Renters: the most cheques they can pay with, e.g. 4. Larger number = more flexible. null if not said."),
  notes: z.string().max(200).nullable().describe("Anything else in their words that matters, short"),
});

export type Brief = z.infer<typeof BriefSchema>;

export const EMPTY_BRIEF: Brief = { purpose: "rent", budgetMax: null, beds: [], moveIn: null, furnished: "any", mustHaves: [], maxCheques: null, notes: null };

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Fallback when no LLM is configured or the call fails. Handles the common phrasings. */
export function parseBriefRules(text: string, today = new Date("2026-11-25")): Brief {
  const t = text.toLowerCase();
  const b: Brief = { ...EMPTY_BRIEF, beds: [], mustHaves: [] };
  if (/\b(buy|purchase|own|invest)/.test(t)) b.purpose = "buy";
  const beds = [...t.matchAll(/(\d)\s*(?:-|\s)?(?:bed|br|bedroom)/g)].map((m) => Number(m[1]));
  if (/studio/.test(t)) beds.push(0);
  b.beds = [...new Set(beds)];
  const money = t.match(/(?:under|below|max(?:imum)?|up to|budget(?: of)?|<)\s*(?:aed\s*)?([\d.,]+)\s*(k|m|million)?/) ?? t.match(/(?:aed\s*)([\d.,]+)\s*(k|m|million)?/);
  if (money) {
    let v = Number(money[1].replace(/,/g, ""));
    if (money[2] === "k") v *= 1_000;
    if (money[2] === "m" || money[2] === "million") v *= 1_000_000;
    if (/(per|a|\/)\s*month|monthly/.test(t) && b.purpose === "rent") v *= 12;
    b.budgetMax = Math.round(v);
  }
  if (/unfurnished/.test(t)) b.furnished = "no";
  else if (/furnished/.test(t)) b.furnished = "yes";
  if (/parking|car/.test(t)) b.mustHaves.push("parking");
  if (/pet|cat|dog/.test(t)) b.mustHaves.push("pets");
  if (/sea view|sea-view|water view/.test(t)) b.mustHaves.push("sea view");
  if (/high floor/.test(t)) b.mustHaves.push("high floor");
  if (/balcony/.test(t)) b.mustHaves.push("balcony");
  if (/maid/.test(t)) b.mustHaves.push("maid's room");
  if (/asap|now|immediately|this month/.test(t)) b.moveIn = "asap";
  const mi = MONTHS.findIndex((m) => new RegExp(`\\b${m}`).test(t));
  if (mi >= 0) {
    const y = mi < today.getMonth() ? today.getFullYear() + 1 : today.getFullYear();
    b.moveIn = `${y}-${String(mi + 1).padStart(2, "0")}`;
  }
  const ch = t.match(/(\d{1,2})\s*cheques?/);
  if (ch) b.maxCheques = Number(ch[1]);
  return b;
}

export function moveInLabel(m: string | null) {
  if (!m) return "Flexible";
  if (m === "asap") return "As soon as possible";
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function budgetLabel(b: Brief) {
  if (!b.budgetMax) return "Any budget";
  return `Up to AED ${b.budgetMax.toLocaleString("en-US")}${b.purpose === "rent" ? " a year" : ""}`;
}

export function bedsLabel(beds: number[]) {
  if (!beds.length) return "Any size";
  return [...beds].sort().map((n) => (n === 0 ? "Studio" : `${n}-bed`)).join(" or ");
}
