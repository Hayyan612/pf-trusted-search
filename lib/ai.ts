import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/** OpenRouter model for Scout. Returns null when no key is set, so callers fall back to rules. */
export function scoutModel() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  const openrouter = createOpenRouter({ apiKey });
  return openrouter(process.env.ASSISTANT_MODEL || "google/gemini-2.5-flash");
}
