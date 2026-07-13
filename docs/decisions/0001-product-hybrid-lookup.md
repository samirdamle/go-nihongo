# ADR 0001 — Hybrid term/sentence product shape

## Status

Accepted (2026-07-12)

## Context

Go Nihongo! must serve both dictionary-style term lookup and sentence understanding for English-speaking learners. Pure dictionary and pure MT products each leave a gap.

## Decision

- **Hybrid product:** auto-detect term vs sentence with **user override**.
- **Term path:** ranked multi-match dictionary cards (Japanese, Hepburn+macron romaji, meanings).
- **Sentence path:** full translation **plus** word breakdown (content words default; function-word toggle).
- **Input UX:** one field + mode tabs (romaji / Japanese / English) with auto-detect + override — not three permanent textareas.
- **Submit:** explicit only (no debounced live MT).

## Consequences

- Need reliable heuristics plus overrides.
- UI must support two result layouts and a shared term-card component for breakdown click-through.
- API should accept client-resolved `mode` and `kind` to keep overrides authoritative.
