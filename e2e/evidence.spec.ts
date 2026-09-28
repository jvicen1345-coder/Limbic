import { test, expect } from "@playwright/test";

/**
 * The public evidence library (app/evidence) — the one research surface a signed-out
 * visitor can reach. What is worth pinning against the running app is exactly that: no
 * sign-in redirect, real content, and the pages listed for crawlers.
 *
 * Deliberately independent of PubMed: the hub and the guideline tier of a condition page are
 * static, so these assertions hold whether or not the network is reachable from CI. The
 * PubMed-backed tiers degrade to an explanatory line, which is itself asserted not to be an
 * error page.
 */
test.describe("public evidence library", () => {
  test("hub and condition pages render for a signed-out visitor", async ({ page }) => {
    await page.goto("/evidence");
    await expect(page).toHaveURL(/\/evidence$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("research, made readable");

    await page.getByRole("link", { name: /^Low back pain/ }).first().click();
    await expect(page).toHaveURL(/\/evidence\/topics\/low-back-pain$/);
    await expect(page.getByRole("heading", { level: 1, name: "Low back pain" })).toBeVisible();
    await expect(page.getByText("Where the evidence stands")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Clinical practice guideline" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Low Back Pain: Revision 2021/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();
  });

  test("unknown condition and non-PubMed study ids 404", async ({ page }) => {
    expect((await page.goto("/evidence/topics/not-a-condition"))?.status()).toBe(404);
    expect((await page.goto("/evidence/cpg-neck-pain-2017"))?.status()).toBe(404);
  });

  test("is listed for crawlers", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Allow: /evidence");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("https://limbic.center/evidence</loc>");
    expect(sitemap).toContain("https://limbic.center/evidence/topics/neck-pain</loc>");
  });
});
