# Go Nihongo! — Documentation

SOTA-oriented documentation for **Go Nihongo!**, a Japanese learning web app for English speakers.

## How to use this tree

| Folder | Purpose | When to update |
| --- | --- | --- |
| [`product/`](./product/) | Vision, PRD, personas, scope | Before feature work; when scope changes |
| [`specs/`](./specs/) | Functional, API, UX contracts | Before implementing a slice; keep in sync with code |
| [`architecture/`](./architecture/) | System shape, data flow, modules | When structure or providers change |
| [`decisions/`](./decisions/) | Architecture Decision Records (ADRs) | When a lasting technical/product choice is made |
| [`plans/`](./plans/) | Implementation plans, roadmap | Before a milestone; check off as you ship |
| [`test-plans/`](./test-plans/) | Test strategy, acceptance criteria | With specs; drive TDD |
| [`design/`](./design/) | Visual/UX direction | Before UI work |

## SDLC practices

1. **SDD (spec-driven development)** — Spec and acceptance criteria before code for each vertical slice.
2. **TDD** — Failing tests for domain/API behavior first; UI tests for critical flows.
3. **ADRs** — Record non-obvious decisions; don’t bury them only in chat.
4. **Thin vertical slices** — Ship lookup → sentence → history/favorites rather than horizontal “all UI then all API.”

## App location

Application source: [`../go-nihongo/`](../go-nihongo/)

## Quick links

- [Product vision](./product/vision.md)
- [PRD](./product/prd.md)
- [Functional spec](./specs/functional-spec.md)
- [API spec](./specs/api-spec.md)
- [Architecture overview](./architecture/overview.md)
- [Implementation plan](./plans/implementation-plan.md)
- [Test strategy](./test-plans/test-strategy.md)
- [Acceptance criteria](./test-plans/acceptance-criteria.md)
