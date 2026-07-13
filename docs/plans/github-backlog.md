# GitHub issue backlog — Go Nihongo! v1

Issues are written so an AI agent can implement and test **one issue at a time** without product re-discovery.

**Epic:** [#2 Epic: Go Nihongo! v1 remaining work](https://github.com/samirdamle/go-nihongo/issues/2)

**Filter:** [`label:agent-ready`](https://github.com/samirdamle/go-nihongo/issues?q=is%3Aissue+is%3Aopen+label%3Aagent-ready)

## Specs (always read first)

| Doc | Path |
| --- | --- |
| PRD | [`docs/product/prd.md`](../product/prd.md) |
| Interview decisions | [`docs/product/interview-decisions.md`](../product/interview-decisions.md) |
| Functional spec | [`docs/specs/functional-spec.md`](../specs/functional-spec.md) |
| API spec | [`docs/specs/api-spec.md`](../specs/api-spec.md) |
| UX spec | [`docs/specs/ux-spec.md`](../specs/ux-spec.md) |
| Architecture | [`docs/architecture/overview.md`](../architecture/overview.md) |
| Acceptance criteria | [`docs/test-plans/acceptance-criteria.md`](../test-plans/acceptance-criteria.md) |
| ADRs | [`docs/decisions/`](../decisions/) |

## Already shipped (M0 / early M1 scaffold)

Do **not** re-implement unless an issue says to replace:

- Next.js App Router + TS + Tailwind + shadcn under `go-nihongo/`
- Lookup UI shell (mode tabs, term/sentence, explicit submit, furigana toggle)
- Client detect heuristics + unit tests (`src/lib/detect/`)
- Fixture dictionary term search + multi-match ranking (`src/server/dictionary/`)
- Pluggable MT (mock + Google Cloud) (`src/server/mt/`)
- `POST /api/lookup`, `GET /api/entry/[id]`
- Local history + favorites (`src/features/history/storage.ts`)
- Term cards with top-3 senses + star

## Issues map

| # | Title | Milestone | Depends on |
| --- | --- | --- | --- |
| [#3](https://github.com/samirdamle/go-nihongo/issues/3) | GitHub Actions CI | M5 | — |
| [#4](https://github.com/samirdamle/go-nihongo/issues/4) | API contract tests | M2 | — |
| [#5](https://github.com/samirdamle/go-nihongo/issues/5) | Hepburn romaji + macrons | M2 | — |
| [#6](https://github.com/samirdamle/go-nihongo/issues/6) | JMdict-class dictionary loader | M2 | #5 helpful |
| [#7](https://github.com/samirdamle/go-nihongo/issues/7) | Production term search + ranking | M2 | #5, #6 |
| [#8](https://github.com/samirdamle/go-nihongo/issues/8) | Soft-miss suggestions | M2 | #7 helpful |
| [#9](https://github.com/samirdamle/go-nihongo/issues/9) | Morphological analyzer | M3 | #5 |
| [#10](https://github.com/samirdamle/go-nihongo/issues/10) | Sentence orchestration | M3 | #9, #7 helpful |
| [#11](https://github.com/samirdamle/go-nihongo/issues/11) | Breakdown UI + click-through | M3 | #10 |
| [#12](https://github.com/samirdamle/go-nihongo/issues/12) | History/favorites tests + polish | M4 | — |
| [#13](https://github.com/samirdamle/go-nihongo/issues/13) | Detect heuristics hardening | M2 | — |
| [#14](https://github.com/samirdamle/go-nihongo/issues/14) | Error handling / limits | M5 | #4 helpful |
| [#15](https://github.com/samirdamle/go-nihongo/issues/15) | Visual polish | M5 | — |
| [#16](https://github.com/samirdamle/go-nihongo/issues/16) | Accessibility pass | M5 | #11 helpful |
| [#17](https://github.com/samirdamle/go-nihongo/issues/17) | Playwright e2e smoke | M5 | #3 optional |
| [#18](https://github.com/samirdamle/go-nihongo/issues/18) | Vercel deploy + env | M5 | — |
| [#19](https://github.com/samirdamle/go-nihongo/issues/19) | Acceptance sign-off | M5 | After features |

## Recommended parallel tracks for agents

1. **Track A (infra/tests):** #3 → #4 → #17  
2. **Track B (dictionary):** #5 → #6 → #7 → #8  
3. **Track C (sentence):** #5 → #9 → #10 → #11  
4. **Track D (UX polish):** #12, #13, #15, #14, #16 in any order after core  
5. **Track E (ship):** #18 anytime; #19 last  

## Agent contract (every issue)

Each issue includes goal, current code, specs/AC IDs, steps, tests, DoD, dependencies.

**Branch naming:** `issue/<number>-short-slug`  
**PR:** reference `Fixes #N` or `Closes #N`.
