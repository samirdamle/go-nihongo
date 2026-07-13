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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run typecheck` | `tsc --noEmit` |

## Current milestone

**M0/M1 scaffold:** UI shell, detect heuristics, fixture dictionary term search, mock/Google MT wiring, local history/favorites.

Still to do for full v1: full JMdict, morph breakdown, richer suggestions — see [`../docs/plans/implementation-plan.md`](../docs/plans/implementation-plan.md).

## Trust boundary

- **Dictionary cards** ← JMdict-class / fixtures (not LLM)
- **Sentence translation** ← MT adapter only
- Keys stay server-side
