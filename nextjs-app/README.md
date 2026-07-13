# Go Nihongo!

Japanese learning lookup app for English speakers.

**Specs & plans:** [`../docs/`](../docs/)

## Stack

- Next.js App Router + TypeScript + React
- Tailwind CSS + shadcn/ui
- Serverless BFF (`/api/lookup`, `/api/entry/[id]`)
- Pluggable sentence MT (OpenRouter / Google / mock)
- Pluggable LLM via **OpenRouter** (any model; mock without keys)
- Vitest for unit tests (TDD)

## Setup

```bash
npm install
cp .env.example .env.local
# optional: set OPENROUTER_API_KEY (+ OPENROUTER_MODEL) for LLM / translation
# optional: set GOOGLE_CLOUD_TRANSLATION_API_KEY for Google sentence MT
# optional: download JMdict data (falls back to fixtures without it)
npm run dict:prepare
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Dictionary data

Term lookup uses **jmdict-simplified** JSON on the server (see `docs/decisions/0006-dictionary-source.md`).

| Command | Result |
| --- | --- |
| `npm run dict:prepare` | Download **common** English JMdict → `data/jmdict-eng.json` |
| `DICT_VARIANT=eng npm run dict:prepare` | Full English JMdict (larger) |

Override path with `DICT_PATH`. Without a prepared file, the API falls back to in-repo fixtures so tests and first-run dev still work.

**Attribution:** JMdict data © [Electronic Dictionary Research and Development Group](https://www.edrdg.org/edrdg/licence.html). Format via [jmdict-simplified](https://github.com/scriptin/jmdict-simplified).

## OpenRouter (LLM)

Server-only client: `src/server/llm/`. Add to `.env.local` (never commit secrets):

```bash
OPENROUTER_API_KEY=sk-or-...
# default model (Nemotron free) — used for transliteration + sentence translation
OPENROUTER_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free
# LLM_PROVIDER=mock                   # force mock in CI
# MT_PROVIDER=openrouter              # optional explicit MT adapter
```

With `OPENROUTER_API_KEY` set:

- **Sentence translation** uses OpenRouter (Nemotron by default).
- **Term dictionary miss** uses OpenRouter for transliteration + English glosses (cards tagged `llm`).

```ts
import { createLlmClient } from "@/server/llm";

const llm = createLlmClient();
const { content } = await llm.chat({
  messages: [{ role: "user", content: "Explain は vs が briefly." }],
});
```

**Do not** use the LLM as a silent dictionary of record (see ADR 0003 / 0007). Prefer JMdict when prepared.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run dict:prepare` | Download JMdict JSON into `data/` |

## Current milestone

M2 dictionary load + OpenRouter assist in progress; morph breakdown still open — see [`../docs/plans/implementation-plan.md`](../docs/plans/implementation-plan.md).

## Trust boundary

- **Dictionary cards** ← JMdict-class / fixtures (**not** LLM when dict hits)
- **Sentence translation** ← pluggable MT (OpenRouter preferred when key set)
- **LLM / OpenRouter** ← labeled assist on term miss + free translation — never silent sole dictionary of record
- Keys stay server-side
