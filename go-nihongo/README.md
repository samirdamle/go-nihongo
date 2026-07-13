# Go Nihongo!

Japanese learning lookup app for English speakers.

**Specs & plans:** [`../docs/`](../docs/)

## Stack

- Next.js App Router + TypeScript + React
- Tailwind CSS + shadcn/ui
- Serverless BFF (`/api/lookup`, `/api/entry/[id]`)
- Pluggable sentence MT (Google Cloud Translation default; mock without keys)
- Vitest for unit tests (TDD)

## Setup

```bash
npm install
cp .env.example .env.local
# optional: set GOOGLE_CLOUD_TRANSLATION_API_KEY for real sentence MT
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

M2 dictionary load in progress; morph breakdown and production search ranking still open — see [`../docs/plans/implementation-plan.md`](../docs/plans/implementation-plan.md).

## Trust boundary

- **Dictionary cards** ← JMdict-class / fixtures (not LLM)
- **Sentence translation** ← MT adapter only
- Keys stay server-side
