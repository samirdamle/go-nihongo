# UX specification — Go Nihongo! v1

## Layout (desktop)

```
┌─────────────────────────────────────────────────────────┐
│  Go Nihongo!                    [History] [Favorites]   │
├─────────────────────────────────────────────────────────┤
│  Mode:  ( Romaji | Japanese | English )   ← tabs        │
│  Kind:  ( Term | Sentence )  auto badge + override      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Input                                           │    │
│  └─────────────────────────────────────────────────┘    │
│  [ Look up ]                                            │
├─────────────────────────────────────────────────────────┤
│  Results                                                │
│  • Term: ranked cards                                   │
│  • Sentence: translation panel + breakdown list         │
└─────────────────────────────────────────────────────────┘
```

Mobile: stack chrome; tabs scroll horizontally if needed; full-width input and cards.

## Visual direction

- **Clean study tool:** neutrals, clear hierarchy, generous reading size for Japanese.
- Component library: **shadcn/ui** + Tailwind.
- Japanese text: font stack with good JP coverage (system JP fonts + Latin).

## Controls

| Control | Behavior |
| --- | --- |
| Mode tabs | Set input mode; reflect auto-detect until user overrides |
| Term/Sentence | Toggle kind; show “Auto” until user overrides |
| Furigana | Toggle; **default on** when results include kanji |
| Function words | Sentence only; default off |
| Look up | Primary submit |
| Star | Favorite on term card |
| Breakdown row | Click → term detail (sheet or expand) |

## Result presentations

### Term list

- Vertical list of cards, rank order.
- Each card: Japanese (with optional ruby) · romaji · senses (top 3 + more).

### Sentence

1. Translation panel (source → target clearly labeled).
2. Breakdown table/list under it.
3. Empty breakdown states explained (“No content words found”).

### Empty / error

- Soft miss: suggestions chips.
- CTA: **Try as sentence** when kind is term and query looks long enough / failed term.

## Motion

- Minimal; prefer instant layout with skeleton/spinner on submit only.

## Copy tone

- Plain, instructional, non-cutesy. Errors say what to do next.
