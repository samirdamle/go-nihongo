# PRD — Go Nihongo! v1

**Status:** Draft locked from product interview (2026-07-12)  
**Codebase:** `go-nihongo/`  
**Platform:** Web first (responsive); mobile wrappers later  

## Problem

Learners who know English often type Japanese in romaji, paste Japanese text, or know only the English concept. Existing tools split dictionary vs translation and bury readings/meanings in cluttered UI.

## Goals

1. Support three input directions in one UI: **romaji → JP**, **JP → EN**, **EN → JP**.
2. **Hybrid** behavior: dictionary for terms; translation + word breakdown for sentences.
3. Always surface (as applicable): **Japanese form**, **English pronunciation (Hepburn + macrons)**, **English meaning(s)**.
4. Feel like a **clean study tool** (not a marketing site or dense power console).

## Success metrics (qualitative v1)

- Correct headword + reading for common terms in all three modes.
- Sentence path returns readable translation + useful breakdown within a few seconds.
- User can star a term and find it after reload (same browser).
- Multi-writing ambiguity (e.g. *hashi*) shows a ranked list, not a silent wrong pick.

## User stories

### US-1 — Romaji term

As a learner, I type `Hajimemashite`, submit, and see Japanese form(s), romaji, and meaning(s).

### US-2 — Japanese term

As a learner, I type `ありがとう`, submit, and see Japanese form, romaji, and English meaning(s).

### US-3 — English term

As a learner, I type `hello`, submit, and see ranked Japanese equivalents with romaji and meanings.

### US-4 — Sentence

As a learner, I paste a short sentence, get full translation plus content-word breakdown (toggle for function words); each row can open a full term card.

### US-5 — Overrides

As a learner, I correct auto mode (script) and term/sentence classification when the tool guesses wrong.

### US-6 — Memory

As a learner, I see recent lookups and favorite entries stored locally.

### US-7 — Soft failure

As a learner, if lookup fails, I get suggestions when possible and a one-click “Try as sentence” when appropriate.

## Scope

### In v1

| Area | Detail |
| --- | --- |
| Input | One field + mode tabs; auto-detect + manual override |
| Hybrid | Auto term/sentence + manual override |
| Term path | Ranked multi-match dictionary cards |
| Sentence path | Full MT translation + breakdown (content default; function-word toggle) |
| Display | Romaji always (Hepburn + macrons); furigana toggle default **on** for kanji |
| Meanings | Top ~3 senses visible; expand for more |
| Persistence | `localStorage`/IndexedDB history + favorites |
| Stack | Next.js App Router, TypeScript, React, shadcn/ui, serverless BFF |
| MT | Pluggable; **Google Cloud Translation** default adapter; Gemini available later (not silent dictionary) |
| Lookup trigger | Explicit submit only (button / Enter) |
| Deploy | Vercel + env-based secrets |

### Out of v1

Accounts/sync, SRS/quizzes, stroke order, TTS/voice, offline-first dictionary+MT, browser extension, non-English UI chrome, silent LLM dictionary fills.

## Data strategy

| Concern | Source of truth |
| --- | --- |
| Term readings, senses, ranked matches | Authoritative dictionary (JMdict-class) + morphological analysis |
| Sentence free translation | Pluggable MT (Google Cloud Translation first) |
| Segmentation / lemma for breakdown | Morphological analyzer → dictionary lookup |
| LLM (Gemini) | Optional later; labeled assist only — never mixed silently into dictionary cards |

## Dependencies / assumptions

- Google Cloud Translation credentials available for real sentence MT.
- Gemini API available for future optional features; not required for core v1 path.
- Network required for live lookup in v1.

## Open items (non-blocking for scaffold)

- Exact JMdict packaging (e.g. jmdict-simplified) and morph library choice — see ADRs / implementation plan.
- Furigana rendering library choice.
- History retention limits (e.g. last 100 lookups).
