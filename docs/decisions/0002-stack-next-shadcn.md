# ADR 0002 — Next.js App Router, TypeScript, shadcn, serverless BFF

## Status

Accepted (2026-07-12)

## Context

Web-first app that needs server-side secrets for MT and a path to Vercel deploy and later mobile wrappers.

## Decision

- **Next.js App Router** + **TypeScript** + **React**
- **shadcn/ui** + Tailwind for UI
- **Serverless BFF** via Route Handlers (no separate always-on API server in v1)
- App lives in repo folder `go-nihongo/`

## Consequences

- Colocated UI and API simplify MVP.
- Dictionary data loading strategy must fit serverless (bundle, lazy load, or external store) — follow-up implementation decision.
- shadcn requires initial CLI init and component adds as needed.
