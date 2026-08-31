import { defineConfig, devices } from "@playwright/test";

/** Runs against a real local dev server + the local SQLite dev.db (same DATABASE_URL a
 *  contributor already uses per README's "Local development" section) — there's no mocked
 *  backend, so `npm run dev` needs a working `.env` (copy `.env.example`) before `npm test`.
 *  `webServer` starts that dev server itself if one isn't already running on :3000, and
 *  reuses it otherwise (so `npm run dev` + `npm test` in two terminals works too). */
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
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
