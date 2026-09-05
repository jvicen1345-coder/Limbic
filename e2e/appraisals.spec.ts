import { test, expect } from "@playwright/test";
import { freshEmail, signUpAndEnterApp } from "./helpers";

/**
 * The reader-facing half of Limbic Appraisals (see lib/appraisal.ts, lib/appraisals-feed.ts).
 *
 * Two things are worth pinning down against the running app rather than against the pure
 * functions alone. A published appraisal has to carry the deterministic findings *and* the
 * provenance note — those are appended in lib/appraisals-feed.ts rather than written by
 * anyone, and they are the two paragraphs that would be easiest to lose in a refactor and
 * hardest to notice missing. And a draft has to 404: the whole publish/unpublish split is
 * pointless if an unpublished appraisal is readable by anyone who has the id.
 *
 * Rows are inserted straight into the database, for the same reason copyright-moderation.spec.ts
 * does it: the authoring surface is admin-gated, and the subject here is what a *reader*
 * gets once a row exists, not the editor that creates it.
 */

/** One write over a second connection, with the same SQLITE_BUSY retry and the same
 *  close-in-finally as copyright-moderation.spec.ts — see the long note there on why an
 *  unclosed libSQL client surfaces as an unrelated flake in auth.spec.ts. */
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

/** The numbers are the case the feature exists for: a result that clears statistical
 *  significance and fails to clear the MCID. If the deterministic layer ever stops saying
 *  so, this test goes red on the sentence a reader would have been misled by. */
function appraisalInput(title: string) {
  return {
    title,
    authors: "Okonkwo et al.",
    journal: "Journal of Orthopaedic & Sports Physical Therapy",
    year: 2026,
    doi: "10.2519/jospt.2026.99999",
    pmid: "",
    sourceUrl: "",
    design: "Randomised controlled trial",
    population: "Adults with chronic low back pain",
    setting: "Outpatient",
    intervention: "Supervised motor control exercise",
    comparator: "General exercise",
    followUpWeeks: 12,
    nRandomised: 120,
    nAnalysed: 96,
    primaryOutcomeName: "NPRS pain at 12 weeks",
    effectMeasure: "difference",
    effectPoint: -1.1,
    effectCiLower: -1.9,
    effectCiUpper: -0.3,
    effectUnit: "points on the NPRS",
    mcid: 2,
    mcidSource: "Salaffi 2004",
    pValue: "0.01",
    registered: true,
    registrationId: "NCT01234567",
    primaryOutcomeChanged: false,
    fundingSource: "University department funds",
    conflictsDeclared: true,
    sourceAccess: "abstract_only",
    notes: "Statistically significant and clinically irrelevant are not the same thing.",
  };
}

async function insertAppraisal(email: string, opts: { title: string; status: "draft" | "published" }) {
  return withDb(async (db) => {
    const user = await db.execute({ sql: "SELECT id FROM User WHERE email = ?", args: [email] });
    if (user.rows.length !== 1) throw new Error("sign-up row not visible on this connection yet");
    const authorId = String(user.rows[0].id);
    const id = `e2e-appraisal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();
    await db.execute({
      sql: `INSERT INTO StudyAppraisal
              (id, createdAt, updatedAt, publishedAt, authorId, status, input, summary, body, specialty, tags, sourceAccess, doi)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        now,
        now,
        opts.status === "published" ? now : null,
        authorId,
        opts.status,
        JSON.stringify(appraisalInput(opts.title)),
        "A significant result that never reaches the smallest difference a patient would notice.",
        JSON.stringify(["The trial randomised 120 adults with chronic low back pain to motor control exercise or general exercise."]),
        "ortho",
        JSON.stringify(["low back pain"]),
        "abstract_only",
        "10.2519/jospt.2026.99999",
      ],
    });
    return id;
  });
}

test.describe("appraisals", () => {
  test("a published appraisal carries the computed findings and the provenance note", async ({ page }) => {
    const email = freshEmail("appraisal-reader");
    await signUpAndEnterApp(page, email);

    const title = `Motor control exercise for chronic low back pain ${Date.now()}`;
    const id = await insertAppraisal(email, { title, status: "published" });

    await page.goto(`/article/appraisal-${id}`);
    await expect(page.getByText(title).first()).toBeVisible();

    // The finding that matters, generated by runAppraisalChecks() and not by any model.
    await expect(
      page.getByText("is smaller than the MCID of 2 points on the NPRS", { exact: false }).first(),
    ).toBeVisible();
    // The attrition the abstract would not have mentioned: 120 randomised, 96 analysed.
    await expect(page.getByText("(20%) were not in the analysis", { exact: false }).first()).toBeVisible();
    // And the standing disclosure that no paper was ever handed to a model.
    await expect(page.getByText("the paper itself was never uploaded anywhere", { exact: false }).first()).toBeVisible();
  });

  test("an unpublished appraisal is not readable", async ({ page }) => {
    const email = freshEmail("appraisal-draft");
    await signUpAndEnterApp(page, email);

    const id = await insertAppraisal(email, { title: `Draft appraisal ${Date.now()}`, status: "draft" });

    const response = await page.goto(`/article/appraisal-${id}`);
    expect(response?.status()).toBe(404);
  });
});
