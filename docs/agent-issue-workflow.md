# Agent issue workflow

Use this workflow for every issue-based change. The goal is not only to make the code
change, but to establish what the issue means, keep its record current, and explain the
effect on the website in terms a reviewer or product owner can understand.

## Standing roles

- **Limbic Intake** claims first (up to two issues). It must not launch CloudAgent
  until **Limbic Triage** says the claimed issue is current. After that, it
  implements via Cursor CloudAgent on environment `limbic-env`, following the
  rest of this workflow and `COORDINATION.md`.
- **Limbic Triage (Grok Bot)** is claim-gated: it does not run a scheduled
  unclaimed sweep and has no weekday triage cron. It wakes on issue-assigned
  (or a ping) and refreshes that claimed issue against `origin/main` via
  authenticated `gh` (title, body, acceptance criteria, and labels); then
  comments that the issue is current. Issue writes use `gh` as Evicencio-05
  (push + triage). Cloud agents and the GitHub connector PAT receive 403 on
  issue writes. Do not tell implementers to edit issues themselves.
- **Limbic Issue Bot** owns this document and ad-hoc desk / merge digest work. It does
  not run standing intake or triage.

**Observed:** collaborator JV (`jvicen1345-coder`) does not have the Grok Bot fleet
and merges their own PRs on GitHub without pre-merge fleet review. After those
merges, **Limbic Issue Bot** reviews the landed change (PR Review; UX if the
change is UI; Security if auth/XSS), files follow-up issues via `gh`, and
**Limbic Intake** / **Limbic Triage** claim and fix them. Do not block or revert
those merges. Fleet-authored PRs still get pre-merge clearance when asked.

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
