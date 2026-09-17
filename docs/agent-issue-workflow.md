# Agent issue workflow

Use this workflow for every issue-based change. The goal is not only to make the code
change, but to establish what the issue means, keep its record current, and explain the
effect on the website in terms a reviewer or product owner can understand.

## Standing roles

- **Limbic Intake** claims first (up to two issues). It must not launch CloudAgent
  until **Limbic Triage** says the claimed issue is current. After that, it
  implements via Cursor CloudAgent on environment `limbic-env`, following the
  rest of this workflow and `COORDINATION.md`. Fleet PRs (not JV) move without
  a user ask: claim → triage vs main → CloudAgent `limbic-env` → review →
  HOLD/nit fix on the same branch → `Fleet CLEAR` → merge and delete the head
  branch. On HOLD, Core pings Intake to fix on the same PR branch; Intake does
  not open a second PR. Fixable nits (in-scope on this PR) block merge until
  Intake applies them on the same branch.
- **Limbic Triage (Grok Bot)** is claim-gated: it does not run a scheduled
  unclaimed sweep and has no weekday triage cron. It wakes on issue-assigned
  (or a ping) and refreshes that claimed issue against `origin/main` via
  authenticated `gh` (title, body, acceptance criteria, and labels); then
  comments that the issue is current. Issue writes use `gh` as Evicencio-05
  (push + triage). Cloud agents and the GitHub connector PAT receive 403 on
  issue writes. Do not tell implementers to edit issues themselves.
- **Limbic Core** (the fleet desk; formerly Limbic Issue Bot) owns this document
  and ad-hoc desk / merge digest work. It does not run standing intake or triage.
  Fleet PRs (not JV) move without a user ask through that same path. Core marks
  a green Evicencio-05/Cursor draft ready (`gh pr ready`) instead of leaving it
  in draft. When the fleet has cleared a PR for merge — required reviewers,
  mergeable, and Typecheck/lint, Playwright, and Vercel green — Limbic Core
  posts one GitHub PR comment via authenticated `gh` starting with the exact
  text `Fleet CLEAR`, listing UX / PR Review / Security as CLEAR or N/A. That
  comment also includes a Nits section: each open nit is one line with source
  (PR Review / UX / Security) and the finding, or `Nits: none`. HOLD still
  blocks the stamp; nits do not. Do not comment from green CI alone. Review
  bots stay chat-only (no GitHub review comments) but must report CLEAR/HOLD +
  nits to Limbic Core. Core writes the GitHub notes. On HOLD, Core pings Intake
  to fix on the same PR branch; Intake does not open a second PR. JV
  self-merges are not expected to have this stamp before merge; a merged
  fleet-authored PR without `Fleet CLEAR` was not fleet-cleared. After a later
  push, Core posts a follow-up comment starting with `Nits resolved` when every
  listed nit is fixed, or `Nits remaining` listing what was not fixed (and any
  new nits). Unfixed nits stay on the PR as future-risk notes. Do not file a
  GitHub issue for a leftover nit unless it is now a real bug. Fixable nits
  (in-scope on this PR) block merge until Intake applies them on the same
  branch. Pre-existing or by-design nits are written on the PR and do not block
  merge. When `Fleet CLEAR` is on the current tip and the Nits section is
  `Nits: none`, Core merges the PR via authenticated `gh` and deletes the head
  branch. When Core later posts `Nits resolved` (all listed nits fixed, still
  mergeable, CI green, not draft), Core merges and deletes the head branch. Do
  not merge on HOLD, `Nits remaining`, draft, or red/pending CI. JV
  (`jvicen1345-coder`) self-merges are not this path; do not block or revert
  those merges. The user can still ask Core to merge a specific PR that turn.

**Observed:** collaborator JV (`jvicen1345-coder`) does not have the Grok Bot fleet
and merges their own PRs on GitHub without pre-merge fleet review. After those
merges, **Limbic Core** reviews the landed change (PR Review; UX if the
change is UI; Security if auth/XSS), files follow-up issues via `gh`, and
**Limbic Intake** / **Limbic Triage** claim and fix them. Do not block or revert
those merges. JV (`jvicen1345-coder`) still self-merges; do not block or revert.
Fleet-authored PRs move through the standing pipeline without a user ask.

## 1. Establish the issue as the current source of work

- Identify the exact issue, repository, and current branch/base branch.
- Read the issue title, body, labels, comments, linked pull requests, and related issues.
- Compare the issue with the current repository and `origin/main`; do not assume the issue's
  original description still matches the product.
- After Intake claims the issue, refreshing the title, description, scope, links, labels,
  and acceptance criteria is Limbic Triage's job. Implementers do not edit the issue.
- Intake must not launch CloudAgent until Triage comments that the claimed issue is current.
- Implementers record **Observed** when Triage has already marked the issue current, or when an
  issue write returned 403.
- Separate facts observed in the issue or repository from inferences and requested behavior.

If GitHub access is unavailable or unauthenticated, do not invent issue metadata or claim that
the issue was updated. Prepare the exact proposed issue update in the working report instead.

## 2. Understand the behavior completely

- Locate the user-facing route or entry point and reproduce the current behavior when possible.
- Trace the relevant components, Server Actions, data access, authorization/entitlement
  checks, persistence, external integrations, and error/fallback paths.
- Check desktop and mobile behavior, authenticated and guest states, and affected roles or
  subscription tiers where applicable.
- Inspect recent `main` history and related branches/PRs for fixes, reversions, or competing
  implementations before choosing an approach.
- Write explicit acceptance criteria covering the reported case, expected behavior, and
  meaningful edge cases.
- Record unresolved questions and stop for clarification when they would materially change
  the expected behavior or implementation.

## 3. Plan the change before editing

The plan must state:

- the affected user journeys, routes, and implementation areas;
- the data-flow, authorization, persistence, external-service, and migration consequences;
- desktop/mobile and responsive considerations;
- accessibility, security, privacy, SEO, and performance considerations when relevant;
- failure modes, fallback behavior, compatibility constraints, and non-goals; and
- the tests and manual checks that will prove the acceptance criteria.

Keep the change scoped to the issue. Do not fold unrelated cleanup into the implementation.

## 4. Implement and verify

- Implement against the confirmed acceptance criteria and preserve existing behavior outside
  the issue scope.
- Run the narrowest useful checks first, then `npm run typecheck`, `npm run lint`, and the
  relevant Playwright tests. Run the full suite when the change crosses shared or end-to-end
  behavior.
- Perform a manual or visual check for user-facing changes, including the relevant viewport,
  auth state, and role/tier state.
- Report failures honestly with the command, affected scenario, and whether the failure is
  caused by the change, the baseline, or the environment.

## 5. Report the website effect and close the loop

The completion report must include:

- **Issue status:** current issue state, acceptance criteria, and any proposed or completed
  issue update.
- **What changed:** concise implementation summary tied to the criteria.
- **Website effect:** affected routes; visible UI/content; interaction and navigation changes;
  desktop/mobile behavior; guest/authenticated/role/tier differences; data or persistence
  effects; and operational, external-service, SEO, accessibility, or performance effects.
- **What did not change:** important unaffected journeys or explicit non-goals.
- **Verification:** commands run, targeted/full test results, and manual or visual checks.
- **Known limitations:** unresolved questions, environment limitations, follow-up work, and
  rollback or migration concerns.

Use the labels **Observed**, **Inferred**, **Requested**, and **Completed** when those
distinctions could otherwise be unclear. Never describe a planned change as completed or an
inference as a repository fact.
