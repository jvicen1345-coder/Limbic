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
| `claude/mobile-ux-review-*` | Mobile UX pass | `@media (max-width: …)` blocks only |
| `claude/desktop-visual-review-*` | Desktop visual pass | base rules + `@media (min-width: …)` only |

Merge order: mobile → desktop. The two CSS passes are the pair most likely to conflict;
land them one at a time, and rebase the second on the first. Neither has a branch on the
remote as of 2026-08-30 — per rule 2 above, an unpushed branch is invisible, so treat
these two rows as reservations rather than as work you can go read.

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
