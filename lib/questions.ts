import type { Listing } from "@/lib/data";
import type { AgentReply } from "@/lib/shortlist";

/** Questions Scout sends to the agent. The base set depends on rent or buy; extra ones come from the listing's checks. */
export function questionsFor(l: Listing): { id: string; text: string; why?: string; on: boolean }[] {
  const price = l.price.toLocaleString("en-US");
  const base =
    l.kind === "rent"
      ? [
          { id: "available", text: "Is it still available, and from what date?", on: true },
          { id: "price", text: `Is AED ${price} a year the final rent?`, on: true },
          { id: "terms", text: "How many cheques, what deposit and what agency fee?", on: true },
          { id: "viewing", text: "Can I view it this week? Please suggest two times.", on: true },
        ]
      : [
          { id: "available", text: "Is it still for sale?", on: true },
          { id: "price", text: `Is AED ${price} the asking price, and is there room to negotiate?`, on: true },
          { id: "terms", text: "Is it vacant on transfer, and what are the yearly service charges?", on: true },
          { id: "viewing", text: "Can I view it this week? Please suggest two times.", on: true },
        ];
  const extra: { id: string; text: string; why: string; on: boolean }[] = [];
  for (const c of l.checks) {
    if (c.code === "tenanted") extra.push({ id: c.code, text: "The ad says it is tenanted. When does the tenant leave?", why: c.label, on: true });
    if (c.code === "available_later") extra.push({ id: c.code, text: "The ad gives a later date. Is that still right?", why: c.label, on: true });
    if (c.code === "short_stay") extra.push({ id: c.code, text: "Is this a yearly Ejari tenancy, or a holiday-home rate?", why: c.label, on: true });
    if (c.code === "dual_listed") extra.push({ id: c.code, text: `It is also listed for ${l.kind === "rent" ? "sale" : "rent"}. Is the owner committed to ${l.kind === "rent" ? "renting" : "selling"}?`, why: c.label, on: true });
    if (c.code === "photos_other_unit") extra.push({ id: c.code, text: "Are these photos of this exact flat? Please send current photos.", why: c.label, on: true });
    if (c.code === "price_low") extra.push({ id: c.code, text: "The price is below similar flats in the tower. Is anything missing, like parking or condition?", why: c.label, on: true });
    if (c.code === "same_unit") extra.push({ id: c.code, text: "This flat is advertised by other agencies at other prices. Which price is current?", why: c.label, on: true });
    if (c.code === "stale") extra.push({ id: c.code, text: "The ad is a few months old. Is it really still free?", why: c.label, on: true });
  }
  const seen = new Set<string>();
  return [...base, ...extra].filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)));
}

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Simulated agent reply, so the prototype can show the full loop. Clearly labelled as simulated in the UI. */
export function simulateReply(l: Listing): AgentReply {
  const h = hash(l.id);
  const minutes = 6 + (h % 50);
  const codes = new Set(l.checks.map((c) => c.code));
  const slots = ["Thu 6:30 pm", "Sat 11:00 am"];
  // Deposit: usually 5% of annual rent unfurnished, 10% furnished (see AI-LOG.md #3). Service charges are not guessed.
  const deposit = l.furnished === "YES" ? "10%" : "5%";
  const cheques =
    l.kind === "rent"
      ? `${1 + (h % 4)} cheques, ${deposit} security deposit, agency fee 5% of the yearly rent`
      : "Vacant on transfer. I will send the latest service charge statement.";
  if (codes.has("stale") && h % 2 === 0) {
    return { outcome: "unavailable", at: Date.now(), minutes, lines: [`Sorry, this one was ${l.kind === "rent" ? "let" : "sold"} last month. The ad will be removed.`] };
  }
  if (codes.has("photos_other_unit")) {
    return { outcome: "changed", at: Date.now(), minutes, lines: ["The photos are from a similar unit in the tower. I will send photos of this flat.", `Price ${l.price.toLocaleString("en-US")} is correct.`, `Viewing: ${slots[1]}`] };
  }
  if (codes.has("tenanted") || codes.has("available_later")) {
    return { outcome: "changed", at: Date.now(), minutes, lines: ["Tenant leaves on 20 December. You can sign now and move in after that.", cheques, `Viewing: ${slots[0]} (tenant present)`] };
  }
  if (codes.has("same_unit") || codes.has("price_low")) {
    const final = Math.round((l.price * 1.03) / 1000) * 1000;
    return { outcome: "changed", at: Date.now(), minutes, lines: [`Still available. The current price is AED ${final.toLocaleString("en-US")}; the lower ad is out of date.`, cheques, `Viewing: ${slots.join(" or ")}`] };
  }
  return { outcome: "confirmed", at: Date.now(), minutes, lines: ["Yes, still available.", `AED ${l.price.toLocaleString("en-US")} is the final price.`, cheques, `Viewing: ${slots.join(" or ")}`] };
}
