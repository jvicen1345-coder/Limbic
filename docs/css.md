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
| `shell.css`, `tour.css`, `screens.css`, `programs.css` | `src/app/(app)/layout.tsx` | Authenticated chrome. `tour.css` stays here on purpose — `TourHost` is mounted for the whole signed-in app. Program search stays because the role onboarding modal (dynamically imported) and Profile both use it. |
| `calendar.css` | `(app)/calendar`, `(app)/home`, `(app)/profile`, calculators / lab-values / dashboard | Calendar page, Home widget, and `.cal-modal-*` consumers |
| `onboarding.css` | `/onboarding`, `/sign-in`, and the routes that still render those classes (Profile, Atrium, Atlas, clinic setup) | Role cards, theme picker, terms. The role modal imports this sheet itself. |
| `streaks.css` | `(app)/profile/layout.tsx`, `(app)/boards/layout.tsx` | Streak cards and the Boards header pill |
| `profile.css` | `(app)/profile/layout.tsx` | Program Timeline rotations, Membership tier table |
| `<feature>.css` | That feature's `layout.tsx` (or page) | Page-private rules |
| `pro.css` | Toolbox routes under `/pro/*` (not the parent layout, not special-tests) | Shared `.pro-*` toolbox primitives |
| `pro-dashboard.css` | `/pro/dashboard`, clinic setup/report, Force Lab | `.clindash-*` |
| `pro-force-lab.css` | `/pro/force-lab`, dashboard Force Lab cards | `.forcelab-*` |
| `pro-special-tests.css` | `/pro/special-tests` | The handful of toolbox rules that page needs |
| `playbooks.css` | `(app)/student/playbooks/layout.tsx` | Playbook hub + reader; not the Atrium hub |
| `metrics.css` | `(app)/wellness/layout.tsx`, `(app)/pro/research-literacy/layout.tsx` | Calculator readouts, rating badges |
| `research-tools.css` | `(app)/article/layout.tsx`, `(app)/pro/research-literacy/layout.tsx` | Histogram explorer, research-literacy guide |
| `patient-brief.css` | `pro/patient-brief`, `pro/force-lab`, `admin/connexion-safety-score` layouts | Printable patient brief |
| `paywall.css` | `(app)/wellness/layout.tsx`, `(app)/connexion/layout.tsx` | Agent paywall notice |

A rule shared by two features belongs in a sheet **both** routes load — either `base.css`
when it is a true primitive, or a small sheet imported from each route's layout (the four
above). Do not leave it in one feature's sheet and hope; `src/styles/route-css-reachability.test.ts`
fails the build when a route can render a class none of its sheets define.

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
5. Run `npm run test:unit` before pushing. `route-css-reachability.test.ts` walks every
   route's layout chain and component graph and fails if a class it can render is styled
   only in a sheet that route never loads.

## Fallback before the split

The last commit with a single `src/app/globals.css` (before #452) is tagged
`pre-css-modularize`. Check out that tag if a sheet was missed and you need the old
monolith to compare against.

## Components

Oversized UI lives in feature folders (`src/components/shell/`, `home/`, `crossword/`,
`agent/`, `clips/`, `boards/`). Old paths re-export so existing imports keep working.
