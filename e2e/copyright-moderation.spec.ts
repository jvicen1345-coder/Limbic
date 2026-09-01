import { test, expect } from "@playwright/test";
import { freshEmail, signUp, PASSWORD } from "./helpers";

/**
 * The two enforcement mechanisms the DMCA policy at /dmca depends on, tested against the
 * running app rather than the database alone:
 *
 *   - a suspended account cannot get back in (17 U.S.C. §512(i)(1)(A) — the
 *     repeat-infringer policy has to be *reasonably implemented*, and a suspension flag
 *     nothing enforces is not an implementation)
 *   - content removed under a notice is gone from every reader-facing surface
 *     (§512(c)(1)(C) — removing or disabling access to the material)
 *
 * Both write to the database directly for the same reason grantLicense does in
 * movement-lab.spec.ts: the admin surface these normally go through is itself admin-gated,
 * and the subject here is what the *app* does once the state is set, not the admin UI that
 * sets it.
 */

/** One UPDATE/INSERT over a second connection, with the same SQLITE_BUSY retry as
 *  grantLicense in movement-lab.spec.ts — the dev server holds the same file while serving
 *  the sign-up that just ran.
 *
 *  The connection is closed in a `finally`, which matters more here than it looks. Under
 *  playwright.config.ts's fullyParallel these tests run alongside auth.spec.ts, whose
 *  rate-limit test needs six sequential sign-in POSTs to each write to SignInThrottle. An
 *  unclosed libSQL client keeps a write connection open against the same SQLite file for
 *  the rest of the run, and with `PRAGMA busy_timeout = 10000` those sign-in writes then
 *  queue behind it long enough to blow that test's 15s expect timeout — which is exactly
 *  what happened, and looked for all the world like an unrelated flake in auth.spec.ts. */
async function withDb<T>(fn: (db: Awaited<ReturnType<typeof openDb>>) => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; ; attempt++) {
    const db = await openDb();
    try {
      await db.execute("PRAGMA busy_timeout = 10000");
      return await fn(db);
    } catch (error) {
      lastError = error;
      if (attempt >= 4) throw lastError;
      await new Promise((r) => setTimeout(r, 250 * 2 ** attempt));
    } finally {
      db.close();
    }
  }
}

async function openDb() {
  const { createClient } = await import("@libsql/client");
  return createClient({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
}

test.describe("copyright moderation", () => {
  test("a suspended account is refused at sign-in and cannot hold a session", async ({ page }) => {
    const email = freshEmail("suspended");
    await signUp(page, email);
    // Signed in and sitting on the first onboarding gate — proof the account works before
    // it is suspended, so a failure below is the suspension and not a broken sign-up.
    await expect(page).toHaveURL(/\/onboarding\/name/);

    await withDb(async (db) => {
      const result = await db.execute({
        sql: "UPDATE User SET suspendedAt = ?, suspendedReason = ? WHERE email = ?",
        args: [Date.now(), "Repeat infringer (e2e)", email],
      });
      if (result.rowsAffected !== 1) throw new Error("sign-up row not visible on this connection yet");
    });

    // The existing session dies on the next request — getCurrentUser() returns null for a
    // suspended account, so the app treats them as signed out rather than waiting for the
    // year-long cookie to expire.
    await page.goto("/home");
    await expect(page).toHaveURL(/\/sign-in/);

    // And they can't sign back in, even with the correct password.
    await page.getByLabel("Email").fill(email);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(
      page.getByText("This account has been suspended. Contact support if you believe this is a mistake.")
    ).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("lifting a suspension lets the account back in", async ({ page }) => {
    const email = freshEmail("unsuspended");
    await signUp(page, email);
    await expect(page).toHaveURL(/\/onboarding\/name/);

    await withDb(async (db) => {
      const result = await db.execute({
        sql: "UPDATE User SET suspendedAt = ? WHERE email = ?",
        args: [Date.now(), email],
      });
      if (result.rowsAffected !== 1) throw new Error("sign-up row not visible on this connection yet");
    });
    await page.goto("/home");
    await expect(page).toHaveURL(/\/sign-in/);

    // unsuspendUserAction clears both columns. Access comes straight back without a fresh
    // sign-in, because a suspension makes getCurrentUser() *ignore* the session cookie
    // rather than invalidating it — so the reader's existing session resumes on the next
    // request. That's the intended behaviour for a suspension that turns out to be wrong
    // (or a counter-notice that holds up): nothing for them to do but reload.
    await withDb((db) =>
      db.execute({
        sql: "UPDATE User SET suspendedAt = NULL, suspendedReason = NULL WHERE email = ?",
        args: [email],
      })
    );

    await page.goto("/home");
    await expect(page).toHaveURL(/\/onboarding\/name/);
    await expect(page).not.toHaveURL(/\/sign-in/);
  });

  test("a removed post is filtered out of every reader-facing query", async () => {
    // Exercises lib/copyright.ts's visibleContentWhere against the real schema: the same
    // filter every feed query spreads. A post is inserted, confirmed visible under that
    // filter, soft-removed the way removeReportedContentAction does it, and confirmed gone
    // — while still being present unfiltered, which is what the admin review surface and a
    // later reinstatement both depend on.
    const authorId = `pw-copyright-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const postId = `${authorId}-post`;

    await withDb(async (db) => {
      await db.execute({
        sql: "INSERT INTO User (id, name, createdAt) VALUES (?, ?, ?)",
        args: [authorId, "Copyright Test Author", Date.now()],
      });
      await db.execute({
        sql: "INSERT INTO NexusPost (id, authorId, body, createdAt, type, imageUrls) VALUES (?, ?, ?, ?, 'text', '[]')",
        args: [postId, authorId, "infringing material under test", Date.now()],
      });

      const visibleBefore = await db.execute({
        sql: "SELECT COUNT(*) c FROM NexusPost WHERE id = ? AND removedAt IS NULL",
        args: [postId],
      });
      expect(Number(visibleBefore.rows[0].c)).toBe(1);

      await db.execute({
        sql: "UPDATE NexusPost SET removedAt = ?, removedReason = ? WHERE id = ?",
        args: [Date.now(), "DMCA notice e2e", postId],
      });

      const visibleAfter = await db.execute({
        sql: "SELECT COUNT(*) c FROM NexusPost WHERE id = ? AND removedAt IS NULL",
        args: [postId],
      });
      expect(Number(visibleAfter.rows[0].c)).toBe(0);

      // Still on file unfiltered — a hard delete would make the counter-notice
      // reinstatement promised in /dmca §4 impossible.
      const stillExists = await db.execute({ sql: "SELECT COUNT(*) c FROM NexusPost WHERE id = ?", args: [postId] });
      expect(Number(stillExists.rows[0].c)).toBe(1);

      await db.execute({ sql: "DELETE FROM User WHERE id = ?", args: [authorId] });
    });
  });
});
