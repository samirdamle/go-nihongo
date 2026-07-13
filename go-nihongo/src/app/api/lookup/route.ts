import { NextResponse } from "next/server";
import { loadDictionary } from "@/server/dictionary/load";
import { searchTerms } from "@/server/dictionary/search";
import { createLlmClient, isOpenRouterConfigured } from "@/server/llm";
import { assistTermLookup } from "@/server/lookup/term-assist";
import { createSentenceTranslator } from "@/server/mt";
import type {
  ApiErrorBody,
  InputMode,
  LookupKind,
  LookupRequest,
  LookupResponse,
} from "@/types/lookup";

const MAX_Q = 500;

export async function POST(request: Request) {
  let body: Partial<LookupRequest>;
  try {
    body = (await request.json()) as Partial<LookupRequest>;
  } catch {
    return error(400, "invalid_request", "Request body must be JSON");
  }

  const q = typeof body.q === "string" ? body.q.trim() : "";
  const mode = body.mode as InputMode | undefined;
  const kind = body.kind as LookupKind | undefined;

  if (!q) {
    return error(400, "invalid_request", "q is required");
  }
  if (q.length > MAX_Q) {
    return error(400, "invalid_request", `q exceeds max length (${MAX_Q})`);
  }
  if (!mode || !["romaji", "japanese", "english"].includes(mode)) {
    return error(400, "invalid_request", "mode is invalid");
  }
  if (!kind || !["term", "sentence"].includes(kind)) {
    return error(400, "invalid_request", "kind is invalid");
  }

  try {
    if (kind === "term") {
      const catalog = await loadDictionary();
      let { entries, suggestions } = searchTerms(q, mode, catalog);

      // Dictionary miss → OpenRouter Nemotron transliteration/gloss assist (#25)
      if (entries.length === 0 && isOpenRouterConfigured()) {
        try {
          entries = await assistTermLookup(createLlmClient(), q, mode);
          suggestions = [];
        } catch (e) {
          const message = e instanceof Error ? e.message : "LLM assist failed";
          // Soft-fail: return empty term result rather than 500 when dict empty
          console.error("[lookup] term assist failed:", message);
        }
      }

      const response: LookupResponse = {
        kind: "term",
        query: q,
        mode,
        entries,
        suggestions,
      };
      return NextResponse.json(response);
    }

    // Sentence path — translation via OpenRouter when key set (#25)
    const mt = createSentenceTranslator();
    const source =
      mode === "japanese" ? "ja" : mode === "english" ? "en" : "auto";
    const target = mode === "english" ? "ja" : "en";

    const translation = await mt.translate({
      text: q,
      source: source as "ja" | "en" | "auto",
      target: target as "ja" | "en",
    });

    const japaneseText =
      mode === "english"
        ? translation.text
        : mode === "japanese"
          ? q
          : // romaji sentence: translation is English; keep query as surface
            q;

    // For romaji→EN translation path, also ask LLM for a Japanese rendering when OpenRouter is on
    let resolvedJapanese = japaneseText;
    if (mode === "romaji" && isOpenRouterConfigured()) {
      try {
        const ja = await mt.translate({
          text: q,
          source: "auto",
          target: "ja",
        });
        resolvedJapanese = ja.text;
      } catch {
        // keep query as japaneseText fallback
      }
    }

    const response: LookupResponse = {
      kind: "sentence",
      query: q,
      mode,
      translation: {
        text: translation.text,
        sourceLang: source,
        targetLang: target,
        provider: translation.provider,
      },
      japaneseText: resolvedJapanese,
      breakdown: [],
      suggestions: [],
    };
    return NextResponse.json(response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (/Translation|OpenRouter|translate/i.test(message)) {
      return error(502, "upstream_mt", message);
    }
    return error(500, "internal", message);
  }
}

function error(status: number, code: string, message: string) {
  const body: ApiErrorBody = { error: { code, message } };
  return NextResponse.json(body, { status });
}
