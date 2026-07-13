# ADR 0005 — Local-only history and favorites in v1

## Status

Accepted (2026-07-12)

## Context

Accounts add auth, sync, and privacy surface area. Learners still benefit from recent lookups and starred terms.

## Decision

- Persist **history** and **favorites** in the browser only (`localStorage` or IndexedDB).
- No user accounts or server-side user DB in v1.

## Consequences

- Data does not follow the user across devices.
- Clearing site data wipes study memory — document in UI lightly.
- Favorites should store enough snapshot fields to render if entry hydrate fails.
