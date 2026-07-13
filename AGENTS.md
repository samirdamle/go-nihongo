# Agent instructions — Go Nihongo! / grok-lab

Durable rules for any AI agent working in this repository.

## Workflow (mandatory)

1. **GitHub issue first** — For every feature, bugfix, or non-trivial change, create a GitHub issue with goal, scope, acceptance criteria, and out-of-scope **before** writing implementation code.
2. **Branch before implement** — When you start implementing, create a branch with a proper name **before** editing application code:
   - Features: `issue/<number>-short-kebab-slug` (e.g. `issue/23-openrouter-llm`)
   - Hotfixes: `fix/<number>-short-kebab-slug` when tied to an issue
3. **PR references the issue** — Use `Closes #N` or `Fixes #N` in the PR body.
4. **Do not commit secrets** — Never commit `.env`, `.env.local`, or API keys. Only `.env.example` placeholders.

## Product trust boundary (do not violate)

- **Dictionary cards** (readings, senses, rankings) come from JMdict-class data + morph analysis — **not** from LLMs.
- **LLMs / OpenRouter** may be used for labeled assist, optional features, or experiments — never as a silent dictionary of record.
- **Sentence free translation** uses the pluggable MT layer (Google / mock / future adapters).

## Specs

See `docs/` — PRD, functional/API/UX specs, ADRs, acceptance criteria, and `docs/plans/github-backlog.md`.
