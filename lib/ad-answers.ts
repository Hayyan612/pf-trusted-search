import type { Listing } from "@/lib/data";

/** Answers to common questions from what the ad itself says. Never guesses: if the ad is silent, say so. */
export interface AdAnswer { id: string; q: string; found: boolean; text: string; quote?: string; ask: string }

function quote(l: Listing, re: RegExp) {
  const txt = `${l.title ?? ""}. ${l.descriptionText || l.description}`;
  const m = re.exec(txt);
  if (!m) return null;
  const start = Math.max(0, txt.lastIndexOf("\n", m.index) + 1, m.index - 60);
  const endNl = txt.indexOf("\n", m.index);
  const end = Math.min(txt.length, endNl === -1 ? m.index + 90 : Math.min(endNl, m.index + 90));
  return txt.slice(start, end).replace(/\s+/g, " ").trim();
}
const amenity = (l: Listing, re: RegExp) => l.amenities.find((a) => re.test(a));

export const AD_QUESTIONS = (l: Listing) =>
  [
    { id: "pets", q: "Are pets allowed?", re: /pets? allowed|pet[- ]friendly|pets? (are )?welcome|no pets/i, am: /pets/i, ask: "Are pets allowed?" },
    { id: "chiller", q: "Is it chiller-free?", re: /chiller[- ]?free|free chiller|chiller included|cooling included|empower/i, am: /chiller/i, ask: "Is it chiller-free, or is cooling billed separately?" },
    { id: "parking", q: "Is there parking?", re: /parking/i, am: /parking/i, ask: "Is there a parking space, and is it covered?" },
    ...(l.kind === "rent"
      ? [
          { id: "cheques", q: "How many cheques?", re: /\d+\s*(?:-|\s)?cheques?|up to \d+\s*cheq|flexible cheq|multiple cheq/i, am: /$^/, ask: "How many cheques can I pay with?" },
          { id: "available", q: "When is it free?", re: /vacant|available (?:from|on|now|in)|ready to move|move in now|tenanted/i, am: /$^/, ask: "When is it free to move in?" },
        ]
      : [
          { id: "service", q: "Service charges?", re: /service charge/i, am: /$^/, ask: "What are the yearly service charges?" },
          { id: "tenanted", q: "Tenanted or vacant?", re: /tenanted|vacant on transfer|vacant|rented until/i, am: /$^/, ask: "Is it tenanted, and until when?" },
        ]),
    { id: "furnished", q: "Furnished?", re: /fully furnished|semi[- ]furnished|unfurnished|furnished/i, am: /furnished/i, ask: "What furniture is included?" },
  ];

export function answerFromAd(l: Listing, id: string): AdAnswer | null {
  const def = AD_QUESTIONS(l).find((d) => d.id === id);
  if (!def) return null;
  const qt = quote(l, def.re);
  const am = amenity(l, def.am);
  if (id === "furnished" && l.furnished) {
    const v = l.furnished === "YES" ? "Furnished" : l.furnished === "PARTLY" ? "Partly furnished" : "Unfurnished";
    return { id, q: def.q, found: true, text: `${v}, according to the listing details.`, quote: qt ?? undefined, ask: def.ask };
  }
  if (qt || am) return { id, q: def.q, found: true, text: am && !qt ? `Listed in the amenities: "${am}".` : "The ad says:", quote: qt ?? undefined, ask: def.ask };
  return { id, q: def.q, found: false, text: `The ad does not say. I can ask ${l.agent ?? "the agent"} for you.`, ask: def.ask };
}
