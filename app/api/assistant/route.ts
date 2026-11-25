import { NextResponse } from "next/server";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { BriefSchema, EMPTY_BRIEF, type Brief } from "@/lib/brief";
import { matchBrief } from "@/lib/match";
import { getListing } from "@/lib/data";
import { scoutModel } from "@/lib/ai";

export const maxDuration = 30;

const SYSTEM = `You are Scout, Property Finder's search assistant, with TrueUnit. You help ONE person find a home in Princess Tower, Dubai Marina.
Rules:
- Use tools for every fact. Never invent a listing, price, agent or availability. Refer to flats only by what tools return.
- TrueUnit's checks decide trust, not you. Explain using the reasons tools return.
- Change the person's brief only with updateBrief, using exactly what they asked.
- Never message an agent yourself: askAgents only prepares a request the person must confirm.
- Keep replies to one or two short sentences in plain English. The tool output is shown as a card, so do not repeat it.`;

function shortlistPayload(brief: Brief) {
  const m = matchBrief(brief);
  return {
    counts: m.counts,
    top: m.top.map((x) => ({ id: x.listing.id, price: x.listing.price, beds: x.listing.beds, status: x.listing.status, fits: x.fits, toAsk: x.toAsk })),
  };
}

export async function POST(req: Request) {
  const model = await scoutModel();
  if (!model) return NextResponse.json({ error: "Chat is not switched on in this prototype. Use the brief editor." }, { status: 503 });
  const body = await req.json().catch(() => null);
  const messages: UIMessage[] = Array.isArray(body?.messages) ? body.messages.slice(-20) : [];
  const parsed = BriefSchema.safeParse(body?.brief);
  const brief: Brief = parsed.success ? parsed.data : EMPTY_BRIEF;

  const result = streamText({
    model,
    system: `${SYSTEM}\nThe person's current brief: ${JSON.stringify(brief)}`,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(3),
    tools: {
      updateBrief: tool({
        description: "Change the person's brief (budget, bedrooms, furnishing, must-haves, move-in, rent/buy). Returns the new brief and shortlist.",
        inputSchema: BriefSchema.partial(),
        execute: async (patch) => {
          const next = BriefSchema.parse({ ...brief, ...patch });
          return { brief: next, ...shortlistPayload(next) };
        },
      }),
      showShortlist: tool({
        description: "Show the trusted top 5 flats for the current brief, with why each fits and what to ask.",
        inputSchema: z.object({}),
        execute: async () => shortlistPayload(brief),
      }),
      explainListing: tool({
        description: "Explain TrueUnit's checks for one listing id.",
        inputSchema: z.object({ listingId: z.string() }),
        execute: async ({ listingId }) => {
          const l = getListing(listingId);
          if (!l) return { error: "Unknown listing" };
          return { id: l.id, status: l.status, checks: l.checks.map((c) => ({ severity: c.severity, label: c.label, detail: c.detail })) };
        },
      }),
      askAgents: tool({
        description: "Prepare questions to the agents of these listings (max 5). The person confirms before anything is sent.",
        inputSchema: z.object({ listingIds: z.array(z.string()).min(1).max(5) }),
        execute: async ({ listingIds }) => ({ listingIds: listingIds.filter((id) => getListing(id)) }),
      }),
      bookViewing: tool({
        description: "Help book a viewing for one listing the agent has already answered about.",
        inputSchema: z.object({ listingId: z.string() }),
        execute: async ({ listingId }) => ({ listingId }),
      }),
    },
  });
  return result.toUIMessageStreamResponse();
}
