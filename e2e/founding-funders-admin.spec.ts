import { test, expect } from "@playwright/test";
import { freshEmail, setUserColumn, signUpAndEnterApp } from "./helpers";

/**
 * #497 — foundingFunders is the payment job, not a near-owner grant.
 *
 * A co-admin with that area can open the public page's payment roster and claim form.
 * They must not see the all-users registered roster (name / email / license / isPro).
 * CI leaves FOUNDING_FUNDERS_ADMIN_EMAILS unset, so this cannot assert the owner-visible
 * roster; that half is the page source-gate in founding-funders-authz.test.ts.
 */
test("a foundingFunders co-admin does not see the registered-user roster", async ({ page }) => {
  const email = freshEmail("ff-coadmin");
  await signUpAndEnterApp(page, email);
  await setUserColumn(email, "adminAreas", JSON.stringify(["foundingFunders"]));

  await page.goto("/founding-funders");
  await expect(page.getByText("Founding Funders, payment roster")).toBeVisible();
  await expect(page.getByText("Admin, claim a founding spot")).toBeVisible();
  await expect(
    page.getByText("This records the payment roster spot. An owner comps Pro / Lifetime Access from /admin/accounts."),
  ).toBeVisible();
  await expect(page.getByText(/Admin, registered users/)).toHaveCount(0);
});

test("a foundingFunders co-admin claim says Lifetime Access was not granted", async ({ page }) => {
  const email = freshEmail("ff-coadmin-claim");
  await signUpAndEnterApp(page, email);
  await setUserColumn(email, "adminAreas", JSON.stringify(["foundingFunders"]));

  await page.goto("/founding-funders");
  await page.getByPlaceholder("Reader's sign-in email or license #").fill(email);
  await page.getByPlaceholder("Display name (e.g. Jordan)").fill("Coadmin");
  await page.getByRole("button", { name: "Claim spot" }).click();

  await expect(page.locator(".ff-admin-message--ok")).toContainText("Lifetime Access was not granted");
  await expect(page.locator(".ff-admin-message--ok")).toContainText("/admin/accounts");
});
