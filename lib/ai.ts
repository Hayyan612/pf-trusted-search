import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";

/** OpenRouter model for Scout. Returns null when no key is set, so callers fall back to rules. */
export async function scoutModel(): Promise<LanguageModel | null> {
  // Local testing only: SCOUT_MOCK=1 replays a fixed tool call so the chat UI can be tested without a key.
  if (process.env.SCOUT_MOCK === "1" && process.env.NODE_ENV !== "production") {
    const { mockScout } = await import("@/lib/ai-mock");
    return mockScout();
  }
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  const openrouter = createOpenRouter({ apiKey });
  return openrouter(process.env.ASSISTANT_MODEL || "google/gemini-2.5-flash");
}
