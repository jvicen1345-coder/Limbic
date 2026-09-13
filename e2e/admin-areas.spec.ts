import { test, expect } from "@playwright/test";
import { ADMIN_AREAS, ADMIN_AREA_LABELS } from "@/lib/admin-areas";
import { freshEmail, setUserColumn, signUpAndEnterApp } from "./helpers";

/**
 * Co-admin access — an ordinary account given some of the admin surface and none of the rest
 * (see lib/admin-areas.ts, User.adminAreas in schema.prisma, hasAdminArea in lib/admin.ts).
 *
 * The half worth pinning against the running app is the half a unit test can't reach: that a
 * granted area actually opens its page, that an ungranted one redirects even when the URL is
 * typed directly, and that the sidebar lists exactly the granted screens rather than the full
 * admin menu. A link that redirects on click reads as the app losing your session, so the nav
 * filter is a correctness concern, not cosmetics.
 *
 * The grant is written straight to the column rather than made through /admin/accounts,
 * because appointing a co-admin requires an owner on FOUNDING_FUNDERS_ADMIN_EMAILS — an env
 * var CI deliberately leaves unset, so that every admin surface stays closed in the test
 * environment. Co-admin access is pure database state, so a co-admin can be tested without
 * one, and the owner-only appointment path keeps its own server-side check (see
 * requireOwnerForTarget in app/actions/admin.ts). Grant/revoke and the owner-gate
 * decision table are covered in src/lib/admin-authz.test.ts (#500). The copyright
 * co-admin / owner-suspend case is #496, not this file.
 *
 * One test, one account, one database write, for the reason spelled out at the top of
 * appraisals.spec.ts: extra sign-ups in a `fullyParallel` suite contend for a single SQLite
 * write lock and the cost lands on whichever spec writes next.
 */
test("a co-admin gets exactly the admin areas they were granted", async ({ page }) => {
  const email = freshEmail("coadmin");
  await signUpAndEnterApp(page, email);

  // Before any grant: no Admin section, and the pages are closed even by direct URL.
  await expect(page.getByRole("button", { name: "Admin", exact: true })).toHaveCount(0);
  await page.goto("/admin/licenses");
  await expect(page).toHaveURL(/\/home$/);

  await setUserColumn(email, "adminAreas", JSON.stringify(["licenses"]));

  await page.goto("/home");
  await page.getByRole("button", { name: "Admin", exact: true }).click();
  await expect(page.getByRole("link", { name: ADMIN_AREA_LABELS.licenses })).toBeVisible();
  await expect(page.getByRole("link", { name: ADMIN_AREA_LABELS.copyright })).toHaveCount(0);
  // Gold standalone Founding Funders is always in the sidebar; licenses-only must not
  // grow a second Admin row for an area they were not granted (#498).
  await expect(page.locator(".app-sidebar").getByRole("link", { name: ADMIN_AREA_LABELS.foundingFunders })).toHaveCount(1);

  await page.goto("/admin/licenses");
  await expect(page).toHaveURL(/\/admin\/licenses$/);
  await page.goto("/admin/accounts");
  await expect(page).toHaveURL(/\/home$/);

  // Accounts is owner-only and has no area at all (see lib/admin-areas.ts), so holding
  // *every* delegable area still doesn't open it — the reader list, account deletion and the
  // co-admin controls stay with the allowlist. This is the assertion that would catch someone
  // "fixing" it by adding an accounts area back to the list.
  await setUserColumn(email, "adminAreas", JSON.stringify([...ADMIN_AREAS]));
  await page.goto("/admin/licenses");
  await expect(page.getByRole("link", { name: ADMIN_AREA_LABELS.copyright })).toBeVisible();
  await expect(page.getByRole("link", { name: ADMIN_AREA_LABELS.boardsTagging })).toBeVisible();
  await expect(page.getByRole("link", { name: "Accounts" })).toHaveCount(0);
  await expect(page.locator(".app-sidebar").getByRole("link", { name: ADMIN_AREA_LABELS.foundingFunders })).toHaveCount(2);
  await page.goto("/admin/accounts");
  await expect(page).toHaveURL(/\/home$/);

  // #500: holding every delegable area is still not owner. Nexus is allowlist-only
  // (lib/nexus-visibility.ts), so this account must see the same absence as an ordinary
  // reader — same assertions as e2e/nexus-hidden.spec.ts. The copyright-co-admin /
  // owner-suspend regression lives on #496, not here.
  for (const path of ["/home", "/profile"]) {
    await page.goto(path);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByText(/nexus/i), `"${path}" mentions Nexus for a full-area co-admin`).toHaveCount(0);
    await expect(page.locator('a[href^="/nexus"]'), `"${path}" links to Nexus for a full-area co-admin`).toHaveCount(0);
  }
  const nexus = await page.request.get("/nexus");
  expect(nexus.status(), "/nexus was reachable for a full-area co-admin").not.toBe(200);
});
