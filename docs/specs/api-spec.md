# API specification — Go Nihongo! BFF (v1)

All language intelligence goes through **Next.js Route Handlers** (serverless BFF). The browser never receives Google Cloud credentials.

## Conventions

- Base path: `/api/...`
- JSON request/response
- `Content-Type: application/json`
- Errors: `{ "error": { "code": string, "message": string } }` with appropriate HTTP status

## Types (shared conceptual)

```ts
type InputMode = "romaji" | "japanese" | "english";
type LookupKind = "term" | "sentence";

type Sense = {
  gloss: string;
  pos?: string[];
};

type TermEntry = {
  id: string;
  japanese: string; // primary written form
  readings: string[]; // kana
  romaji: string; // Hepburn + macrons
  senses: Sense[];
  commonality?: number; // for ranking; higher = more common
  tags?: string[];
};

type BreakdownToken = {
  surface: string;
  lemma?: string;
  reading?: string;
  romaji?: string;
  pos?: string;
  isFunctionWord: boolean;
  gloss?: string;
  entryId?: string; // if linked to dictionary
};

type Suggestion = {
  text: string;
  reason?: string;
};
```

---

## `POST /api/lookup`

Primary endpoint for explicit submit.

### Request

```json
{
  "q": "string",
  "mode": "romaji | japanese | english",
  "kind": "term | sentence",
  "options": {
    "includeFunctionWords": false
  }
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `q` | yes | Trimmed; reject empty |
| `mode` | yes | Client-resolved mode (after auto or override) |
| `kind` | yes | Client-resolved term/sentence (after auto or override) |
| `options.includeFunctionWords` | no | Sentence breakdown only; default `false` |

### Response `200` — term

```json
{
  "kind": "term",
  "query": "hashi",
  "mode": "romaji",
  "entries": [ "TermEntry..." ],
  "suggestions": []
}
```

- `entries` sorted best-first.
- Empty `entries` → still 200 with `suggestions` if any (soft miss).

### Response `200` — sentence

```json
{
  "kind": "sentence",
  "query": "...",
  "mode": "japanese",
  "translation": {
    "text": "...",
    "sourceLang": "ja",
    "targetLang": "en",
    "provider": "google-cloud-translation"
  },
  "japaneseText": "...",
  "breakdown": [ "BreakdownToken..." ],
  "suggestions": []
}
```

| Field | Meaning |
| --- | --- |
| `translation` | Full-sentence MT result |
| `japaneseText` | Canonical Japanese for the sentence when available (e.g. EN→JA result, or normalized JP) |
| `breakdown` | Tokens; filter client-side or server-side by `isFunctionWord` per options |

### Errors

| Status | code | When |
| --- | --- | --- |
| 400 | `invalid_request` | Missing q/mode/kind, over max length |
| 502 | `upstream_mt` | MT provider failure |
| 503 | `dictionary_unavailable` | Dictionary backend failure |
| 500 | `internal` | Unexpected |

---

## `POST /api/detect` (optional v1)

Helps client auto-detect without full lookup.

### Request

```json
{ "q": "string" }
```

### Response `200`

```json
{
  "mode": "romaji | japanese | english",
  "kind": "term | sentence",
  "confidence": { "mode": 0.0, "kind": 0.0 }
}
```

Client may implement heuristics locally instead; if so, this route can be deferred.

---

## `GET /api/entry/:id`

Fetch a single dictionary entry (breakdown click-through / favorites hydrate).

### Response `200`

```json
{ "entry": "TermEntry" }
```

### Errors

- `404` `not_found`

---

## Pluggable MT port (server-only)

```ts
interface SentenceTranslator {
  translate(input: {
    text: string;
    source: "ja" | "en" | "auto";
    target: "ja" | "en";
  }): Promise<{ text: string; provider: string }>;
}
```

- **Default:** Google Cloud Translation adapter.
- **Future:** DeepL, Gemini-backed adapter (sentence only), mock for tests.

Env (suggested):

```bash
GOOGLE_CLOUD_TRANSLATION_API_KEY=...
# or ADC / service account JSON via GOOGLE_APPLICATION_CREDENTIALS
# Optional later:
# GEMINI_API_KEY=...
```

---

## What is not exposed

- No client routes that accept raw provider keys.
- No “LLM dictionary” endpoint in v1 core path.
