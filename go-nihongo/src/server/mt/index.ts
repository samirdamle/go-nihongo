import { GoogleCloudSentenceTranslator } from "./google-cloud";
import { MockSentenceTranslator } from "./mock";
import type { SentenceTranslator } from "./types";

export type { SentenceTranslator, TranslateParams, TranslateResult } from "./types";
export { MockSentenceTranslator } from "./mock";
export { GoogleCloudSentenceTranslator } from "./google-cloud";

/**
 * Resolve MT adapter from env.
 * - Prefer Google when GOOGLE_CLOUD_TRANSLATION_API_KEY is set
 * - Otherwise mock (local/CI)
 * - MT_PROVIDER=mock forces mock
 */
export function createSentenceTranslator(): SentenceTranslator {
  const forced = process.env.MT_PROVIDER?.toLowerCase();
  if (forced === "mock") {
    return new MockSentenceTranslator();
  }

  const key = process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY;
  if (key) {
    return new GoogleCloudSentenceTranslator(key);
  }

  return new MockSentenceTranslator();
}
