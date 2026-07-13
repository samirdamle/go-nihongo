import type { LlmClient } from "@/server/llm/types";
import type { SentenceTranslator, TranslateParams, TranslateResult } from "./types";

/**
 * Sentence translation via OpenRouter LLM (default Nemotron free model).
 * Provider label: openrouter
 */
export class OpenRouterSentenceTranslator implements SentenceTranslator {
  constructor(private readonly llm: LlmClient) {}

  async translate(input: TranslateParams): Promise<TranslateResult> {
    const direction =
      input.target === "ja"
        ? "Translate the following text into natural Japanese. Output only the translation, no quotes or explanation."
        : "Translate the following text into natural English. Output only the translation, no quotes or explanation.";

    const sourceHint =
      input.source === "auto"
        ? "Source language may be English, Japanese, or romaji."
        : input.source === "ja"
          ? "Source language is Japanese."
          : "Source language is English.";

    try {
      const result = await this.llm.chat({
        temperature: 0.2,
        maxTokens: 1024,
        messages: [
          {
            role: "system",
            content: `${direction} ${sourceHint}`,
          },
          { role: "user", content: input.text },
        ],
      });

      return {
        text: result.content.trim(),
        provider: "openrouter",
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      throw new Error(`Translation failed (OpenRouter): ${message}`);
    }
  }
}
