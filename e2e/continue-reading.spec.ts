import { test, expect } from "@playwright/test";
import { freshEmail, signUpAndEnterApp } from "./helpers";
import { CONTINUE_READING_FINISHED_THRESHOLD, SHORT_ARTICLE_DWELL_MS } from "@/lib/reading-progress";

const NECK = {
  id: "cpg-neck-pain-2017",
  title: "Neck Pain: Revision 2017",
};
const BACK = {
  id: "cpg-low-back-pain-2021",
  title: "Interventions for the Management of Acute and Chronic Low Back Pain: Revision 2021",
};
const HIP = {
  id: "cpg-hip-oa-2025",
  title: "Hip Pain and Mobility Deficits, Hip Osteoarthritis: Revision 2025",
};

/** Same SQLITE_BUSY retry + close-in-finally as appraisals.spec.ts — a second connection
 *  against the shared local SQLite file while the server is writing. */
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

async function userIdFor(email: string): Promise<string> {
  return withDb(async (db) => {
    const user = await db.execute({ sql: "SELECT id FROM User WHERE email = ?", args: [email] });
    if (user.rows.length !== 1) throw new Error(`no User row for ${email}`);
    return String(user.rows[0].id);
  });
}

async function upsertRead(
  email: string,
  articleId: string,
  scrollProgress: number,
  updatedAt: Date
): Promise<void> {
  const userId = await userIdFor(email);
  await withDb(async (db) => {
    const existing = await db.execute({
      sql: "SELECT id FROM ReadArticle WHERE userId = ? AND articleId = ?",
      args: [userId, articleId],
    });
    const stamp = updatedAt.toISOString();
    if (existing.rows.length === 1) {
      await db.execute({
        sql: "UPDATE ReadArticle SET scrollProgress = ?, updatedAt = ? WHERE id = ?",
        args: [scrollProgress, stamp, String(existing.rows[0].id)],
      });
      return;
    }
    await db.execute({
      sql: `INSERT INTO ReadArticle (id, userId, articleId, createdAt, scrollProgress, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [`e2e-read-${articleId}-${Date.now()}`, userId, articleId, stamp, scrollProgress, stamp],
    });
  });
}

async function scrollProgressFor(email: string, articleId: string): Promise<number | null> {
  const userId = await userIdFor(email);
  return withDb(async (db) => {
    const row = await db.execute({
      sql: "SELECT scrollProgress FROM ReadArticle WHERE userId = ? AND articleId = ?",
      args: [userId, articleId],
    });
    if (row.rows.length === 0) return null;
    return Number(row.rows[0].scrollProgress);
  });
}

function continueCard(page: import("@playwright/test").Page) {
  return page.locator(".home-aside-scroll > .card").filter({ hasText: "Continue reading" });
}

test.describe("Continue Reading", () => {
  test("Home card skips finished reads and hides when nothing is unfinished", async ({ page }) => {
    const email = freshEmail("continue-card");
    await signUpAndEnterApp(page, email);
    await page.goto("/home");
    await expect(continueCard(page)).toHaveCount(0);

    const t0 = Date.now();
    await upsertRead(email, NECK.id, 1, new Date(t0));
    await page.goto("/home");
    await expect(continueCard(page)).toHaveCount(0);

    await upsertRead(email, BACK.id, 0.4, new Date(t0 - 60_000));
    await page.goto("/home");
    const card = continueCard(page);
    await expect(card).toHaveCount(1);
    await expect(card).toContainText(BACK.title);
    await expect(card).toContainText("40% read");
    await expect(card.locator(".progress-bar-fill")).toHaveAttribute("style", /width:\s*40%/);
    await expect(card.getByRole("link", { name: "Continue Reading" })).toBeVisible();

    await upsertRead(email, HIP.id, 0.2, new Date(t0 + 60_000));
    await page.goto("/home");
    await expect(continueCard(page)).toContainText(HIP.title);
    await expect(continueCard(page)).toContainText("20% read");

    await upsertRead(email, BACK.id, 1, new Date(t0 - 60_000));
    await upsertRead(email, HIP.id, CONTINUE_READING_FINISHED_THRESHOLD, new Date(t0 + 60_000));
    await page.goto("/home");
    await expect(continueCard(page)).toHaveCount(0);

    await upsertRead(email, "live-churned-out", 0.5, new Date(t0 + 120_000));
    await page.goto("/home");
    await expect(continueCard(page)).toHaveCount(0);
  });

  test("a no-scroll-room article is not 100% on open-and-leave, but is after a short dwell", async ({
    page,
  }) => {
    const email = freshEmail("continue-dwell");
    await signUpAndEnterApp(page, email);

    // Apply before the tracker mounts so the no-scroll-room path is the one under test,
    // not a post-paint layout tweak. 12000px makes .app-main taller than the article.
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = ".app-main { height: 12000px !important; }";
      document.documentElement.appendChild(style);
    });

    await page.goto(`/article/${NECK.id}`);
    await expect(page.getByRole("heading", { name: NECK.title })).toBeVisible();
    await page.goto("/home");
    // Give a buggy unmount flush time to land before asserting it did not.
    await new Promise((r) => setTimeout(r, 1500));
    const bounced = await scrollProgressFor(email, NECK.id);
    expect(bounced, "open-and-leave must create a read row").not.toBeNull();
    expect(bounced ?? 1).toBeLessThan(CONTINUE_READING_FINISHED_THRESHOLD);

    await page.goto(`/article/${NECK.id}`);
    await expect(page.getByRole("heading", { name: NECK.title })).toBeVisible();
    await expect
      .poll(() => scrollProgressFor(email, NECK.id), {
        timeout: SHORT_ARTICLE_DWELL_MS + 5_000,
      })
      .toBe(1);

    await page.goto("/home");
    await expect(continueCard(page)).toHaveCount(0);
  });

  test("scrolling a long article still reports partial progress on leave", async ({ page }) => {
    const email = freshEmail("continue-scroll");
    await signUpAndEnterApp(page, email);
    await page.setViewportSize({ width: 1280, height: 640 });

    await page.goto(`/article/${NECK.id}`);
    await expect(page.getByRole("heading", { name: NECK.title })).toBeVisible();

    const scrolled = await page.locator(".app-main").evaluate((el) => {
      const scrollable = el.scrollHeight - el.clientHeight;
      if (scrollable <= 0) return 0;
      el.scrollTop = scrollable * 0.4;
      return el.scrollTop / scrollable;
    });
    expect(scrolled, "article page must have scroll room at this viewport").toBeGreaterThan(0.2);

    await page.goto("/home");
    const card = continueCard(page);
    await expect(card).toHaveCount(1);
    await expect(card).toContainText(NECK.title);
    await expect(card).toContainText("% read");
    const label = await card.locator("div").filter({ hasText: /% read/ }).last().textContent();
    const pct = Number(label?.replace("% read", "").trim());
    expect(pct).toBeGreaterThanOrEqual(20);
    expect(pct).toBeLessThan(95);
  });
});
