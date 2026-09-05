import { defineConfig, devices } from "@playwright/test";

/** Runs against a real local server + the local SQLite dev.db (same DATABASE_URL a
 *  contributor already uses per README's "Local development" section) — there's no mocked
 *  backend, so the server needs a working `.env` (copy `.env.example`) before `npm test`.
 *
 *  Which server depends on where this runs, and that difference is the point:
 *
 *  Locally, `webServer` starts `next dev` if nothing is already on :3000 and reuses it
 *  otherwise, so `npm run dev` + `npm test` in two terminals still works and a failing test
 *  can be re-run against the same hot server you were just editing against.
 *
 *  Under CI it builds first and serves the build. `next dev` compiles each route on first
 *  request, and with fullyParallel every worker signs up at once and hits those routes cold
 *  together — so the suite was really measuring compile contention, and the helpers' waits
 *  had been stretched twice (25s on the first onboarding gate, 20s on the last) to absorb it.
 *  They still weren't enough: runs failed intermittently on main itself, on tests unrelated
 *  to the change under test, which is worse than a slow suite because it teaches everyone to
 *  re-run rather than read the failure. `next start` serves a finished build with no
 *  on-demand compilation, which removes that whole class of failure rather than widening a
 *  timeout again — and it tests what actually ships. */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  /* Playwright's default is 30s, which is less than the waits this suite's own helpers are
   * documented to need, so a slow moment killed tests that were still working correctly:
   *
   *   completeFirstRun (e2e/helpers.ts)  25s on the first gate (a cold `next dev` compile of
   *                                      /onboarding/name) + 20s on the last (a server action
   *                                      plus revalidate under parallel workers)
   *   grantLicense (movement-lab.spec)   up to 5 attempts against SQLite, each with a 10s
   *                                      busy_timeout, plus ~3.75s of backoff between them
   *
   * A test doing both could legitimately spend well over 30s without anything being wrong.
   * That showed up as a ~1-in-7 flake where the whole run slowed down and several tests hit
   * the 30s ceiling at once — a budget problem, not a race. 90s comfortably clears the
   * documented worst case while still failing a genuinely hung test in reasonable time.
   * Individual expects keep their own (shorter) timeouts, so a real bug still fails fast. */
  timeout: 90_000,
  /* Playwright's default expect timeout is 5s. Every assertion in this suite waits on
   * something the *dev server* has to produce — a redirect, a server action's result, an
   * error message rendered after a form post — and `next dev` compiles on demand and shares
   * a machine with the browser and the other worker. Four separate failures traced back to a
   * 5s expect losing that race while the app was working correctly, each on a different
   * assertion, which is what made it look like several unrelated flaky tests.
   *
   * 15s is still short enough that a genuinely broken expectation fails quickly, and the 90s
   * test timeout above remains the real ceiling. Assertions that deliberately want a
   * different window (the helpers' 20s/25s waits) pass their own timeout and are unaffected. */
  expect: { timeout: 15_000 },
  /* Warms the routes the first-run flow walks before any test starts — see e2e/global-setup.ts.
   * `next dev` compiles on first request, and paying for that inside a test is what made the
   * timing tight enough to matter in the first place. */
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Escape hatch for a sandboxed/CI runner with a pre-installed Chromium build that
        // doesn't match this package's pinned version (`playwright install` can't reach the
        // network there) — unset in normal local/CI use, where Playwright's own browser
        // management just works.
        ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
          ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } }
          : {}),
      },
    },
  ],
  webServer: {
    // `npm run build` is apply-migrations + next build. CI already ran the migration step
    // before invoking this, but it's idempotent, so running it again just prints "No
    // pending migrations" — cheaper than a second, subtly different build command to keep
    // in sync with package.json.
    command: process.env.CI ? "npm run build && npm run start" : "npm run dev",
    url: "http://localhost:3000",
    // Never reuse in CI: a stale server from an earlier step would silently serve different
    // code than the one this config just built.
    reuseExistingServer: !process.env.CI,
    // The CI budget has to cover a full production build, not just a server boot.
    timeout: process.env.CI ? 300_000 : 60_000,
  },
});
