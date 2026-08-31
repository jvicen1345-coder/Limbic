import type { FullConfig } from "@playwright/test";

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

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3000";

  await enableWal(process.env.DATABASE_URL ?? "file:./dev.db");

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
}
