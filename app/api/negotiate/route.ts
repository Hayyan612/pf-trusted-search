import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { scoutModel } from "@/lib/ai";
import { getListing } from "@/lib/data";
import { BriefSchema } from "@/lib/brief";
import { NegotiationBriefSchema, fallbackBrief, negotiationFacts } from "@/lib/negotiation-brief";

/** AI negotiation brief for one listing, grounded only in facts we pass. Falls back to rules. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const l = typeof body?.listingId === "string" ? getListing(body.listingId) : undefined;
  if (!l) return NextResponse.json({ error: "Unknown listing" }, { status: 400 });
  const parsed = BriefSchema.safeParse(body?.brief);
  const brief = parsed.success ? parsed.data : null;
  const facts = negotiationFacts(l, brief);
  const model = await scoutModel();
  if (model) {
    try {
      const { object } = await generateObject({
        model,
        schema: NegotiationBriefSchema,
        system:
          "You help one person negotiate a home in Dubai. Use ONLY the facts given; never invent numbers, dates or claims. All amounts in AED. opening <= target <= walkAway <= askingPrice. If personBudget is set, walkAway must not exceed it. Be polite to the agent; the agent stays in the deal. Plain English, no hype.",
        prompt: `Facts (JSON): ${JSON.stringify(facts)}`,
      });
      const ok = object.opening <= object.target && object.target <= object.walkAway && object.walkAway <= l.price;
      if (ok) return NextResponse.json({ brief: object, source: "ai" });
      console.warn("[negotiate] AI numbers out of order, using rules");
    } catch (err) {
      console.error("[negotiate] AI failed, using rules", (err as Error).message);
    }
  }
  return NextResponse.json({ brief: fallbackBrief(l, brief), source: "rules" });
}
