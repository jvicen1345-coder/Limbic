import { test, expect } from "@playwright/test";
import { freshEmail, signUpAndEnterApp } from "./helpers";

/**
 * Search now filters the article pool on the server from `type` / `specialty` / `q`
 * (and paginates the page of cards). Curated AOPT guidelines are the stable stand-in:
 * they do not depend on PubMed or Google News being reachable.
 */
test.describe("search", () => {
  test("deep links apply type, specialty, and q on the server", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("search-deeplink"));

    await page.goto("/search?type=guideline&specialty=ortho&q=neck");
    await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Guidelines" }).first()).toBeVisible();
    await expect(page.getByText("Neck Pain: Revision 2017")).toBeVisible();
    await expect(page.getByText("Ankle Stability and Movement Coordination Impairments")).toHaveCount(0);
  });

  test("type and specialty chips update the URL and the result set", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("search-chips"));

    await page.goto("/search");
    await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();

    await page.getByRole("button", { name: "Guidelines" }).click();
    await expect(page).toHaveURL(/type=guideline/);
    await expect(page.getByText("Neck Pain: Revision 2017")).toBeVisible();

    await page.getByRole("button", { name: "Sports" }).click();
    await expect(page).toHaveURL(/type=guideline/);
    await expect(page).toHaveURL(/specialty=sports/);
    await expect(page.getByText("Achilles Pain, Stiffness, and Muscle Power Deficits")).toBeVisible();
    await expect(page.getByText("Neck Pain: Revision 2017")).toHaveCount(0);
  });

  test("q updates the URL and keeps Save on a trimmed card", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("search-query"));

    await page.goto("/search?type=guideline");
    await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();

    await page.getByPlaceholder("Search articles, topics, sources…").fill("achilles");
    await expect(page).toHaveURL(/q=achilles/i, { timeout: 10_000 });
    await expect(page.getByText("Achilles Pain, Stiffness, and Muscle Power Deficits")).toBeVisible();
    await expect(page.getByText("Neck Pain: Revision 2017")).toHaveCount(0);

    const save = page.getByRole("main").getByRole("button", { name: "Save", exact: true });
    await expect(save).toBeVisible();
    await save.click();
    await expect(page.getByRole("main").getByRole("button", { name: "Remove from saved", exact: true })).toBeVisible();
  });
});
