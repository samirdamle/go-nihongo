import type { SentenceTranslator, TranslateParams, TranslateResult } from "./types";

/**
 * Google Cloud Translation adapter (default production MT).
 * Uses REST v2 with API key when GOOGLE_CLOUD_TRANSLATION_API_KEY is set.
 * Throws if key missing — factory should fall back to mock in development.
 */
export class GoogleCloudSentenceTranslator implements SentenceTranslator {
  constructor(private readonly apiKey: string) {
    if (!apiKey) {
      throw new Error("GoogleCloudSentenceTranslator requires an API key");
    }
  }

  async translate(input: TranslateParams): Promise<TranslateResult> {
    const params = new URLSearchParams({
      q: input.text,
      target: input.target,
      format: "text",
      key: this.apiKey,
    });
    if (input.source !== "auto") {
      params.set("source", input.source);
    }

    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?${params}`,
      { method: "POST" },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Google Translation failed: ${res.status} ${body}`);
    }

    const data = (await res.json()) as {
      data?: { translations?: { translatedText?: string }[] };
    };
    const text = data.data?.translations?.[0]?.translatedText;
    if (!text) {
      throw new Error("Google Translation returned empty payload");
    }

    return {
      text: decodeHtmlEntities(text),
      provider: "google-cloud-translation",
    };
  }
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
