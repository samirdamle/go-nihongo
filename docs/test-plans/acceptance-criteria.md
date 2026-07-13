# Acceptance criteria — Go Nihongo! v1

Use these as manual QA and as anchors for automated tests.

## Input & detect

| ID | Criterion |
| --- | --- |
| AC-IN-001 | Single input with mode tabs Romaji / Japanese / English is visible. |
| AC-IN-002 | Typing predominantly kana/kanji auto-suggests Japanese mode unless user overrode mode. |
| AC-IN-003 | Typing Latin letters auto-suggests romaji or english per heuristics; user can override. |
| AC-IN-004 | Term vs sentence auto-classifies; user can override. |
| AC-IN-005 | Submit does not run until Look up / Enter; typing alone does not call MT. |
| AC-IN-006 | Empty submit shows validation and no network success payload. |

## Term path

| ID | Criterion |
| --- | --- |
| AC-TERM-001 | Romaji `hajimemashite` (any reasonable casing) yields Japanese greeting form + romaji + English meaning. |
| AC-TERM-002 | Japanese `ありがとう` yields romaji + English meaning(s). |
| AC-TERM-003 | English `hello` yields at least one Japanese form with romaji + meaning. |
| AC-TERM-004 | Romaji `hashi` shows **multiple ranked** entries including bridge/chopsticks/edge senses when present in data — not a single hidden choice. |
| AC-TERM-005 | Romaji uses Hepburn **with macrons** where long vowels apply (fixture with とうきょう / Tōkyō). |
| AC-TERM-006 | Furigana toggle defaults on for kanji headwords; can turn off. |
| AC-TERM-007 | More than three senses: first three visible, remainder behind expand. |

## Sentence path

| ID | Criterion |
| --- | --- |
| AC-SENT-001 | Short Japanese sentence returns English full translation. |
| AC-SENT-002 | Short English sentence returns Japanese full translation. |
| AC-SENT-003 | Breakdown lists content words with japanese / romaji / gloss. |
| AC-SENT-004 | Function words hidden by default; toggle reveals particles/etc. |
| AC-SENT-005 | Clicking a breakdown row opens term card / entry detail. |

## Failures

| ID | Criterion |
| --- | --- |
| AC-FAIL-001 | Unknown term shows miss message; suggestions appear when available. |
| AC-FAIL-002 | Failed term that could be a sentence offers **Try as sentence**. |
| AC-FAIL-003 | MT outage shows error; does not invent translation text. |

## Memory

| ID | Criterion |
| --- | --- |
| AC-MEM-001 | Successful lookup appears in history after reload (same browser). |
| AC-MEM-002 | Favoriting an entry persists after reload. |
| AC-MEM-003 | User can remove a favorite and clear history. |

## Non-functional

| ID | Criterion |
| --- | --- |
| AC-NF-001 | No provider API keys in client bundle (static scan / architecture review). |
| AC-NF-002 | Primary flows usable with keyboard only. |
| AC-NF-003 | UI chrome is English. |
