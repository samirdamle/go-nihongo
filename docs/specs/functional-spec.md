# Functional specification — Go Nihongo! v1

## 1. Application shell

- Single-page primary workspace (Next.js app).
- English UI chrome only.
- Visual direction: **clean study tool** — calm neutrals, strong typography, minimal decoration (shadcn/ui).

## 2. Input

### 2.1 Single input + mode tabs

Modes:

| Mode ID | Label | Expected input | Primary outcome direction |
| --- | --- | --- | --- |
| `romaji` | From romaji | Latin letters (Hepburn-ish) | Japanese headwords + glosses |
| `japanese` | From Japanese | Hiragana / katakana / kanji | English glosses + readings |
| `english` | From English | English word/phrase/sentence | Japanese forms + readings + glosses |

- **Auto-detect** suggests mode from script/heuristics.
- User can **override** mode via tabs; override sticks for that session until changed (implementation may persist last mode in local storage).

### 2.2 Term vs sentence

- **Auto-classify** input as `term` or `sentence` using heuristics (length, spaces, JP particles, punctuation, etc.).
- User **override** control: Lookup term ↔ Translate sentence.
- Classification is independent of script mode but may use mode as a signal.

### 2.3 Submit

- Lookup runs only on **explicit submit** (primary button and Enter when focus is in the input).
- Empty/whitespace-only submit → inline validation, no API call.
- In-flight submit → disable double-submit; show pending state.

### 2.4 Limits

- Reasonable max length (recommended: 500 characters v1); reject or truncate with message if exceeded.

## 3. Term path

### 3.1 Behavior by mode

| Mode | Processing sketch |
| --- | --- |
| `romaji` | Normalize → match dictionary readings/romaji index → ranked entries |
| `japanese` | Normalize → dictionary / morph lemma → ranked entries |
| `english` | Normalize → English gloss index / reverse lookup → ranked JP entries |

### 3.2 Ranked multi-match

- Return **ordered list** of plausible entries (frequency/commonness when available).
- Do **not** show only a single silent “best” when multiple common matches exist (e.g. hashi → 橋 / 箸 / 端).

### 3.3 Term card fields

For each entry:

| Field | Rules |
| --- | --- |
| Japanese form | Headword (kanji and/or kana as in entry) |
| Pronunciation | Hepburn romaji **with macrons** (e.g. Tōkyō) |
| Kana / furigana | Furigana (ruby) available; **toggle default ON** when kanji present |
| Meanings | English senses; show top **~3**; “more” expands rest |
| Meta (optional) | Part of speech, commonality tags if present in data |

### 3.4 Actions

- **Favorite** / unfavorite entry (stable id from dictionary).
- Copy Japanese / romaji (nice-to-have in v1 if cheap).

## 4. Sentence path

### 4.1 Outputs

1. **Full translation** of the input into the target language:
   - From Japanese → English translation of the sentence.
   - From English → Japanese translation of the sentence.
   - From romaji → treat as Japanese phonetically intended text: resolve to Japanese representation where possible, then translate / present JP sentence + English translation (see API spec for exact pipeline).
2. **Word breakdown** list.

### 4.2 Breakdown rules

- Default: **content words** (nouns, verbs, adjectives, etc.).
- Toggle: show **function words** (particles, auxiliaries, etc.).
- Prefer **dictionary form (lemma)** for lookup; display surface form + lemma when they differ.
- Each row shows: Japanese (surface and/or lemma) · romaji · short gloss.
- **Click-through**: selecting a row opens/expands the same **term card** experience (ranked senses when applicable).

### 4.3 MT

- Via BFF pluggable `translateSentence` port.
- Default adapter: **Google Cloud Translation**.
- Failures: clear error; do not fabricate translation.

## 5. Failure / weak results

| Situation | Behavior |
| --- | --- |
| No dictionary hit | Message + **suggestions** when edit-distance / index allows (“Did you mean…?”) |
| Term fail + input could be sentence | Offer **Try as sentence** one-click |
| MT failure | Error on translation panel; breakdown may still attempt if morph works |
| Provider timeout | User-visible retry |

**Not in v1:** silent Gemini-generated dictionary cards.

## 6. History & favorites

- Stored **locally only** (no account).
- **History:** successful submits (query, mode, classification, timestamp, summary of top result).
- **Favorites:** dictionary entry refs + snapshot fields for offline display of the card basics.
- Survive reload in the same browser profile.
- User can clear history; remove individual favorites.

## 7. Accessibility (baseline)

- Keyboard: tabs, submit, toggle controls reachable.
- Labels on inputs and toggles.
- Sufficient contrast (shadcn defaults + audit).
- Romaji/furigana not only conveyed by color.

## 8. Non-functional

| Concern | v1 target |
| --- | --- |
| Term lookup latency | p95 &lt; 1s when data local/near; otherwise honest loading state |
| Sentence path | p95 &lt; 3s typical short sentence + loading state |
| Secrets | MT keys only on server |
| Privacy | No account; avoid shipping full query logs to third parties beyond MT/dictionary needs |
