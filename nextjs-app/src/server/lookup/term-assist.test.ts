import { describe, expect, it, vi } from "vitest";
import type { LlmClient } from "@/server/llm/types";
import { assistTermLookup } from "./term-assist";

describe("assistTermLookup", () => {
  it("maps structured LLM JSON into tagged TermEntry cards", async () => {
    const llm: LlmClient = {
      chat: vi.fn().mockResolvedValue({
        content: JSON.stringify({
          entries: [
            {
              japanese: "初めまして",
              readings: ["はじめまして"],
              romaji: "hajimemashite",
              senses: [{ gloss: "How do you do?" }],
            },
          ],
        }),
        model: "nvidia/nemotron-3-ultra-550b-a55b:free",
        provider: "openrouter",
      }),
    };

    const entries = await assistTermLookup(llm, "Hajimemashite", "romaji");
    expect(entries).toHaveLength(1);
    expect(entries[0]?.japanese).toContain("初");
    expect(entries[0]?.romaji).toBe("hajimemashite");
    expect(entries[0]?.tags).toEqual(
      expect.arrayContaining(["llm", "openrouter"]),
    );
    expect(entries[0]?.id.startsWith("llm:")).toBe(true);
  });

  it("parses fenced JSON from model output", async () => {
    const llm: LlmClient = {
      chat: vi.fn().mockResolvedValue({
        content:
          'Here you go:\n```json\n{"entries":[{"japanese":"水","readings":["みず"],"romaji":"mizu","senses":[{"gloss":"water"}]}]}\n```',
        model: "mock",
        provider: "mock",
      }),
    };
    const entries = await assistTermLookup(llm, "mizu", "romaji");
    expect(entries[0]?.japanese).toBe("水");
    expect(entries[0]?.romaji).toBe("mizu");
  });
});
