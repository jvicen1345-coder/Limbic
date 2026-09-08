# Parallel session coordination

Several AI sessions may work in this repository at the same time, each in its own container
and branch. These rules prevent sessions from landing on top of one another. Uncommitted work
belongs to the session that created it; inspect the worktree before touching overlapping files.

## Shared chokepoints

**There is no Tailwind in this project.** All styling is hand-written CSS. `src/app/globals.css`
has interleaved media queries and is one of the most-churned files in the repository.

For `globals.css`:

- Edit only the relevant base, mobile, or desktop sections for a targeted pass.
- For a new feature, append scoped classes at the end; do not reorder or bulk-format existing
  rules.
- Close every block and check the final brace depth before pushing:

  ```sh
  awk '{d+=gsub(/{/,"{")-gsub(/}/,"}")} END{print d}' src/app/globals.css
  ```

  The result must be `0`.

`src/components/AppShell.tsx` is shared by the desktop sidebar and mobile drawer through
`NavContent`. Treat it as frozen while another session is active. If a task requires it,
coordinate ownership first and verify both navigation surfaces afterward.

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
