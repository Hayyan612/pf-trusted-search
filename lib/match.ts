import type { Brief } from "@/lib/brief";
import { unitsFor, type Listing } from "@/lib/data";

export interface Match {
  listing: Listing;
  score: number;
  fits: string[]; // what matches the brief, in plain words
  toAsk: string[]; // brief items the ad does not answer; Scout asks the agent
  misses: string[]; // brief items it clearly fails (kept out of the top 5)
}

const has = (l: Listing, re: RegExp) => re.test(`${l.title ?? ""} ${l.description} ${l.amenities.join(" ")}`);

/** Deterministic: filters to the brief, then ranks by trust, fit and price against registered deals. No LLM. */
export function matchBrief(brief: Brief) {
  const kind = brief.purpose === "buy" ? "sale" : "rent";
  const units = unitsFor(kind);
  const all: Match[] = [];
  for (const { listing: l } of units) {
    const fits: string[] = [], toAsk: string[] = [], misses: string[] = [];
    if (brief.beds.length) (brief.beds.includes(l.beds) ? fits : misses).push(`${l.beds === 0 ? "Studio" : `${l.beds}-bed`}`);
    if (brief.budgetMax) {
      if (l.price <= brief.budgetMax) fits.push(`AED ${l.price.toLocaleString("en-US")}, within budget`);
      else misses.push(`AED ${(l.price - brief.budgetMax).toLocaleString("en-US")} over budget`);
    }
    if (brief.furnished !== "any") {
      const f = l.furnished === "YES" || l.furnished === "PARTLY";
      if (l.furnished == null) toAsk.push("Is it furnished?");
      else ((brief.furnished === "yes") === f ? fits : misses).push(f ? "Furnished" : "Unfurnished");
    }
    for (const m of brief.mustHaves) {
      const found =
        m === "parking" ? has(l, /parking/i) :
        m === "pets" ? has(l, /pets? allowed|pet[- ]friendly/i) :
        m === "sea view" ? has(l, /sea|palm|marina view|water/i) :
        m === "high floor" ? has(l, /high floor|high level|tall level/i) :
        m === "balcony" ? has(l, /balcon/i) :
        has(l, /maid/i);
      if (found) fits.push(m[0].toUpperCase() + m.slice(1));
      else toAsk.push(m === "pets" ? "Are pets allowed?" : `Does it have ${m === "parking" ? "parking" : m === "maid's room" ? "a maid's room" : `a ${m}`}?`);
    }
    const tenanted = l.checks.some((c) => c.code === "tenanted");
    if (brief.purpose === "buy" && brief.use === "invest") {
      if (tenanted) {
        fits.push("Tenanted: rent from day one");
        toAsk.push("What is the current rent, and when does the lease end?");
      } else toAsk.push("What rent does a flat like this get?");
    } else if (brief.moveIn && brief.moveIn !== "flexible" && (tenanted || l.checks.some((c) => c.code === "available_later"))) {
      toAsk.push("Will it be free by your move-in date?");
    }
    if (brief.purpose === "buy") {
      toAsk.push("What are the yearly service charges?");
      if (brief.financing === "mortgage") toAsk.push("Is the seller fine with a mortgage buyer?");
    }
    if (brief.purpose === "rent" && brief.household === "sharing") toAsk.push("Does the landlord allow sharing?");
    if (brief.purpose === "rent" && brief.maxCheques) toAsk.push(`Can I pay in ${brief.maxCheques} ${brief.maxCheques === 1 ? "cheque" : "cheques"}?`);
    if (l.status === "hide") misses.push("Likely misleading");

    const trust = l.status === "ok" ? 3 : l.status === "ask" ? 1.5 : 0;
    const priceScore = l.vsRegistered == null ? 0 : Math.max(-1.5, Math.min(1.5, -l.vsRegistered / 10));
    const fresh = l.ageDays != null && l.ageDays <= 30 ? 0.5 : 0;
    const score = trust * 2 + fits.length - Math.min(toAsk.length, 3) * 0.4 - misses.length * 5 + priceScore + fresh;
    all.push({ listing: l, score, fits, toAsk, misses });
  }
  all.sort((a, b) => b.score - a.score);
  const fitting = all.filter((m) => m.misses.length === 0);
  const trusted = fitting.filter((m) => m.listing.status !== "hide");
  return {
    kind,
    counts: { flats: units.length, fit: fitting.length, trusted: trusted.filter((m) => m.listing.status === "ok").length },
    top: trusted.slice(0, 5),
    more: trusted.slice(5, 15),
  };
}
