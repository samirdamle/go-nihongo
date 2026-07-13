# ADR 0004 — Pluggable sentence MT; Google Cloud default

## Status

Accepted (2026-07-12)

## Context

Sentence path needs MT. Keys on hand: **Google Cloud Translation** and **Gemini**. Product wants swappable providers (lab/experiment friendly).

## Decision

- Define server-only `SentenceTranslator` interface.
- **Default adapter:** Google Cloud Translation.
- Gemini reserved for optional future adapters/features — not dictionary source of truth.
- Mock adapter for unit/integration tests and local dev without keys.

## Consequences

- Factory selects adapter via env.
- UI shows provider name lightly for debugging/trust optional.
- Cost control reinforced by explicit-submit-only UX.
