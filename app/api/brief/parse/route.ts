import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { BriefSchema, parseBriefRules } from "@/lib/brief";
import { scoutModel } from "@/lib/ai";

const MAX_TEXT = 600;

/** Turns the person's own words into a brief. LLM when configured, rules otherwise. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, MAX_TEXT) : "";
  if (!text) return NextResponse.json({ error: "Tell Scout what you are looking for" }, { status: 400 });
  const model = await scoutModel();
  if (model) {
    try {
      const { object } = await generateObject({
        model,
        schema: BriefSchema,
        system:
          "Extract a home-search brief for Princess Tower, Dubai Marina. Today is 25 Nov 2026. Rent prices are yearly AED; convert a monthly budget to yearly. Fill a field ONLY if the person said it. If they did not say when they move, moveIn must be null (not 'asap'). If they did not mention furnishing, furnished is 'any'. Never invent a budget, bedrooms, dates, household, workplace or must-haves: null or empty is the right answer when unsure.",
        prompt: text,
      });
      return NextResponse.json({ brief: object, source: "ai" });
    } catch (err) {
      console.error("[brief/parse] AI failed, using rules", (err as Error).message);
    }
  }
  return NextResponse.json({ brief: parseBriefRules(text), source: "rules" });
}
