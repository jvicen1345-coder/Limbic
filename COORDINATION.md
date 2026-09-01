# Parallel session coordination

Several Claude sessions often work this repo at the same time, each in its own
container on its own branch. None of them can see the others' uncommitted work.
These rules keep them from landing on top of each other. Read this before editing.

## The two chokepoints

**There is no Tailwind in this project.** No `sm:`/`md:`/`lg:` prefixes — all styling
is hand-written CSS. Two files carry almost all of the shared UI surface, and they are
also the two most-churned files in the repo:

| File | Size | Why it's dangerous |
|---|---|---|
| `src/app/globals.css` | ~10k lines, 124 media queries **interleaved** through the file | Every visual change lands here. Media queries are not grouped at the bottom — a mobile rule and a desktop rule can sit ten lines apart. |
| `src/components/AppShell.tsx` | ~700 lines | The only nav/shell component. Desktop sidebar and mobile drawer share `NavContent`, so a "desktop-only" edit is rarely desktop-only. |

### Rules for `globals.css`

- Doing a **mobile** pass? Edit **only inside `@media (max-width: …)` blocks.**
- Doing a **desktop** pass? Edit **base rules and `@media (min-width: …)` blocks only.**
- Adding a **feature**? **Append** new scoped classes (`.boards-*`, `.atrium-*`, …) at the
  end of the file. Do not modify or reorder existing rules to make room.
- Never bulk-reformat or re-sort this file. A whitespace pass turns every other session's
  small diff into an unresolvable conflict.

### Rules for `AppShell.tsx`

Treat it as frozen whenever another session is active. If your task needs a change here,
say so and get a decision first — do not edit it speculatively. Note that `NavContent` is
shared between the desktop sidebar and the mobile drawer; verify both before pushing.

## Branch discipline

1. **Rebase on `origin/main` before you start.** `main` moves several times a day.
2. **Push a first commit early** to claim your branch, even if the work is unfinished.
   An unpushed branch is invisible to every other session.
3. **Re-sync before you push again.** `git fetch origin && git merge origin/main`.
4. **Stay in your lane.** If your task pulls you into a file another session owns, stop
   and flag it rather than editing across the boundary.
5. One PR per task. Don't fold an unrelated drive-by fix into a UI branch.

## Before reviving any old branch

Check whether it was already merged **and then reverted**. This repo squash-merges, so a
merged branch's tip SHA is *not* an ancestor of `main` — `git log main..branch` will show
it as unmerged when its content already landed. Confirm with:

```
git log --oneline --all --grep="<subject>" -i     # look for a squash commit on main
git log --oneline main -- <the files it touched>  # look for a later revert
```

**Known stale — do not merge:** `claude/redesign-sidebar-nav`. Its content shipped as
PR #304 and was deliberately reverted by PR #307 ("changed too much of the platform's
established look"). Four further `AppShell.tsx` changes were built on the reverted state.
Merging it would resurrect a rejected design and clobber that work.

## Currently active

Volatile — update or ignore once these land.

| Branch | Scope | Owns |
|---|---|---|
| `claude/legal-risk-review-2d6asg` | Legal/compliance pass | E-utilities ID centralization, `apta.org` scrape removal, dead-code cleanup (65 files) |
| `claude/exercise-chat-integration-x3r2ub` | Movement Lab exercise bank | `src/lib/movement-lab/`, Exercise Programs data (pure additions) |
| `claude/health-wellness-redesign-bjvaod` | Health & Wellness page | the wellness page + its appended `globals.css` block |

All three are pushed and live as of 2026-09-01 — unlike the reservations this table used to
carry, you can go read them. The Movement Lab / Exercise Programs surface is owned by
`claude/exercise-chat-integration-*`; coordinate before editing there. The legal pass spans
the widest file set, so rebase on it rather than the other way around if you collide.

### Recently landed (2026-09-01)

- **Mobile UX and desktop visual passes** — both landed 2026-08-31 and their reservation rows
  are removed. The merge-order note they carried no longer applies.
- **Exercise Programs** (the renamed `/hep`), Movement Lab tab + autocomplete, Clinician
  Dashboard 3-rep-max and session exercise logging, mobile bottom-nav reorder, Study Guide
  mastery indicators, Atrium Canvas link-out — PRs #367–#382.
- Note for anyone auditing branch state: this repo squash-merges, so **the ~20 stale
  branches on origin whose work has already landed still show a non-empty
  `git diff main...branch`**. Three-dot diffs are not evidence of unmerged work. Test with
  `git diff main branch` (two-dot) or by checking whether the branch's new files exist on
  `main`; the branches listed in the table above are the only ones with real unmerged work.

### Recently landed (2026-08-30)

- **Movement lab exercise bank** — PR #324 (and #323). Row removed.
- **Boards Research & Stats tab** — PR #320. Row removed.
- **Clinical Reference width + search** — PR #325, from `claude/desktop-borders-search-*`.
  Landed ahead of the mobile and desktop passes above, which the merge order didn't
  anticipate. It should not get in their way: everything it added to `globals.css` is one
  appended `.clinref-*` block at the very end of the file, and it touched no `max-width`
  media query and no existing rule. Two things to know:
  - Append **after** that block, not before it, and don't fold it into a desktop pass —
    the page it styles (`/pro/lab-values`) sets its own width and column counts there.
  - It also edited `components/pro/ClinicalReferenceTabs.tsx`, the six reference
    components under `components/pro/`, the 12 calculators, and the decision-rule/red-flag
    cards (each now exports its card copy, and the accordion shells take an optional
    `open`). A session working those files should rebase before starting.
- **Wide-desktop grid on the standalone PRO pages** — PR from `pro-pages-desktop-width`.
  `.clinref-page`'s own comment explicitly named `/pro/calculators`, `/pro/special-tests`,
  and `/pro/decision-rules` as pages deliberately left at the narrower 900px/2-up shape when
  that class shipped — this is that follow-up, plus `/pro/documentation` and
  `/pro/guidelines` (same `.pro-grid-2`/`.pro-accordion` shapes, found via grep). Two new
  appended classes, `.pro-wide-page` (the four pages with no side panel) and
  `.pro-calc-wide-page` (`/pro/calculators` specifically, whose profile panel needs the same
  wider threshold `.clinref-page`'s own calculator tab already uses) — `.clinref-page` itself
  is untouched. One pre-existing rule *was* edited, not just appended to: added
  `align-items: start` to the base `.pro-grid-2` rule, fixing a real bug the wider grid made
  much more visible (a row's cards were stretching to match its tallest sibling — worst on
  `/pro/documentation`, where the tall Functional Goals Bank card was leaving two neighbors
  half-empty). Low risk (one property, height-only, verified against every other
  `.pro-grid-2` consumer including the small form-field grids in CE Tracker) but worth
  knowing before diffing this file against a fork point before it landed.
