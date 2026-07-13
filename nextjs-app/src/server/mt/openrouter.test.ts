import { describe, expect, it, vi } from "vitest";
import type { LlmClient } from "@/server/llm/types";
import { OpenRouterSentenceTranslator } from "./openrouter";

describe("OpenRouterSentenceTranslator", () => {
  it("returns translation text with openrouter provider", async () => {
    const llm: LlmClient = {
      chat: vi.fn().mockResolvedValue({
        content: "Hello",
        model: "nvidia/nemotron-3-ultra-550b-a55b:free",
        provider: "openrouter",
      }),
    };
    const mt = new OpenRouterSentenceTranslator(llm);
    const result = await mt.translate({
      text: "こんにちは",
      source: "ja",
      target: "en",
    });
    expect(result.text).toBe("Hello");
    expect(result.provider).toBe("openrouter");
    expect(llm.chat).toHaveBeenCalled();
  });

  it("wraps failures as Translation errors", async () => {
    const llm: LlmClient = {
      chat: vi.fn().mockRejectedValue(new Error("network")),
    };
    const mt = new OpenRouterSentenceTranslator(llm);
    await expect(
      mt.translate({ text: "hi", source: "en", target: "ja" }),
    ).rejects.toThrow(/Translation failed/);
  });
});
