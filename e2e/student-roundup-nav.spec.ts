import { test, expect, type Page } from "@playwright/test";
import { signUpAndEnterApp } from "./helpers";

async function dismissWelcomeTour(page: Page) {
  const skip = page.getByRole("button", { name: "Skip tour" });
  try {
    await skip.waitFor({ state: "visible", timeout: 8_000 });
    await skip.click();
  } catch {
    // The tour only auto-starts for an account that has not finished it.
  }
}

/**
 * Weekly Roundup renders at /student/roundup. It is a Learn tab, not its own sidebar row.
 * A .edu address is what hasStudentAccess (and therefore the tab) keys off.
 */

function studentEmail(label: string) {
  return `pw-roundup-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@school.edu`;
}

test.describe("Weekly Roundup nav", () => {
  test("Learn stays highlighted and the roundup tab opens the page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await signUpAndEnterApp(page, studentEmail("desk"));
    await dismissWelcomeTour(page);

    const sidebar = page.locator(".app-sidebar");
    await sidebar.getByRole("link", { name: "Learn", exact: true }).click();
    await expect(page).toHaveURL(/\/student$/);

    const tabs = page.locator(".sub-tabs");
    await tabs.getByRole("link", { name: "Weekly Roundup" }).click();

    await expect(page).toHaveURL(/\/student\/roundup$/);
    await expect(page.getByRole("heading", { name: "Weekly Roundup" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Learn", exact: true })).toHaveAttribute("data-active", "true");
    await expect(tabs.getByRole("link", { name: "Weekly Roundup" })).toHaveClass(/active/);
    await expect(tabs.getByRole("link", { name: "Atrium", exact: true })).not.toHaveClass(/active/);
  });

  test("the mobile drawer Learn link leads to the roundup tab", async ({ page }) => {
    // Sign up at the default desktop width. completeFirstRun waits on a single visible
    // navigation, and a phone width shows the bottom nav while the sidebar is still in
    // the DOM.
    await signUpAndEnterApp(page, studentEmail("mobile"));
    await dismissWelcomeTour(page);
    await page.setViewportSize({ width: 390, height: 844 });

    await page.getByRole("button", { name: "Open menu" }).click();
    const drawer = page.locator(".app-mobile-drawer");
    await drawer.getByRole("link", { name: "Learn", exact: true }).click();
    await expect(drawer).toBeHidden();

    await page.locator(".sub-tabs").getByRole("link", { name: "Weekly Roundup" }).click();
    await expect(page).toHaveURL(/\/student\/roundup$/);
    await expect(page.getByRole("heading", { name: "Weekly Roundup" })).toBeVisible();

    await page.getByRole("button", { name: "Open menu" }).click();
    const reopened = page.locator(".app-mobile-drawer");
    await expect(reopened.getByRole("link", { name: "Learn", exact: true })).toHaveAttribute("data-active", "true");
    await expect(page.locator(".sub-tabs").getByRole("link", { name: "Weekly Roundup" })).toHaveClass(/active/);
    await expect(page.locator(".sub-tabs").getByRole("link", { name: "Atrium", exact: true })).not.toHaveClass(/active/);
  });
});
