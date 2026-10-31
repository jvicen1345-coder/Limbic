import { test, expect, type Page } from "@playwright/test";
import { freshEmail, signUpAndEnterApp } from "./helpers";

async function dismissWelcomeTour(page: Page) {
  const skip = page.getByRole("button", { name: "Skip tour" });
  try {
    await skip.waitFor({ state: "visible", timeout: 8_000 });
    await skip.click();
  } catch {
    // The tour only auto-starts for an account that has not finished it.
  }
  await expect(page.locator(".tour-tooltip")).toHaveCount(0);
}

/**
 * The sidebar lists six sections. Sub-pages of Saved and Wellness are in-page tabs,
 * and the section row stays highlighted on those routes.
 */

test.describe("sidebar sections", () => {
  test("top-level groups replace the old section list", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await signUpAndEnterApp(page, freshEmail("sidebar-sections"));
    await dismissWelcomeTour(page);

    const sidebar = page.locator(".app-sidebar");
    await expect(sidebar.getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Search", exact: true })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Learn", exact: true })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Clinical", exact: true })).toBeVisible();
    await expect(sidebar.getByRole("button", { name: "Library", exact: true })).toBeVisible();
    await expect(sidebar.getByRole("button", { name: "Community", exact: true })).toBeVisible();

    await expect(sidebar.getByRole("button", { name: "Limbic Student" })).toHaveCount(0);
    await expect(sidebar.getByRole("button", { name: "LimbicPRO" })).toHaveCount(0);
    await expect(sidebar.getByRole("button", { name: "Health & Wellness" })).toHaveCount(0);
    await expect(sidebar.getByRole("button", { name: "Saved", exact: true })).toHaveCount(0);

    const library = sidebar.getByRole("button", { name: "Library", exact: true });
    if ((await library.getAttribute("aria-expanded")) !== "true") await library.click();
    await expect(sidebar.getByRole("link", { name: "Evidence Library" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Limbic Atlas" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Clips", exact: true })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "News", exact: true })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Saved", exact: true })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Connexion Method" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Limbic Games" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Saved Articles" })).toHaveCount(0);

    await sidebar.getByRole("button", { name: "Community", exact: true }).click();
    await expect(sidebar.getByRole("link", { name: "Wellness", exact: true })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Nexus", exact: true })).toHaveCount(0);
  });

  test("a saved or wellness sub-route highlights its section and shows that section's tabs", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await signUpAndEnterApp(page, freshEmail("sidebar-subroutes"));
    await dismissWelcomeTour(page);

    await page.goto("/saved/clips");
    const sidebar = page.locator(".app-sidebar");
    await expect(sidebar.getByRole("button", { name: "Library", exact: true })).toHaveAttribute("data-active", "true");
    await expect(sidebar.getByRole("link", { name: "Saved", exact: true })).toHaveAttribute("data-active", "true");
    const savedTabs = page.locator(".sub-tabs");
    await expect(savedTabs.getByRole("link", { name: "Articles", exact: true })).toBeVisible();
    await expect(savedTabs.getByRole("link", { name: "Guidelines", exact: true })).toBeVisible();
    await expect(savedTabs.getByRole("link", { name: "Wellness", exact: true })).toBeVisible();
    await expect(savedTabs.getByRole("link", { name: "Clips", exact: true })).toHaveClass(/active/);
    await expect(savedTabs.getByRole("link", { name: "Articles", exact: true })).not.toHaveClass(/active/);

    await page.goto("/wellness/metrics");
    await expect(sidebar.getByRole("button", { name: "Community", exact: true })).toHaveAttribute("data-active", "true");
    await expect(sidebar.getByRole("link", { name: "Wellness", exact: true })).toHaveAttribute("data-active", "true");
    await expect(sidebar.getByRole("button", { name: "Library", exact: true })).toHaveAttribute("data-active", "false");
    const wellnessTabs = page.locator(".sub-tabs");
    await expect(wellnessTabs.getByRole("link", { name: "Overview", exact: true })).toBeVisible();
    await expect(wellnessTabs.getByRole("link", { name: "Metrics", exact: true })).toHaveClass(/active/);
    await expect(wellnessTabs.getByRole("link", { name: "Activity", exact: true })).toBeVisible();
    await expect(wellnessTabs.getByRole("link", { name: "Overview", exact: true })).not.toHaveClass(/active/);
  });
});
