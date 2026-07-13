# GitHub issue backlog — Go Nihongo! v1

Issues are written so an AI agent can implement and test **one issue at a time** without product re-discovery.

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

## Issue map (implementation order)

Recommended dependency order for agents:

1. CI workflow  
2. API contract tests (fixtures)  
3. Kana → Hepburn romaji utility  
4. JMdict (or equivalent) loader  
5. Production term search indexes  
6. Soft-miss suggestions  
7. Morph analyzer  
8. Sentence orchestration + breakdown API  
9. Breakdown UI + click-through  
10. History/favorites tests + UX polish  
11. Detect heuristics hardening  
12. Error/limits hardening  
13. Visual polish (clean study tool)  
14. A11y pass  
15. Playwright e2e  
16. Vercel deploy  
17. Acceptance criteria sign-off  

Epic issues group the above for humans; child issues are the agent units of work.

## Agent contract (every issue)

Each issue includes:

- **Goal** and **out of scope**
- **Current code** pointers
- **Spec / AC IDs** to satisfy
- **Implementation steps**
- **Test plan** (TDD preferred)
- **DoD** checklist
- **Dependencies**

Agents should open a branch `issue/<number>-short-slug`, implement, test, and open a PR referencing the issue.
