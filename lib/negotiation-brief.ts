import { z } from "zod";
import type { Brief } from "@/lib/brief";
import type { Listing } from "@/lib/data";
import { negotiation } from "@/lib/negotiate";

export const NegotiationBriefSchema = z.object({
  opening: z.number().int().describe("Opening offer in AED"),
  target: z.number().int().describe("Price the person should aim to agree in AED"),
  walkAway: z.number().int().describe("Highest price worth paying in AED; above this, walk away"),
  summary: z.string().max(240).describe("One or two sentences: where this price sits against registered deals and live ads"),
  arguments: z.array(z.string().max(160)).min(2).max(4).describe("Arguments to use, each grounded in the facts given"),
  tradeOffs: z.array(z.string().max(120)).min(1).max(3).describe("What the person can offer instead of money: fewer cheques, flexible move-in, longer lease, etc."),
  askFirst: z.array(z.string().max(120)).min(1).max(4).describe("Questions to settle before negotiating"),
  message: z.string().max(700).describe("A short, polite message to the agent making the opening offer, signed '(your name)'"),
});
export type NegotiationBrief = z.infer<typeof NegotiationBriefSchema>;

/** Facts the model may use. Nothing else. */
export function negotiationFacts(l: Listing, brief: Brief | null) {
  return {
    purpose: l.kind,
    askingPrice: l.price,
    sizeSqft: l.size,
    beds: l.beds,
    furnished: l.furnished,
    registeredDealsSameSize: l.registered.map((t) => ({ date: t.date, amount: t.amount })),
    registeredMedian: l.registeredMedian,
    vsRegisteredPct: l.vsRegistered,
    liveAdMedianPerSqft: l.medianPpsf,
    vsLiveAdsPct: l.vsMedian,
    daysListed: l.ageDays,
    trueUnitChecks: l.checks.filter((c) => c.severity !== "ok").map((c) => c.label),
    agent: l.agent,
    personBudget: brief?.budgetMax ?? null,
    personMaxCheques: brief?.maxCheques ?? null,
    personMoveIn: brief?.moveIn ?? null,
  };
}

/** Deterministic fallback from registered deals, used when no model is available or it fails. */
export function fallbackBrief(l: Listing, brief: Brief | null): NegotiationBrief {
  const n = negotiation(l);
  const round = (x: number) => Math.round(x / 1000) * 1000;
  const med = l.registeredMedian ?? l.price;
  const target = round(Math.min(l.price, Math.max(med, l.price * 0.93)));
  const opening = round(Math.min(target, Math.max(med * 0.97, l.price * 0.88)));
  const walkAway = round(Math.min(l.price, brief?.budgetMax ?? l.price));
  const what = l.kind === "rent" ? "rents" : "sales";
  return {
    opening, target, walkAway,
    summary: n?.why ?? `Asking AED ${l.price.toLocaleString("en-US")}.`,
    arguments: [
      l.registered.length ? `Registered ${what} for this size: AED ${Math.min(...l.registered.map((t) => t.amount)).toLocaleString("en-US")} to ${Math.max(...l.registered.map((t) => t.amount)).toLocaleString("en-US")}.` : "No registered deals for this size; use other ads in the tower.",
      l.ageDays && l.ageDays > 45 ? `Listed ${l.ageDays} days ago, so the owner may be flexible.` : "Similar flats are on the market in the same tower.",
    ],
    tradeOffs: l.kind === "rent" ? ["Pay in 1 or 2 cheques instead of 4", "Flexible move-in date"] : ["Quick transfer date", "Cash or pre-approved mortgage"],
    askFirst: ["Is it still available?", l.kind === "rent" ? "Is it chiller-free?" : "What are the service charges?"],
    message: `Hi ${(l.agent ?? "").split(" ")[0] || "there"}, thank you for the details on the ${l.beds}-bed in Princess Tower. Registered ${what} for this size were around AED ${Math.round(med).toLocaleString("en-US")}, so would the owner consider AED ${opening.toLocaleString("en-US")}${l.kind === "rent" ? " with fewer cheques" : ""}?\n\nThank you,\n(your name)`,
  };
}
