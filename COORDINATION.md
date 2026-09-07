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
| `src/app/globals.css` | ~13k lines, 171 media queries **interleaved** through the file | Every visual change lands here. Media queries are not grouped at the bottom — a mobile rule and a desktop rule can sit ten lines apart. |
| `src/components/AppShell.tsx` | ~770 lines | The only nav/shell component. Desktop sidebar and mobile drawer share `NavContent`, so a "desktop-only" edit is rarely desktop-only. |

### Rules for `globals.css`

- Doing a **mobile** pass? Edit **only inside `@media (max-width: …)` blocks.**
- Doing a **desktop** pass? Edit **base rules and `@media (min-width: …)` blocks only.**
- Adding a **feature**? **Append** new scoped classes (`.boards-*`, `.atrium-*`, …) at the
  end of the file. Do not modify or reorder existing rules to make room.
- Never bulk-reformat or re-sort this file. A whitespace pass turns every other session's
  small diff into an unresolvable conflict.
- **Close your braces, and check the file's depth before you push.** PR #384 appended a
  `@media (max-width: 560px)` block and never closed it. It was the last block in the file
  at the time, so nothing looked wrong — but every rule appended after it, by every session
  that came later, was silently swallowed into that media query and only applied below
  560px. It took PR #389 to find it, and the damage was invisible until someone tested a
  desktop width. "Append at the end" is only safe if the end is at brace depth 0:

  ```sh
  # prints the file's closing brace depth; anything but 0 means a block is still open
  awk '{d+=gsub(/{/,"{")-gsub(/}/,"}")} END{print d}' src/app/globals.css
  ```

### Rules for `AppShell.tsx`

Treat it as frozen whenever another session is active. If your task needs a change here,
say so and get a decision first — do not edit it speculatively. Note that `NavContent` is
shared between the desktop sidebar and the mobile drawer; verify both before pushing.

## CI

Every PR and every push to `main` runs `.github/workflows/ci.yml` (added in PR #387, after
the last revision of this file): `npm run typecheck`, `npm run lint`, and the Playwright
suite. Both jobs are blocking. Run them locally before pushing rather than using CI as the
first check — a red PR is visible to everyone and costs a cycle.

The e2e job builds the app and serves the build (PR #400). It used to run against
`next dev`, which compiles routes on first request; with `fullyParallel` every worker hit
those routes cold at once, and the suite spent four of ten `main` runs red on tests
unrelated to whatever was being merged. If you see an e2e failure that looks unrelated to
your diff, that history is why — but it should no longer be the explanation, so read the
failure before assuming it's noise.

Locally `npm test` still runs against `next dev` and reuses a server already on `:3000`,
so `npm run dev` in one terminal and `npm test` in another works. It needs a real `.env`
(copy `.env.example`) and migrations applied (`node scripts/apply-migrations.mjs`) — the
suite runs against the local SQLite `dev.db`, with no mocked backend. A missing `.env`
surfaces as a Prisma `datasource.url` error from the migration step, and an unmigrated
database as `no such table: main.User` from inside the tests.

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

Also check whether `main` has since solved the same problem a **different** way. A branch
can be perfectly good, conflict only trivially, and still be the wrong thing to merge. PR
#336 moved the Boards tab bar above Daily Games so the tabs didn't sit under an unrelated
section; while it waited, `boards-daily-games-in-sharpening-tab` landed and put Daily Games
*inside* the Daily Sharpening tab instead, which solves the same complaint better. The two
branches conflicted only in the comment explaining which approach won — merging #336 would
have quietly reverted the better fix. It was closed rather than merged.

**Known stale — do not merge:** `claude/redesign-sidebar-nav`. Its content shipped as
PR #304 and was deliberately reverted by PR #307 ("changed too much of the platform's
established look"). Four further `AppShell.tsx` changes were built on the reverted state.
Merging it would resurrect a rejected design and clobber that work.

## Currently active

**This table goes stale fast — check it before you trust it.** Every branch listed here on
the morning of 2026-09-01 had landed by midday. In a repo merging a dozen PRs a day, a
hand-maintained list of in-flight work is wrong more often than it is right, so treat a row
as a hint about *who to ask*, not as fact about what is unmerged.

| Branch | Scope | Owns |
|---|---|---|
| _(none currently reserved)_ | | |

### Working out what is actually unmerged

Do this instead of reading the table above. It takes ten seconds and is always correct:

```sh
git fetch origin
# 1. Zero diff against main means the branch has landed. Most of origin is this.
git diff --quiet origin/main origin/<branch> && echo "landed"

# 2. Non-empty diff proves nothing on its own — see below. Check whether the branch's
#    own tip subject already has a squash commit on main:
git log -1 --format=%s origin/<branch>
git log --oneline origin/main --grep="<that subject>" -i
```

**Why the obvious check does not work.** This repo squash-merges, so a landed branch's tip
SHA is not an ancestor of `main` and `git diff main...branch` (three-dot, from the merge
base) still reports the branch's full original diff. As of 2026-09-05 about 105 branches
sit on origin and all but a couple have already shipped — every one of them looks unmerged
to a three-dot diff. `fix-slide-breakdown-course-mixup` was the clearest example: it read as
unmerged while *being* main's HEAD.

Use the two-dot form (`git diff main branch`), or check whether the branch's new files exist
on `main`. A large deletion count in a two-dot diff means main is ahead of the branch — i.e.
it landed and the branch is now stale, the opposite of unmerged work.

If auto-delete-on-merge ever gets turned on in repo settings, most of this section stops
being necessary: a branch still existing would mean something.

### Recently landed (2026-09-02 – 09-05)

- **CI** — PR #387 added it; PR #400 moved the e2e job onto a built app. See the CI section
  above; this file predated both.
- **Unclosed `@media` block in `globals.css`** — PR #389. The one to know about: see the
  brace-depth rule under `globals.css` above.
- **Article study breakdown** — PR #396 replaced the publisher's abstract on research
  articles with a five-field summary, cached per article in `ArticleBreakdownCache`. PR
  #399 followed with the date's year and the removal of the read-time from every `Article`
  surface (it was the constant 2 for every abstract).
- **Clinician Dashboard session logging** — PR #395 made logged sessions editable.
- **Legal/compliance** — PRs #388, #390, #392, #394, #398.
- **Movement Lab** — PR #391 added nine single-limb exercises and resolved every dangling
  single-limb progression.
- **Mini Crossword difficulty** — PR #393.

### Recently landed (2026-09-01)

- **Legal/compliance pass** — PR #375, from `claude/legal-risk-review-*`. Also carried e2e
  fixes for three Movement Lab tests that #376/#380 had left red on main.
- **Health & Wellness hub redesign** — PR #384.
- **Movement Lab exercise bank additions** — PRs #383, #385.
- **Mobile UX and desktop visual passes** — landed 2026-08-31; their reservation rows are
  gone and the merge-order note they carried no longer applies.
- **Exercise Programs** (the renamed `/hep`), Movement Lab tab + autocomplete, Clinician
  Dashboard 3-rep-max and session exercise logging, mobile bottom-nav reorder, Study Guide
  mastery indicators, Atrium Canvas link-out — PRs #367–#382.

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
