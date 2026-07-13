# ADR 0007 — OpenRouter as pluggable LLM gateway

## Status

Accepted (2026-07-12)

## Context

We want access to many LLMs without integrating each vendor SDK. Product trust rules forbid using LLMs as the silent dictionary of record (ADR 0003).

## Decision

1. Integrate **OpenRouter** via its OpenAI-compatible Chat Completions API.
2. Server-only client under `go-nihongo/src/server/llm/`.
3. Configuration via env:
   - `OPENROUTER_API_KEY` (required for real calls)
   - `OPENROUTER_MODEL` (default model id)
   - `OPENROUTER_BASE_URL` (optional; default `https://openrouter.ai/api/v1`)
   - `LLM_PROVIDER=mock` forces mock client
4. Factory `createLlmClient()` returns mock when no key (tests/CI).
5. **Not** used to invent dictionary readings/meanings; MT remains separate (ADR 0004).

## Consequences

- Any OpenRouter model string can be selected without code changes.
- Call sites must treat LLM output as unverified unless labeled.
- Keys must never be exposed to the browser.
