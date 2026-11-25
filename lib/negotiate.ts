import type { Listing } from "@/lib/data";

/** What to offer, from the registered deals for this size. A suggestion, never a promise. */
export function negotiation(l: Listing) {
  if (!l.registered.length || !l.registeredMedian) return null;
  const amounts = l.registered.map((t) => t.amount).sort((a, b) => a - b);
  const lo = amounts[0], hi = amounts[amounts.length - 1], med = l.registeredMedian;
  const round = (n: number) => Math.round(n / 1000) * 1000;
  const what = l.kind === "rent" ? "rents" : "sales";
  const latest = [...l.registered].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (l.price > med * 1.05) {
    const offer = round(Math.max(med, l.price * 0.9));
    return {
      offer,
      tone: "high" as const,
      headline: `Offer about AED ${offer.toLocaleString("en-US")}`,
      why: `Registered ${what} for this size were AED ${lo.toLocaleString("en-US")} to ${hi.toLocaleString("en-US")} (latest AED ${latest.amount.toLocaleString("en-US")}). This ad asks ${Math.round((l.price / med - 1) * 100)}% above the median.`,
      tip: l.kind === "rent" ? "Offering 1 or 2 cheques makes a lower offer easier to accept." : "Recent registered sales are your strongest argument. Ask what is included and the service charges.",
    };
  }
  if (l.price < med * 0.95) {
    return { offer: l.price, tone: "low" as const, headline: "Already below registered deals", why: `Registered ${what} for this size were AED ${lo.toLocaleString("en-US")} to ${hi.toLocaleString("en-US")}. Do not push the price; ask why it is lower (floor, view, condition, tenanted).`, tip: "If it checks out, move quickly." };
  }
  return { offer: l.price, tone: "fair" as const, headline: "Fair against registered deals", why: `Within 5% of what this size ${l.kind === "rent" ? "rented" : "sold"} for (AED ${lo.toLocaleString("en-US")} to ${hi.toLocaleString("en-US")}).`, tip: l.kind === "rent" ? "Ask for a small discount for 1 cheque." : "Negotiate on terms (handover date, furniture) more than price." };
}
