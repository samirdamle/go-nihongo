# Test strategy — Go Nihongo!

## Goals

- Protect **trust boundary**: dictionary correctness vs MT text.
- Enable **TDD** for detect, search, ranking, and API contracts.
- Keep UI tests thin; heavy logic stays pure/server-side.

## Test pyramid

| Layer | Tools (recommended) | What |
| --- | --- | --- |
| Unit | Vitest | Detect heuristics, normalize, rank, romaji, storage |
| Integration | Vitest + Next route handlers / fetch | `/api/lookup` with mock MT + fixture dictionary |
| Component | Vitest + Testing Library | Term card, breakdown, form validation |
| E2E | Playwright | Critical paths on preview/local |
| Manual | Acceptance checklist | Language quality samples |

## TDD workflow

1. Write acceptance criterion ID into test name or comment (`AC-TERM-001`).
2. Red: failing unit/API test.
3. Green: minimal implementation.
4. Refactor; keep tests green.
5. Only then polish UI.

## Fixtures

- Small **fixture dictionary** (tens of entries) covering:
  - hajimemashite / はじめまして
  - ありがとう / arigatou
  - hello → こんにちは / ハロー ambiguity as designed
  - hashi → 橋 / 箸 / 端
  - one short sentence with particles
- **Mock MT** returns deterministic strings in tests (never call Google in CI).

## CI policy

- PR must pass: `lint`, `typecheck`, `unit/integration tests`.
- E2E: main branch or nightly if slow; smoke on PR if stable.
- No real cloud credentials required for CI.

## Non-goals for automated tests

- Full JMdict regression (spot-check samples only).
- MT quality scoring (manual / eval harness later).

## Coverage focus (not vanity %)

Must have tests for:

- Mode/kind detection edge cases
- Multi-match ranking order for hashi-like cases
- Empty query 400
- Sentence response shape with function-word flags
- Favorites/history persistence module
