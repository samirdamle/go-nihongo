# ADR 0003 — Dictionary vs MT vs LLM trust boundary

## Status

Accepted (2026-07-12)

## Context

Learners need correct readings and senses. Generative models often hallucinate readings. Sentence free translation quality is a different problem.

## Decision

| Output | Source of truth |
| --- | --- |
| Term readings, senses, ranking | JMdict-class dictionary + morphological analysis |
| Sentence free translation | Pluggable MT API |
| Breakdown tokens | Morph analyzer + dictionary enrichment |
| LLM (Gemini) | Not on the silent critical path in v1; optional labeled assist later only |

Soft failures use suggestions + “Try as sentence,” not silent AI dictionary fills.

## Consequences

- Implementation must ship or access real dictionary data.
- Tests should pin dictionary-backed fixtures, not LLM snapshots, for term correctness.
