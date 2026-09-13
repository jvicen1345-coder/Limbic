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
  await expect(page.getByText(/Admin, registered users/)).toHaveCount(0);
});
