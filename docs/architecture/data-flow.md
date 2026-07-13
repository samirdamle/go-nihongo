# Data flow — lookup

## Term path

```
User types + sets mode/kind → Submit
    → POST /api/lookup { kind: "term", mode, q }
        → normalize(q, mode)
        → dictionary.search(...)
        → rank(entries)
        → attach romaji (from readings)
    ← { entries[], suggestions[] }
    → render ranked cards
    → optional: save history locally
```

## Sentence path

```
User submits kind: "sentence"
    → POST /api/lookup
        → normalize
        → if mode english:
             mt.translate → japaneseText
             morph(japaneseText) → tokens
             dictionary enrich tokens
             translation panel shows JA (and EN is source)
        → if mode japanese:
             japaneseText = q
             mt.translate JA→EN
             morph + enrich
        → if mode romaji:
             resolve romaji → japaneseText (best effort)
             mt as needed for EN gloss of sentence
             morph + enrich
    ← { translation, japaneseText, breakdown[] }
    → render translation + breakdown
    → click token → GET /api/entry/:id or expand embedded entry
```

## Detect (client)

```
onChange q (no network)
    → heuristic mode + kind
    → update UI badges unless user locked override
```

## Favorites

```
Star on card → write local favorite { entryId, snapshot, ts }
Favorites page → read local; optional hydrate via GET /api/entry/:id
```
