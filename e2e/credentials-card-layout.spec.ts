import { test, expect, type Page } from "@playwright/test";
import { freshEmail, grantLimbicStudent, setUserColumn, signUpAndEnterApp } from "./helpers";

/** Same SQLITE_BUSY retry pattern as copyright-moderation.spec.ts / setUserColumn. */
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

async function seedPrimaryLicense(email: string, licenseNumber: string) {
  const expiration = new Date();
  expiration.setFullYear(expiration.getFullYear() + 1);
  const categories = JSON.stringify([
    { name: "Orthopedic", required: 20, completed: 8 },
    { name: "Ethics", required: 4, completed: 4 },
  ]);
  await setUserColumn(email, "licenseNumber", licenseNumber);
  await setUserColumn(email, "licenseState", "CA");
  await setUserColumn(email, "licenseExpiration", expiration.toISOString());
  await setUserColumn(email, "ceCategories", categories);
}

async function seedLicenseRows(
  email: string,
  rows: { state: string; licenseNumber: string; status: "verified" | "pending" | "rejected" }[],
) {
  await withDb(async (db) => {
    const user = await db.execute({ sql: "SELECT id FROM User WHERE email = ?", args: [email] });
    const userId = user.rows[0]?.id;
    if (typeof userId !== "string") throw new Error(`no User row for ${email}`);
    const now = new Date().toISOString();
    for (const [i, row] of rows.entries()) {
      const result = await db.execute({
        sql: `INSERT INTO License (id, userId, state, licenseNumber, fullName, status, attestation, submittedAt, verifiedAt)
              VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        args: [
          `pw-lic-${email}-${i}`,
          userId,
          row.state,
          row.licenseNumber,
          "Pw Tester",
          row.status,
          now,
          row.status === "verified" ? now : null,
        ],
      });
      if (result.rowsAffected !== 1) throw new Error(`failed to insert License ${row.state} for ${email}`);
    }
  });
}

async function openCredentials(page: Page) {
  await page.goto("/profile/credentials");
  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  await expect(page.locator(".credentials-stack")).toBeVisible();
}

function cardWidths(page: Page) {
  return page.locator(".credentials-stack > .card").evaluateAll((els) =>
    els.map((el) => Math.round(el.getBoundingClientRect().width)),
  );
}

test.describe("Credentials card layout", () => {
  test("student (no license): even cards, odd date field, empty License & CE", async ({ page }) => {
    const email = freshEmail("cred-layout-student");
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);
    await openCredentials(page);

    await expect(page.getByText("DPT Student")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add License" })).toHaveCount(0);
    await expect(page.getByText(/Once your license is verified/)).toBeVisible();
    await expect(page.locator(".license-ce-header")).toHaveCount(0);

    const fields = page.locator(".professional-dates-fields .field");
    await expect(fields).toHaveCount(7);

    const widths = await cardWidths(page);
    expect(widths.length).toBe(4);
    expect(new Set(widths).size).toBe(1);

    const pairTops = await page.locator(".professional-dates-fields .field > label").evaluateAll((labels) => {
      const tops: number[] = [];
      for (let i = 0; i + 1 < labels.length; i += 2) {
        tops.push(labels[i].getBoundingClientRect().top);
        tops.push(labels[i + 1].getBoundingClientRect().top);
      }
      return tops;
    });
    for (let i = 0; i < pairTops.length; i += 2) {
      expect(Math.abs(pairTops[i] - pairTops[i + 1])).toBeLessThan(2);
    }

    const lastField = fields.last();
    const grid = page.locator(".professional-dates-fields");
    const [lastBox, gridBox] = await Promise.all([lastField.boundingBox(), grid.boundingBox()]);
    expect(lastBox && gridBox).toBeTruthy();
    if (lastBox && gridBox) {
      expect(lastBox.width).toBeLessThan(gridBox.width * 0.6);
      expect(lastBox.x).toBeLessThan(gridBox.x + gridBox.width / 2);
    }
  });

  test("multi-license: CE bars, Add License modal, shared card width", async ({ page }) => {
    const email = freshEmail("cred-layout-lic");
    await signUpAndEnterApp(page, email);
    const number = `PW-${email}`;
    await seedPrimaryLicense(email, number);
    await seedLicenseRows(email, [
      { state: "CA", licenseNumber: `${number}-CA`, status: "verified" },
      { state: "NY", licenseNumber: `${number}-NY`, status: "pending" },
    ]);
    await openCredentials(page);

    await expect(page.locator(".license-row")).toHaveCount(2);
    await expect(page.getByText("On file")).toBeVisible();
    await expect(page.getByText("Pending")).toBeVisible();
    await expect(page.locator(".license-ce-number")).toHaveText(number);
    await expect(page.locator(".license-ce-bar-fill")).toBeVisible();
    await expect(page.locator(".license-ce-cat-bar-fill")).toHaveCount(2);
    await expect(page.getByText("8 / 20 hrs")).toBeVisible();
    await expect(page.getByText("4 / 4 hrs")).toBeVisible();

    const widths = await cardWidths(page);
    expect(widths.length).toBe(4);
    expect(new Set(widths).size).toBe(1);

    await page.getByRole("button", { name: "Add License" }).click();
    await expect(page.getByText("Add License").first()).toBeVisible();
    await expect(page.getByLabel(/Select your state/)).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByLabel(/Select your state/)).toHaveCount(0);
  });

  test.describe("phone viewport", () => {
    test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

    test("fields stack with no horizontal page scroll", async ({ page }) => {
      const email = freshEmail("cred-layout-phone");
      await signUpAndEnterApp(page, email);
      await grantLimbicStudent(email);
      await openCredentials(page);

      await expect(page.locator(".professional-dates-fields .field")).toHaveCount(7);
      const overflow = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        body: document.body.scrollWidth - document.body.clientWidth,
      }));
      expect(overflow.doc).toBeLessThanOrEqual(1);
      expect(overflow.body).toBeLessThanOrEqual(1);

      const widths = await cardWidths(page);
      expect(new Set(widths).size).toBe(1);
    });
  });
});
