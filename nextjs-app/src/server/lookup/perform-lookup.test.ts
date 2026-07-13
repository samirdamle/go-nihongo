import { describe, expect, it, vi } from "vitest";
import type { LlmClient } from "@/server/llm/types";
import type { SentenceTranslator } from "@/server/mt/types";
import type { TermEntry } from "@/types/lookup";
import { performLookup } from "./perform-lookup";

const dictEntry: TermEntry = {
  id: "fixture-1",
  japanese: "水",
  readings: ["みず"],
  romaji: "mizu",
  senses: [{ gloss: "water" }],
  commonality: 90,
};

function makeMt(provider = "openrouter"): SentenceTranslator {
  return {
    translate: vi.fn(async ({ target, text }) => ({
      text:
        target === "ja"
          ? `JA:${text}`
          : target === "en"
            ? `EN:${text}`
            : text,
      provider,
    })),
  };
}

describe("performLookup — Nemotron/OpenRouter wiring", () => {
  it("returns dictionary hits without calling LLM", async () => {
    const createLlmClient = vi.fn();
    const result = await performLookup(
      { q: "mizu", mode: "romaji", kind: "term" },
      {
        loadDictionary: async () => [dictEntry],
        searchTerms: () => ({ entries: [dictEntry], suggestions: [] }),
        isOpenRouterConfigured: () => true,
        createLlmClient,
        createSentenceTranslator: () => makeMt(),
      },
    );
    expect(result.kind).toBe("term");
    if (result.kind !== "term") return;
    expect(result.entries[0]?.id).toBe("fixture-1");
    expect(createLlmClient).not.toHaveBeenCalled();
  });

  it("uses LLM term assist (transliteration) on dictionary miss when OpenRouter configured", async () => {
    const llm: LlmClient = {
      chat: vi.fn().mockResolvedValue({
        content: JSON.stringify({
          entries: [
            {
              japanese: "初めまして",
              readings: ["はじめまして"],
              romaji: "hajimemashite",
              senses: [{ gloss: "Nice to meet you" }],
            },
          ],
        }),
        model: "nvidia/nemotron-3-ultra-550b-a55b:free",
        provider: "openrouter",
      }),
    };

    const result = await performLookup(
      { q: "HajimemashiteXYZ", mode: "romaji", kind: "term" },
      {
        loadDictionary: async () => [],
        searchTerms: () => ({ entries: [], suggestions: [] }),
        isOpenRouterConfigured: () => true,
        createLlmClient: () => llm,
        createSentenceTranslator: () => makeMt(),
      },
    );

    expect(result.kind).toBe("term");
    if (result.kind !== "term") return;
    expect(result.entries.length).toBe(1);
    expect(result.entries[0]?.japanese).toContain("初");
    expect(result.entries[0]?.tags).toEqual(
      expect.arrayContaining(["llm", "openrouter"]),
    );
    expect(llm.chat).toHaveBeenCalled();
  });

  it("does not call LLM assist when OpenRouter is not configured", async () => {
    const createLlmClient = vi.fn();
    const result = await performLookup(
      { q: "unknownword", mode: "romaji", kind: "term" },
      {
        loadDictionary: async () => [],
        searchTerms: () => ({
          entries: [],
          suggestions: [{ text: "hint", reason: "prefix" }],
        }),
        isOpenRouterConfigured: () => false,
        createLlmClient,
        createSentenceTranslator: () => makeMt("mock"),
      },
    );
    expect(result.kind).toBe("term");
    if (result.kind !== "term") return;
    expect(result.entries).toEqual([]);
    expect(result.suggestions).toHaveLength(1);
    expect(createLlmClient).not.toHaveBeenCalled();
  });

  it("translates sentences via MT provider (OpenRouter)", async () => {
    const mt = makeMt("openrouter");
    const result = await performLookup(
      { q: "今日はいい天気です", mode: "japanese", kind: "sentence" },
      {
        loadDictionary: async () => [],
        searchTerms: () => ({ entries: [], suggestions: [] }),
        isOpenRouterConfigured: () => true,
        createLlmClient: () => ({ chat: vi.fn() }),
        createSentenceTranslator: () => mt,
      },
    );
    expect(result.kind).toBe("sentence");
    if (result.kind !== "sentence") return;
    expect(result.translation.provider).toBe("openrouter");
    expect(result.translation.text).toBe("EN:今日はいい天気です");
    expect(result.japaneseText).toBe("今日はいい天気です");
    expect(mt.translate).toHaveBeenCalled();
  });

  it("for romaji sentences, also resolves Japanese text via MT", async () => {
    const mt = makeMt("openrouter");
    const result = await performLookup(
      { q: "konnichiwa", mode: "romaji", kind: "sentence" },
      {
        loadDictionary: async () => [],
        searchTerms: () => ({ entries: [], suggestions: [] }),
        isOpenRouterConfigured: () => true,
        createLlmClient: () => ({ chat: vi.fn() }),
        createSentenceTranslator: () => mt,
      },
    );
    expect(result.kind).toBe("sentence");
    if (result.kind !== "sentence") return;
    expect(result.translation.text).toBe("EN:konnichiwa");
    expect(result.japaneseText).toBe("JA:konnichiwa");
    expect(mt.translate).toHaveBeenCalledTimes(2);
  });
});
