import { NextResponse } from "next/server";
import { loadDictionary } from "@/server/dictionary/load";
import { searchTerms } from "@/server/dictionary/search";
import { createLlmClient, isOpenRouterConfigured } from "@/server/llm";
import { performLookup } from "@/server/lookup/perform-lookup";
import { createSentenceTranslator } from "@/server/mt";
import type {
  ApiErrorBody,
  InputMode,
  LookupKind,
  LookupRequest,
} from "@/types/lookup";

const MAX_Q = 500;

const defaultDeps = {
  loadDictionary,
  searchTerms,
  isOpenRouterConfigured,
  createLlmClient,
  createSentenceTranslator,
  logError: (message: string) => console.error(message),
};

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
    const response = await performLookup(
      {
        q,
        mode,
        kind,
        options: body.options,
      },
      defaultDeps,
    );
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
