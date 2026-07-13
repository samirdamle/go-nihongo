import { afterEach, describe, expect, it } from "vitest";
import { createSentenceTranslator } from "./index";
import { MockSentenceTranslator } from "./mock";
import { OpenRouterSentenceTranslator } from "./openrouter";
import { GoogleCloudSentenceTranslator } from "./google-cloud";

describe("createSentenceTranslator", () => {
  const prev = {
    MT_PROVIDER: process.env.MT_PROVIDER,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    LLM_PROVIDER: process.env.LLM_PROVIDER,
    GOOGLE_CLOUD_TRANSLATION_API_KEY:
      process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY,
  };

  afterEach(() => {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("uses mock when MT_PROVIDER=mock", () => {
    process.env.MT_PROVIDER = "mock";
    process.env.OPENROUTER_API_KEY = "sk-or-test";
    expect(createSentenceTranslator()).toBeInstanceOf(MockSentenceTranslator);
  });

  it("uses OpenRouter when OPENROUTER_API_KEY is set (Nemotron path)", () => {
    delete process.env.MT_PROVIDER;
    delete process.env.LLM_PROVIDER;
    process.env.OPENROUTER_API_KEY = "sk-or-test";
    delete process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY;
    expect(createSentenceTranslator()).toBeInstanceOf(
      OpenRouterSentenceTranslator,
    );
  });

  it("uses Google when forced MT_PROVIDER=google", () => {
    process.env.MT_PROVIDER = "google";
    process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY = "g-key";
    delete process.env.OPENROUTER_API_KEY;
    expect(createSentenceTranslator()).toBeInstanceOf(
      GoogleCloudSentenceTranslator,
    );
  });

  it("falls back to mock with no keys", () => {
    delete process.env.MT_PROVIDER;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY;
    delete process.env.LLM_PROVIDER;
    expect(createSentenceTranslator()).toBeInstanceOf(MockSentenceTranslator);
  });
});
