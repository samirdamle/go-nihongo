# Locked product decisions (interview 2026-07-12)

| # | Topic | Decision |
| --- | --- | --- |
| Q1 | Product shape | **C Hybrid** — dictionary for terms; translation + breakdown for sentences |
| Q2 | Sentence UX | **Translation + word breakdown** |
| Q3 | Term vs sentence | **Auto-detect + user override** |
| Q4 | Input | **One field + mode tabs** (romaji / Japanese / English), auto + override |
| Q5 | Platform | **Web first**, mobile wrappers later |
| Q6 | Data | **Authoritative dictionary + morph** for terms/breakdown; **MT** for full sentence |
| Q7 | Card display | Romaji always; **furigana toggle default on**; top ~3 senses + expand |
| Q8 | Ambiguity | **Ranked multi-match list** |
| Q9 | Memory | **Local history + favorites**; accounts later |
| Q10 | Architecture | **Serverless BFF** (Next API routes) |
| Q11 | Stack | **Next.js App Router + TypeScript + React** |
| Q12 | MT | **Pluggable**; Google Cloud Translation available; Gemini later optional labeled only |
| — | UI kit | **shadcn/ui** |
| Q13 | Scope cut | Per PRD in/out table (no SRS, TTS, accounts, offline-first, etc.) |
| Q14 | Breakdown | **Content words default; function-word toggle**; click-through to term card |
| Q15 | Visual | **Clean study tool** |
| Q16 | Romaji | **Hepburn + macrons** |
| Q17 | Deploy | **Vercel + real keys** |
| Q18 | Keys | **Google Cloud Translation** + Gemini API (Gemini not silent dictionary) |
| Q19 | Failures | **Suggestions + Try as sentence** (no silent AI fill) |
| Q20 | Trigger | **Explicit submit only** |
| Q21 | Extra | Docs SDD/TDD tree + `go-nihongo/` app scaffold |

Authoritative detail: [prd.md](./prd.md), [../specs/functional-spec.md](../specs/functional-spec.md).
