import { expect, type Page } from "@playwright/test";

/**
 * Shared sign-up and first-run helpers.
 *
 * Not a `.spec.ts`, so Playwright's default testMatch (`**​/*.@(spec|test).?(c|m)[jt]s?(x)`)
 * skips it — it's imported, never collected.
 *
 * These live here because the first-run flow moved and only one of the two spec files that
 * walked it was updated: auth.spec.ts kept clicking "Skip for now" straight after sign-up
 * and timed out for weeks once a name step landed in front of it. Any spec that needs a
 * signed-in account should call `signUpAndEnterApp` rather than re-deriving the sequence, so
 * the next time a gate is added or reordered there is exactly one place to fix.
 */

/** Each caller gets its own email so tests can run in parallel without colliding on the same
 *  row in SignInThrottle/User — see playwright.config.ts's fullyParallel. */
export function freshEmail(label: string) {
  return `pw-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export const PASSWORD = "TestPass123!";

/** Accounts this suite creates. Cleanup deletes these and nothing else. */
const PLAYWRIGHT_EMAIL_LIKE = "pw-%@example.com";

/** The SQLite file this process writes to. `playwright.config.ts` loads `.env` and applies
 *  `PLAYWRIGHT_DATABASE_URL` before the web server starts, so this is the same URL the app
 *  is using. The `file:./dev.db` fallback is only for a helper imported outside that config. */
export function testDatabaseUrl() {
  return process.env.DATABASE_URL ?? "file:./dev.db";
}

/** The failure that used to read as a sign-up race. The URL is the part that distinguishes
 *  "the row is not committed yet" from "this connection is a different database than the
 *  server that just created the account". */
export function missingUserError(email: string, detail = "UPDATE affected 0 rows") {
  return new Error(
    `no User row for ${email} (${detail}) on database ${testDatabaseUrl()}. The dev server and this helper are not looking at the same database.`,
  );
}

async function openTestDb() {
  const { createClient } = await import("@libsql/client");
  return createClient({ url: testDatabaseUrl() });
}

/** One transaction-sized use of a second connection against the shared SQLite file.
 *
 *  Retries any error, not only SQLITE_BUSY. Callers throw when the sign-up row is not
 *  visible yet, and that has to be retried the same way a lock is — see `missingUserError`.
 *  The connection is closed in `finally` on every attempt. An unclosed libSQL client holds
 *  a write connection for the rest of the run; with `busy_timeout` the sign-in writes in
 *  auth.spec.ts then queue behind it long enough to blow a 15s expect, which looks like
 *  an unrelated auth flake. */
export async function withDb<T>(fn: (db: Awaited<ReturnType<typeof openTestDb>>) => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; ; attempt++) {
    const db = await openTestDb();
    try {
      await db.execute("PRAGMA busy_timeout = 10000");
      return await fn(db);
    } catch (error) {
      lastError = error;
      if (attempt >= 4) throw lastError;
      await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    } finally {
      db.close();
    }
  }
}

/** Deletes accounts this suite created, plus the throttle rows keyed by the same emails
 *  (those are not foreign keys, so they would otherwise survive the user delete).
 *
 *  Called at the start and the end of a run. Syllabus, StudyCard, and Assignment reference
 *  User without ON DELETE CASCADE, so they are removed first; everything else cascades
 *  once foreign keys are on. */
export async function deletePlaywrightUsers() {
  await withDb(async (db) => {
    const testUsers = { sql: "SELECT id FROM User WHERE email LIKE ?", args: [PLAYWRIGHT_EMAIL_LIKE] };
    await db.execute("PRAGMA foreign_keys = ON");
    await db.execute({
      sql: `DELETE FROM StudyCard WHERE userId IN (${testUsers.sql})`,
      args: testUsers.args,
    });
    await db.execute({
      sql: `DELETE FROM Assignment WHERE userId IN (${testUsers.sql})`,
      args: testUsers.args,
    });
    await db.execute({
      sql: `DELETE FROM Syllabus WHERE userId IN (${testUsers.sql})`,
      args: testUsers.args,
    });
    await db.execute({
      sql: "DELETE FROM SignInThrottle WHERE email LIKE ?",
      args: [PLAYWRIGHT_EMAIL_LIKE],
    });
    await db.execute({
      sql: "DELETE FROM PasswordResetThrottle WHERE email LIKE ?",
      args: [PLAYWRIGHT_EMAIL_LIKE],
    });
    await db.execute({
      sql: "DELETE FROM User WHERE email LIKE ?",
      args: [PLAYWRIGHT_EMAIL_LIKE],
    });
  });
}

/** Creates the account and stops there, on whatever the first onboarding gate currently is.
 *  Callers that only need the account to exist (the sign-in and rate-limit tests) use this
 *  directly and never enter the app. */
export async function signUp(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByText("New here? Create an account").click();
  await page.getByLabel("Email").fill(email);
  const passwordFields = page.locator('input[type="password"]');
  await passwordFields.nth(0).fill(PASSWORD);
  await passwordFields.nth(1).fill(PASSWORD);
  // Clickwrap assent (components/SignInForm.tsx AcceptTermsField) — required, and enforced
  // server-side in app/actions/auth.ts, so no account is created without ticking it.
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create account" }).click();
}

/**
 * Clears the three first-run gates app/(app)/layout.tsx enforces, in the order it enforces
 * them:
 *
 *   1. `hasSetName`            → redirect to /onboarding/name
 *   2. `hasOnboarded`          → redirect to /onboarding (topic picker)
 *   3. `hasCompletedOnboarding`→ OnboardingRoleModal, rendered *in place* of the whole app
 *                                shell, so the URL is already /home while it is showing
 *
 * Picks "Physical Therapist" at the role step deliberately: "PT Student" adds a fourth
 * screen (the DPT program picker), while "Physical Therapist" and "General" go straight
 * through — see the note at the top of components/OnboardingRoleModal.tsx.
 *
 * The two routed gates are waited on by URL rather than assumed, so a step moving between
 * them surfaces as a clear URL-wait failure instead of a mystery click timeout.
 */
export async function completeFirstRun(page: Page, { firstName = "Pw", lastName = "Tester" } = {}) {
  // Longer wait on this first gate only, for local runs: playwright.config.ts's webServer
  // starts `next dev` there, which compiles each route on first request, so the first
  // sign-up of a run pays for compiling /onboarding/name on top of the request itself. The
  // later gates are warm. Under CI the same config serves a finished build instead and this
  // gate resolves in well under a second — the wait is kept as headroom for the local path,
  // not because CI still needs it.
  await page.waitForURL(/\/onboarding\/name/, { timeout: 25_000 });
  await page.getByLabel("First name").fill(firstName);
  await page.getByLabel("Last name").fill(lastName);
  await page.getByRole("button", { name: "Continue to Limbic" }).click();

  await page.waitForURL(/\/onboarding$/);
  await page.getByRole("button", { name: "Skip for now" }).click();

  await page.waitForURL(/\/home/);
  await page.getByRole("button", { name: /Physical Therapist/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  // The modal renders *instead of* AppShell, so the sidebar appearing is what says the
  // account is genuinely through — not a navigation, since the URL was already /home while
  // the modal was up. Waiting on the sidebar (a positive signal) rather than on the modal
  // disappearing also gives a far better failure message if a gate is ever added after this
  // one: "navigation not visible" rather than "the button you clicked is still there".
  //
  // The generous timeout is deliberate. Completing this step is a server action plus a
  // revalidate, and the default 5s is not always enough when several workers are signing up
  // at once — that showed up as an intermittent failure here under load, not as a bug. Most
  // of that load was `next dev` compiling routes under parallel workers, which CI no longer
  // does (see playwright.config.ts's webServer), but the local path still can.
  await expect(page.getByRole("navigation")).toBeVisible({ timeout: 20_000 });
}

/** Sign up and land inside the app, past every first-run gate. */
export async function signUpAndEnterApp(page: Page, email: string) {
  await signUp(page, email);
  await completeFirstRun(page);
}

/** Sets one column on a signed-up account directly, and waits out the lock if it has to.
 *
 * Some surfaces are gated on state a fresh sign-up doesn't have — a licence on file, a paid
 * tier — and the real routes to it (Profile → Credentials, Stripe checkout) are not what the
 * test is about. This is the smallest way in. The dev server and this process share the same
 * local SQLite file (see playwright.config.ts), so the write is visible to the next request.
 *
 * Goes through @libsql/client rather than lib/db.ts because that module imports the Prisma
 * client from the generated `@/generated/prisma/client`, which Playwright's TS loader can't
 * resolve — and this needs one UPDATE, not an ORM.
 *
 * That second connection is why it retries. SQLite takes a file-level write lock, and the dev
 * server holds the same file while serving the sign-up that just ran; under fullyParallel two
 * workers can also reach this line at once. Either produces SQLITE_BUSY. `PRAGMA busy_timeout`
 * makes SQLite wait for the lock instead of failing immediately, and the retry covers the case
 * where it waits the whole timeout out.
 *
 * `column` is interpolated into the SQL because a column name can't be bound as a parameter.
 * Every caller passes a literal from this repo, and the assertion below keeps it that way.
 */
export async function setUserColumn(email: string, column: string, value: string | number | null) {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(column)) throw new Error(`unsafe column name: ${column}`);
  let lastError: unknown;

  for (let attempt = 0; ; attempt++) {
    const db = await openTestDb();
    try {
      await db.execute("PRAGMA busy_timeout = 10000");
      const result = await db.execute({ sql: `UPDATE User SET ${column} = ? WHERE email = ?`, args: [value, email] });
      if (result.rowsAffected === 1) return;
      // Zero rows means the sign-up's row isn't visible on this connection yet, so it's
      // retryable like SQLITE_BUSY rather than fatal. Letting it through silently would
      // surface much later as a confusing locked page instead of the one under test, which
      // is why it's checked at all. The database URL is in the message so a config
      // mismatch is not mistaken for that race.
      lastError = missingUserError(email);
    } catch (error) {
      if (!String(error).includes("SQLITE_BUSY")) throw error;
      lastError = error;
    } finally {
      db.close();
    }
    if (attempt >= 4) throw lastError;
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
  }
}

/** One ReadArticle old enough to fall outside the agent's 7-day window. The article id is
 *  not in the feed, so recent topics stay empty ("No articles read in the past 7 days.")
 *  while neglected topics still fall back to the canonical specialties. */
export async function insertStaleRead(email: string) {
  const stamp = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const id = `stale-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let lastError: unknown;

  for (let attempt = 0; ; attempt++) {
    const db = await openTestDb();
    try {
      await db.execute("PRAGMA busy_timeout = 10000");
      const result = await db.execute({
        sql: `INSERT INTO ReadArticle (id, userId, articleId, scrollProgress, createdAt, updatedAt)
              SELECT ?, id, 'stale-gap-probe', 0, ?, ? FROM User WHERE email = ?`,
        args: [id, stamp, stamp, email],
      });
      if (result.rowsAffected === 1) return;
      lastError = missingUserError(email, `INSERT affected ${result.rowsAffected} rows`);
    } catch (error) {
      if (!String(error).includes("SQLITE_BUSY")) throw error;
      lastError = error;
    } finally {
      db.close();
    }
    if (attempt >= 4) throw lastError;
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
  }
}

/** Puts an account on the paid LimbicStudent tier — what Limbic Boards and the playbooks are
 *  gated on (studentTier in lib/session.ts). */
export async function grantLimbicStudent(email: string) {
  await setUserColumn(email, "studentTier", "limbicStudent");
}

/** Puts an account on paid LimbicPRO — Profile's subscription card and /profile/membership
 *  read isPro directly (via getCurrentUser's overlay). */
export async function grantLimbicPro(email: string) {
  await setUserColumn(email, "isPro", 1);
}
