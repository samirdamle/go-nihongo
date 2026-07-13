# Architecture overview — Go Nihongo! v1

## Context

```
┌──────────────┐     HTTPS      ┌─────────────────────────┐
│  Browser     │ ──────────────►│  Vercel / Next.js       │
│  React UI    │◄────────────── │  App Router + Route     │
│  shadcn      │     JSON       │  Handlers (BFF)         │
│  local store │                └───────────┬─────────────┘
└──────────────┘                            │
                      ┌─────────────────────┼─────────────────────┐
                      ▼                     ▼                     ▼
               Dictionary +           Morph / romaji         Google Cloud
               (JMdict-class)         conversion             Translation
               server-side            server-side            (sentence MT)
```

## Containers

| Container | Responsibility |
| --- | --- |
| **Web UI** | Input, detect overrides, render cards, history/favorites |
| **BFF** | Validate input, orchestrate dictionary/morph/MT, shape DTO |
| **Dictionary service** | Load/query JMdict-class data; rank matches |
| **Morph/reading service** | Tokenize, lemma, kana; Hepburn+macron romaji |
| **MT adapter** | `SentenceTranslator` implementation(s) |

## Client modules (suggested)

```
go-nihongo/src/
  app/                 # App Router pages + api routes
  components/          # UI (shadcn + feature components)
  features/
    lookup/            # form state, submit, result views
    history/           # local persistence
    favorites/
  lib/
    detect/            # mode + kind heuristics (client)
    api-client/        # fetch wrappers
  types/
```

## Server modules (suggested)

```
  app/api/lookup/route.ts
  app/api/entry/[id]/route.ts
  server/
    dictionary/
    morph/
    mt/
      types.ts
      google-cloud.ts
      index.ts          # factory from env
    lookup/
      term-lookup.ts
      sentence-lookup.ts
```

## Trust boundary

- **Dictionary cards** must not be filled from LLM output in v1.
- **MT** only supplies sentence-level free translation text.
- Breakdown glosses prefer dictionary; POS-only labels allowed for function words.

## Persistence

| Data | Where |
| --- | --- |
| History | Browser local storage / IndexedDB |
| Favorites | Browser local storage / IndexedDB |
| Provider keys | Server env on Vercel |

## Deployment

- **Vercel** project for `go-nihongo/`
- Env vars for Google Cloud Translation (and later Gemini if used)
- Preview deployments per branch optional

## Future (out of v1)

- Auth + synced favorites
- Heavier client-side dictionary for offline term path
- Native shells (PWA / RN) around same BFF contracts
