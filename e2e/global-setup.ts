import { chromium, type FullConfig } from "@playwright/test";
import { deletePlaywrightUsers, testDatabaseUrl } from "./helpers";

/**
 * Warms the routes the first-run flow walks, once, before any test runs.
 *
 * `next dev` compiles a route on its first request, so without this the first test to reach
 * /onboarding/name paid for compiling it *inside* its own timeout — and because
 * playwright.config.ts runs fullyParallel, several workers could arrive at an uncompiled
 * route simultaneously and all sit through the same compile. That is what made the suite's
 * timing tight enough to produce an intermittent failure with nothing actually broken.
 *
 * Deliberately best-effort: a failed warm-up is not a reason to fail the run. If the server
 * is not up yet or a request errors, the tests still work exactly as they did before — they
 * just pay the compile cost themselves, which is the old behaviour, not a new failure.
 */
async function warm(url: string, signal: AbortSignal) {
  try {
    await fetch(url, { signal, redirect: "manual" });
  } catch {
    // Ignore — see the note above about this being best-effort.
  }
}

/**
 * Puts the local SQLite database into WAL mode.
 *
 * This is the actual cause of the suite's intermittent failures. The dev database was in
 * SQLite's default `delete` journal mode with `busy_timeout = 0`, which means a writer takes
 * an exclusive lock over the whole file and every other connection fails *immediately* with
 * SQLITE_BUSY rather than waiting. With playwright.config.ts running fullyParallel, several
 * workers sign up accounts (a write) at the same time as the test process grants a license
 * (another write, on its own connection), so they collided regularly. It surfaced three
 * different ways depending on who lost the race — a raw `SQLITE_BUSY: database is locked`
 * out of grantLicense, a sign-up that never navigated to /onboarding/name, or a redirect that
 * did not land inside its 5s expect — which is why it read as three unrelated flaky tests.
 *
 * WAL lets readers proceed while a write is in flight and makes writers queue rather than
 * fail outright. It is a persistent property of the database file, not of a connection, so
 * setting it here applies to the dev server's connections too — which is the point, since
 * those are the ones doing the sign-up writes and they set no pragmas of their own.
 *
 * Only touches a local file database; a hosted libsql:// URL (Turso, production) has real
 * concurrency and no journal mode to set.
 */
async function enableWal(databaseUrl: string) {
  if (!databaseUrl.startsWith("file:")) return;
  const { createClient } = await import("@libsql/client");
  const db = createClient({ url: databaseUrl });
  try {
    await db.execute("PRAGMA busy_timeout = 10000");
    await db.execute("PRAGMA journal_mode = WAL");
  } catch {
    // Best-effort, same as the warm-up: if this fails the suite behaves as it did before.
  } finally {
    db.close();
  }
}

/** Test accounts must never land in Turso. CI and local runs both use a file: URL;
 *  a remote URL is a configuration mistake, and one thrown here is easier to read than
 *  dozens of "no User row" failures after the server has already written to production. */
function assertLocalDatabase(databaseUrl: string) {
  if (databaseUrl.startsWith("file:")) return;
  throw new Error(
    `Playwright refused to start against ${databaseUrl}. The suite writes test accounts and only runs against a local file: SQLite database, never Turso. Set DATABASE_URL or PLAYWRIGHT_DATABASE_URL to a file: URL.`,
  );
}

/** Compiles signInAction and signUpAction before any test's 15s expect.
 *
 *  global setup already fetches /sign-in, which compiles the page. The server actions
 *  those forms post to are a separate compile on `next dev`, and the first failed
 *  sign-in in auth.spec.ts was losing that race. Paying for it here, once, leaves the
 *  assertion's own timeout for the assertion. */
async function warmAuthActions(baseURL: string) {
  const browser = await chromium.launch(
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {},
  );
  try {
    const page = await browser.newPage({ baseURL });
    page.setDefaultTimeout(60_000);
    page.setDefaultNavigationTimeout(60_000);
    const email = "pw-warm-auth@example.com";

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.getByText("Incorrect email or password.").waitFor();

    await page.goto("/sign-in");
    await page.getByText("New here? Create an account").click();
    await page.getByLabel("Email").fill(email);
    const passwords = page.locator('input[type="password"]');
    await passwords.nth(0).fill("TestPass123!");
    await passwords.nth(1).fill("DifferentPass123!");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Create account" }).click();
    await page.getByText("Those passwords don't match.").waitFor();
  } finally {
    await browser.close();
  }
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3000";
  const databaseUrl = testDatabaseUrl();
  assertLocalDatabase(databaseUrl);

  await enableWal(databaseUrl);
  await deletePlaywrightUsers();

  // Every route the specs navigate to (`grep -o 'page.goto("[^"]*"' e2e/*.ts`), plus the two
  // the first-run flow redirects through. Being signed out does not matter: a gated route
  // still has to be compiled before Next can decide to redirect, and that compile is the
  // expensive part. /pro/exercises is on the list for a concrete reason — a run failed with
  // its redirect to /movement-lab missing a 5s expect, which is exactly the shape of a
  // first-request compile landing inside an assertion.
  const routes = [
    "/",
    "/sign-in",
    "/onboarding/name",
    "/onboarding",
    "/home",
    "/hep",
    "/movement-lab",
    "/pro/exercises",
  ];

  const controller = new AbortController();
  const deadline = setTimeout(() => controller.abort(), 60_000);
  try {
    await Promise.all(routes.map((r) => warm(new URL(r, baseURL).toString(), controller.signal)));
  } finally {
    clearTimeout(deadline);
  }

  await warmAuthActions(String(baseURL));

  return async () => {
    await deletePlaywrightUsers();
  };
}
