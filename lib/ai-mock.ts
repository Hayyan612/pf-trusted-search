import { MockLanguageModelV2, simulateReadableStream } from "ai/test";

/** Dev-only stand-in for the LLM: first turn calls showShortlist, second turn answers in text. */
export function mockScout() {
  let turn = 0;
  return new MockLanguageModelV2({
    doStream: async () => {
      turn += 1;
      const chunks: Parameters<typeof simulateReadableStream>[0]["chunks"] =
        turn % 2 === 1
          ? [
              { type: "stream-start" as const, warnings: [] },
              { type: "tool-call" as const, toolCallId: `c${turn}`, toolName: "showShortlist", input: "{}" },
              { type: "finish" as const, finishReason: "tool-calls" as const, usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 } },
            ]
          : [
              { type: "stream-start" as const, warnings: [] },
              { type: "text-start" as const, id: "t" },
              { type: "text-delta" as const, id: "t", delta: "Number 1 looks genuine, fits your budget and is in line with registered rents." },
              { type: "text-end" as const, id: "t" },
              { type: "finish" as const, finishReason: "stop" as const, usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 } },
            ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { stream: simulateReadableStream({ chunks }) as any };
    },
  });
}
