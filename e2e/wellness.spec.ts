import { test, expect } from "@playwright/test";
import { freshEmail, signUpAndEnterApp } from "./helpers";

/**
 * Health & Wellness overview and the articles feed both call getWellnessArticles()
 * (live Google News RSS, cached, with a seed fallback). These tests cover the
 * signed-in render and the Refresh path that busts the `live-wellness` tag.
 */
test.describe("wellness", () => {
  test("overview renders for a signed-in reader", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("wellness-overview"));

    await page.goto("/wellness");
    await expect(page.getByRole("heading", { name: "Health and Wellness" })).toBeVisible();
    await expect(page.getByText("Latest Wellness Articles")).toBeVisible();
    await expect(page.getByRole("link", { name: /View all/ })).toBeVisible();
  });

  test("articles feed Refresh stays on the page and keeps a reading list", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("wellness-refresh"));

    await page.goto("/wellness/articles");
    await expect(page.getByRole("heading", { name: "Wellness Articles & Videos" })).toBeVisible();
    await expect(page.getByText("Video recommendations")).toBeVisible();
    const refresh = page.getByRole("button", { name: "Refresh", exact: true });
    await expect(refresh).toBeVisible();

    await refresh.click();
    await expect(page.getByRole("button", { name: "Refresh", exact: true })).toBeEnabled();
    await expect(page).toHaveURL(/\/wellness\/articles/);
    await expect(page.getByRole("heading", { name: "Wellness Articles & Videos" })).toBeVisible();
    await expect(page.getByText("Video recommendations")).toBeVisible();
  });
});
