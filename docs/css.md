# CSS conventions

Limbic uses plain global class names (no Tailwind, no CSS Modules). Class strings in
components must stay stable.

## Where files live

Sheets are under `src/styles/`. [`src/app/globals.css`](../src/app/globals.css) only
re-exports the root barrel.

| File | Loaded from | Contents |
|------|-------------|----------|
| `tokens.css` | Root layout via `index.css` | `:root` and `html[data-theme="dark"]` |
| `base.css` | Root | Reset, type, `.card` / `.btn` / `.tag` / evidence / forms |
| `responsive-lg.css` | Root | Shared `min-width: 1024px` type and `.card` padding only |
| `shell.css`, `tour.css`, `screens.css`, `calendar.css`, `streaks.css`, `onboarding.css`, `programs.css` | `src/app/(app)/layout.tsx` | Authenticated chrome, widgets, and program search (onboarding modal + Profile) |
| `profile.css` | `(app)/profile/layout.tsx` | Program Timeline rotations |
| `<feature>.css` | That feature's `layout.tsx` (or page) | Page-private rules |

Accordion (`.pro-accordion-*`) and filter chips (`.pro-filter-*`) are shared across Profile,
Student, Atlas, Movement Lab, HEP, and LimbicPRO, so they live in `base.css`. Tab rails
(`.sub-tabs`, `.sliding-tabs`, `.pill-tabs`) live there too — they are used on Profile,
News, Calendar, Home, and sign-in, not only Nexus. Program search is imported from the
authenticated shell because the role onboarding modal uses it.

## Adding styles

1. Prefer the existing feature file (`wellness.css`, `crossword.css`, …).
2. Keep `@media` queries next to the rules they override — do not add a second global
   desktop dump.
3. If the feature is new, add `src/styles/<feature>.css` and import it from that route's
   `layout.tsx`. Do **not** `@import` it from `src/styles/index.css`.
4. Landing and sign-in must not download crossword, wellness, or connexion CSS.
   `src/styles/global-css-scope.test.ts` guards the root sheets.

## Fallback before the split

The last commit with a single `src/app/globals.css` (before #452) is tagged
`pre-css-modularize`. Check out that tag if a sheet was missed and you need the old
monolith to compare against.

## Components

Oversized UI lives in feature folders (`src/components/shell/`, `home/`, `crossword/`,
`agent/`, `clips/`, `boards/`). Old paths re-export so existing imports keep working.
