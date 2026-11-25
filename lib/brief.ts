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
  household: z.enum(["single", "couple", "family", "sharing"]).nullable().default(null).describe("Renters: who is moving in. null if not said."),
  financing: z.enum(["cash", "mortgage"]).nullable().default(null).describe("Buyers: paying cash or with a mortgage. null if not said."),
  use: z.enum(["live", "invest"]).nullable().default(null).describe("Buyers: to live in, or to rent out as an investment. null if not said."),
});

export type Brief = z.infer<typeof BriefSchema>;

export const EMPTY_BRIEF: Brief = { purpose: "rent", budgetMax: null, beds: [], moveIn: null, furnished: "any", mustHaves: [], maxCheques: null, notes: null, household: null, financing: null, use: null };

/** The essentials Scout asks about when the person's words leave them out. */
export function missingEssentials(b: Brief): ("budget" | "beds" | "moveIn" | "household" | "financing" | "use")[] {
  const out: ("budget" | "beds" | "moveIn" | "household" | "financing" | "use")[] = [];
  if (!b.budgetMax) out.push("budget");
  if (!b.beds.length) out.push("beds");
  if (!b.moveIn) out.push("moveIn");
  if (b.purpose === "rent" && !b.household) out.push("household");
  if (b.purpose === "buy" && !b.use) out.push("use");
  if (b.purpose === "buy" && !b.financing) out.push("financing");
  return out;
}

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
  if (/family|kids|children/.test(t)) b.household = "family";
  else if (/partner|wife|husband|couple|girlfriend|boyfriend/.test(t)) b.household = "couple";
  else if (/sharing|flatmate|roommate/.test(t)) b.household = "sharing";
  else if (/\b(just me|alone|myself|single)\b/.test(t)) b.household = "single";
  if (/mortgage|loan|finance/.test(t)) b.financing = "mortgage";
  else if (/\bcash\b/.test(t)) b.financing = "cash";
  if (/invest|rental income|yield|rent it out|roi/.test(t)) b.use = "invest";
  else if (/live in|to live|for us|for my family|end[- ]user/.test(t) && b.purpose === "buy") b.use = "live";
  const ch = t.match(/(\d{1,2})\s*cheques?/);
  if (ch) b.maxCheques = Number(ch[1]);
  return b;
}

export function moveInLabel(m: string | null) {
  if (!m || m === "flexible") return "Flexible";
  if (m === "asap") return "As soon as possible";
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export const HOUSEHOLD_LABEL = { single: "Just me", couple: "A couple", family: "A family", sharing: "Sharing" } as const;
export const FINANCING_LABEL = { cash: "Cash", mortgage: "Mortgage" } as const;
export const USE_LABEL = { live: "To live in", invest: "To rent out" } as const;

export function extraTags(b: Brief): string[] {
  const t: string[] = [];
  if (b.purpose === "rent" && b.household) t.push(HOUSEHOLD_LABEL[b.household]);
  if (b.purpose === "buy" && b.use) t.push(USE_LABEL[b.use]);
  if (b.purpose === "buy" && b.financing) t.push(FINANCING_LABEL[b.financing]);
  return t;
}

export function budgetLabel(b: Brief) {
  if (!b.budgetMax) return "Any budget";
  return `Up to AED ${b.budgetMax.toLocaleString("en-US")}${b.purpose === "rent" ? " a year" : ""}`;
}

export function bedsLabel(beds: number[]) {
  if (!beds.length) return "Any size";
  return [...beds].sort().map((n) => (n === 0 ? "Studio" : `${n}-bed`)).join(" or ");
}
