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
