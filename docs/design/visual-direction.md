# Visual direction — Go Nihongo!

## Chosen direction

**Clean study tool** (interview Q15).

## Keywords

Calm · legible · neutral · typographic · uncluttered · trustworthy

## Do

- Large, readable Japanese (16–20px+ body for results).
- Clear separation: input chrome vs results.
- shadcn defaults as baseline; subtle primary accent only.
- Generous whitespace; one primary CTA (**Look up**).

## Don’t

- Loud red/white “touristy Japan” clichés as the whole theme.
- Dense multi-column power-user tables as the default.
- Animated mascots or gamification chrome in v1.

## Components (shadcn)

Likely early set: `Button`, `Input`, `Textarea`, `Tabs`, `Toggle`, `Card`, `Badge`, `ScrollArea`, `Sheet` or `Dialog`, `Separator`, `Skeleton`.

## Typography

- UI: system / Geist / similar clean sans.
- Japanese: system stack e.g. `"Hiragino Sans", "Noto Sans JP", sans-serif`.
- Romaji: same UI sans; macrons must render (ō ū).

## Color

- Background: neutral zinc/stone light (dark mode optional later).
- Primary: restrained indigo or blue for actions.
- Destructive: only for clear/delete.

## States

- Loading: skeleton on results region only.
- Error: inline alert, not modal-only.
- Empty: short instructional empty state before first search.
