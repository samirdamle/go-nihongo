# ADR 0006 — Dictionary data source (JMdict simplified)

## Status

Accepted (2026-07-12)

## Context

Term lookup must ground readings and senses in an authoritative JP↔EN dictionary (ADR 0003). The M0/M1 scaffold used a tiny fixture catalog only.

## Decision

1. **Source format:** [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) JSON (English glosses).
2. **Default download:** `jmdict-eng-common-*.json` (common words; smaller cold start). Full `jmdict-eng-*.json` via `DICT_VARIANT=eng`.
3. **Acquisition:** `npm run dict:prepare` downloads a release tarball into `go-nihongo/data/` (gitignored). Not shipped in the client bundle.
4. **Runtime:** Server-only lazy singleton loader maps words → internal `TermEntry`, filling romaji via `toHepburn` (ADR/issue #5).
5. **Tests:** Keep in-repo fixtures + a tiny jmdict-simplified sample under `src/server/dictionary/testdata/`. Production file optional in CI.
6. **Attribution:** JMdict is © Electronic Dictionary Research and Development Group (EDRDG). See [EDRDG licence](https://www.edrdg.org/edrdg/licence.html). App README and `/api` docs must mention this when serving dictionary data.

## Consequences

- Deploy/CI must run `dict:prepare` (or bake data into the image) for real dictionary coverage; otherwise the app falls back to fixtures.
- Serverless memory/cold-start cost scales with chosen variant (common ≪ full eng).
- Search ranking improvements remain issue #7.

## Alternatives considered

- Bundle full JMdict in git/LFS — repo bloat; rejected for v1.
- LLM-generated dictionary — violates ADR 0003 trust boundary.
