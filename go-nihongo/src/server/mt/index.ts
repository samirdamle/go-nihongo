import { createLlmClient, isOpenRouterConfigured } from "@/server/llm";
import { GoogleCloudSentenceTranslator } from "./google-cloud";
import { MockSentenceTranslator } from "./mock";
import { OpenRouterSentenceTranslator } from "./openrouter";
import type { SentenceTranslator } from "./types";

export type { SentenceTranslator, TranslateParams, TranslateResult } from "./types";
export { MockSentenceTranslator } from "./mock";
export { GoogleCloudSentenceTranslator } from "./google-cloud";
export { OpenRouterSentenceTranslator } from "./openrouter";

/**
 * Resolve MT adapter from env.
 * Priority:
 * 1. MT_PROVIDER=mock → mock
 * 2. MT_PROVIDER=google → Google (requires key)
 * 3. MT_PROVIDER=openrouter → OpenRouter LLM (requires OPENROUTER_API_KEY)
 * 4. OPENROUTER_API_KEY set → OpenRouter (default for transliteration/translations, #25)
 * 5. GOOGLE_CLOUD_TRANSLATION_API_KEY → Google
 * 6. mock
 */
export function createSentenceTranslator(): SentenceTranslator {
  const forced = process.env.MT_PROVIDER?.toLowerCase();
  if (forced === "mock") {
    return new MockSentenceTranslator();
  }
  if (forced === "google") {
    const key = process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY;
    if (!key) {
      throw new Error("MT_PROVIDER=google requires GOOGLE_CLOUD_TRANSLATION_API_KEY");
    }
    return new GoogleCloudSentenceTranslator(key);
  }
  if (forced === "openrouter" || isOpenRouterConfigured()) {
    if (!isOpenRouterConfigured()) {
      throw new Error("MT_PROVIDER=openrouter requires OPENROUTER_API_KEY");
    }
    return new OpenRouterSentenceTranslator(createLlmClient());
  }

  const googleKey = process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY;
  if (googleKey) {
    return new GoogleCloudSentenceTranslator(googleKey);
  }

  return new MockSentenceTranslator();
}
