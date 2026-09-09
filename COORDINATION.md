# Parallel session coordination

Several AI sessions may work in this repository at the same time, each in its own container
and branch. These rules prevent sessions from landing on top of one another. Uncommitted work
belongs to the session that created it; inspect the worktree before touching overlapping files.

## Shared chokepoints

**There is no Tailwind in this project.** All styling is hand-written CSS under
`src/styles/`. Root layout loads only tokens, primitives, and shared desktop type
(`.card` padding). Feature CSS is owned with its route layout — do not dump a heavy
feature sheet into [`src/styles/index.css`](src/styles/index.css) or
[`src/app/globals.css`](src/app/globals.css).

For CSS:

- Append scoped classes to the matching feature file; do not reorder or bulk-format
  existing rules.
- Keep each feature's `@media` queries in that feature file.
- Close every block and check brace depth before pushing:

  ```sh
  python3 -c "from pathlib import Path
  bad=[]
  for p in Path('src/styles').glob('*.css'):
    d=0
    for line in p.read_text().splitlines():
      d += line.count('{')-line.count('}')
    if d: bad.append((p,d))
  print(bad or 0)"
  ```

  The result must be `0`.

`src/components/shell/NavContent.tsx` is shared by the desktop sidebar and mobile drawer.
Treat it as frozen while another session is active. If a task requires it, coordinate
ownership first and verify both navigation surfaces afterward.

## CI and local verification

Every pull request and push to `main` runs `.github/workflows/ci.yml`: typecheck, lint, and
Playwright end-to-end tests. Run the relevant checks locally before pushing. The e2e suite uses
a real local SQLite database and a built app in CI; local runs may reuse a server on `:3000`.
Copy `.env.example` to `.env` and apply migrations before running it. Database-writing tests
run in parallel, so investigate SQLite locking or adapter errors rather than dismissing them
as unrelated flakes.

## Branch discipline

1. Rebase or merge the latest `origin/main` before starting and before pushing again.
2. Push an initial commit early enough that other sessions can see ownership of the branch.
3. Keep one pull request per task and do not add unrelated drive-by fixes.
4. If work enters a file another session owns, stop and coordinate rather than editing across
   the boundary.

Before reviving an old branch, check whether its work was squash-merged and later reverted,
or whether `main` solved the same problem differently. A branch tip not being an ancestor of
`main` does not prove that its content is unmerged. Use the two-dot diff and commit subjects:

```sh
git fetch origin
git diff --quiet origin/main origin/<branch> && echo "landed"
git log -1 --format=%s origin/<branch>
git log --oneline origin/main --grep="<that subject>" -i
```

Treat branch lists and old PR references as hints only. Verify current state from `origin/main`,
Git history, the actual diff, and CI before relying on them.
