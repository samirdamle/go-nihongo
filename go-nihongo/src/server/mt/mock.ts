import type { SentenceTranslator, TranslateParams, TranslateResult } from "./types";

/** Deterministic MT for tests and local dev without keys */
export class MockSentenceTranslator implements SentenceTranslator {
  async translate(input: TranslateParams): Promise<TranslateResult> {
    const prefix =
      input.target === "en" ? "[mock-en]" : "[mock-ja]";
    return {
      text: `${prefix} ${input.text}`,
      provider: "mock",
    };
  }
}
