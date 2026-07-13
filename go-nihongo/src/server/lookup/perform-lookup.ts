import type { LlmClient } from "@/server/llm/types";
import type { SentenceTranslator } from "@/server/mt/types";
import type {
  InputMode,
  LookupKind,
  LookupResponse,
  Suggestion,
  TermEntry,
} from "@/types/lookup";
import { assistTermLookup } from "./term-assist";

export type PerformLookupInput = {
  q: string;
  mode: InputMode;
  kind: LookupKind;
  options?: {
    includeFunctionWords?: boolean;
  };
};

export type PerformLookupDeps = {
  loadDictionary: () => Promise<TermEntry[]>;
  searchTerms: (
    q: string,
    mode: InputMode,
    catalog?: TermEntry[],
  ) => { entries: TermEntry[]; suggestions: Suggestion[] };
  isOpenRouterConfigured: () => boolean;
  createLlmClient: () => LlmClient;
  createSentenceTranslator: () => SentenceTranslator;
  logError?: (message: string) => void;
};

/**
 * Core lookup orchestration: dictionary first, OpenRouter Nemotron for
 * translation + term transliteration assist on miss.
 */
export async function performLookup(
  input: PerformLookupInput,
  deps: PerformLookupDeps,
): Promise<LookupResponse> {
  const { q, mode, kind } = input;

  if (kind === "term") {
    const catalog = await deps.loadDictionary();
    let { entries, suggestions } = deps.searchTerms(q, mode, catalog);

    if (entries.length === 0 && deps.isOpenRouterConfigured()) {
      try {
        entries = await assistTermLookup(deps.createLlmClient(), q, mode);
        suggestions = [];
      } catch (e) {
        const message = e instanceof Error ? e.message : "LLM assist failed";
        deps.logError?.(`[lookup] term assist failed: ${message}`);
      }
    }

    return {
      kind: "term",
      query: q,
      mode,
      entries,
      suggestions,
    };
  }

  // sentence
  const mt = deps.createSentenceTranslator();
  const source =
    mode === "japanese" ? "ja" : mode === "english" ? "en" : "auto";
  const target = mode === "english" ? "ja" : "en";

  const translation = await mt.translate({
    text: q,
    source: source as "ja" | "en" | "auto",
    target: target as "ja" | "en",
  });

  let japaneseText =
    mode === "english" ? translation.text : mode === "japanese" ? q : q;

  if (mode === "romaji" && deps.isOpenRouterConfigured()) {
    try {
      const ja = await mt.translate({
        text: q,
        source: "auto",
        target: "ja",
      });
      japaneseText = ja.text;
    } catch {
      // keep surface query
    }
  }

  return {
    kind: "sentence",
    query: q,
    mode,
    translation: {
      text: translation.text,
      sourceLang: source,
      targetLang: target,
      provider: translation.provider,
    },
    japaneseText,
    breakdown: [],
    suggestions: [],
  };
}
