import { z } from "zod";

export const DraftSchema = z.object({
  items: z
    .array(
      z.object({
        question: z.string().max(160).describe("One clear, polite question to the agent, in plain English"),
        adQuote: z.string().max(200).nullable().describe("If the ad text already answers it: an exact quote from the ad. Otherwise null"),
      }),
    )
    .min(1)
    .max(6),
});
export type Draft = z.infer<typeof DraftSchema>["items"][number];

const MAX_INPUT = 600;
export const cleanInput = (s: string) => s.replace(/\s+/g, " ").trim().slice(0, MAX_INPUT);

/** Rules fallback: split on question marks, new lines and " and ", then tidy each part. */
export function splitQuestions(text: string): Draft[] {
  return text
    .split(/\?|\n|;|\. | and (?=(?:is|are|can|do|does|will|what|when|how|who)\b)/i)
    .map((x) => x.trim().replace(/^[-•,\s]+/, ""))
    .filter((x) => x.length > 2)
    .slice(0, 6)
    .map((x) => {
      const q = x.charAt(0).toUpperCase() + x.slice(1);
      return { question: /[?.!]$/.test(q) ? q.replace(/\.$/, "?") : `${q}?`, adQuote: null };
    });
}

/** Keep a quote only if it really is in the ad, so Scout never claims the ad says something it does not. */
export function verifyQuote(quote: string | null, adText: string): string | null {
  if (!quote) return null;
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").replace(/[*•]/g, "").trim();
  const q = norm(quote).replace(/^"|"$/g, "");
  return q.length > 3 && norm(adText).includes(q) ? quote.replace(/^"|"$/g, "").trim() : null;
}
