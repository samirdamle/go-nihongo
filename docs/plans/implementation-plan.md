# Implementation plan — Go Nihongo! v1

## Principles

- **SDD:** Spec slice → acceptance tests → code.
- **TDD:** Domain and API tests before wiring UI for each slice.
- **Vertical slices:** Each milestone leaves a demoable path.

## Milestone 0 — Scaffold & docs

- [x] Product interview decisions captured
- [x] `docs/` tree (product, specs, architecture, ADRs, plans, test-plans, design)
- [x] `go-nihongo/` Next.js + TS + Tailwind + ESLint
- [x] shadcn init + base components
- [x] Env example files; README
- [x] Vitest unit tests for detect + fixture dictionary search
- [x] CI-friendly `npm test` / `npm run lint` / `npm run typecheck`
- [ ] Playwright e2e skeleton (optional until M5)

## Milestone 1 — Shell UI (no real dictionary)

**Deliverable:** Look up form matches UX spec; mock results from fixture JSON.

- [ ] App layout + clean study theme tokens
- [ ] Mode tabs + term/sentence toggle + input + submit
- [ ] Client detect heuristics (unit-tested)
- [ ] Result components: term list, sentence panel, empty/error
- [ ] Furigana toggle (visual; data from fixtures)
- [ ] MSW or route handler returning fixtures

**Tests first:** detect heuristics; form validation; result rendering from fixtures.

## Milestone 2 — Term lookup (dictionary-backed)

**Deliverable:** Real ranked term cards for romaji / JP / EN sample set.

- [ ] Package/load JMdict-class data (server)
- [ ] Romaji index + kana/kanji lookup + English gloss reverse search
- [ ] Ranking by commonality
- [ ] Hepburn + macrons from readings
- [ ] `POST /api/lookup` term path
- [ ] `GET /api/entry/:id`
- [ ] Soft suggestions on miss

**Tests first:** pure search functions with small fixture dictionary; API contract tests.

## Milestone 3 — Sentence path

**Deliverable:** Translation + breakdown for short sentences.

- [ ] Morph tokenization + function-word flags
- [ ] `SentenceTranslator` + Google adapter + mock
- [ ] Orchestrate sentence lookup per mode
- [ ] Breakdown UI + function-word toggle
- [ ] Click-through to term card

**Tests first:** mock MT; morph on fixture sentences; API sentence shape.

## Milestone 4 — Local memory

- [ ] History store + UI drawer/page
- [ ] Favorites star + list
- [ ] Limits (e.g. last 100 history items)

**Tests first:** storage module unit tests (jsdom).

## Milestone 5 — Harden & deploy

- [ ] Error states, max length, rate-limit basics if needed
- [ ] Vercel project + env
- [ ] Accessibility pass
- [ ] Acceptance criteria checklist signed off
- [ ] Optional Playwright smoke against preview

## Suggested coding order inside a slice

1. Types + failing unit tests  
2. Pure domain functions  
3. Route handler  
4. UI wiring  
5. Manual acceptance against `docs/test-plans/acceptance-criteria.md`

## Dependency notes

| Concern | Candidate approach (finalize in code ADR if changed) |
| --- | --- |
| Dictionary | jmdict-simplified or similar JSON subset for v1 |
| Morph | kuromoji / kuroshiro / modern WASM tokenizer — pick during M2/M3 spike |
| Furigana | ruby markup from kana alignment |
| MT | `@google-cloud/translate` or REST v2 with API key |
