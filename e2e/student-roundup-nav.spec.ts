import { test, expect } from "@playwright/test";
import { signUpAndEnterApp } from "./helpers";

/**
 * Weekly Roundup already rendered at /student/roundup; these tests cover the new way in.
 * A .edu address is what hasStudentAccess (and therefore the sidebar link) keys off.
 */

function studentEmail(label: string) {
  return `pw-roundup-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@school.edu`;
}

test.describe("Weekly Roundup nav", () => {
  test("the desktop sidebar link opens the roundup and highlights it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await signUpAndEnterApp(page, studentEmail("desk"));

    const sidebar = page.locator(".app-sidebar");
    await sidebar.getByRole("button", { name: "Limbic Student" }).click();
    await sidebar.getByRole("link", { name: "Weekly Roundup" }).click();

    await expect(page).toHaveURL(/\/student\/roundup$/);
    await expect(page.getByRole("heading", { name: "Weekly Roundup" })).toBeVisible();
    // Exact match: /student (Atrium) must stay inactive on the nested roundup route.
    await expect(sidebar.getByRole("link", { name: "Weekly Roundup" })).toHaveAttribute("data-active", "true");
    await expect(sidebar.getByRole("link", { name: "Atrium", exact: true })).toHaveAttribute("data-active", "false");
  });

  test("the mobile drawer link opens the roundup", async ({ page }) => {
    // Sign up at the default desktop width. completeFirstRun waits on a single visible
    // navigation, and a phone width shows the bottom nav while the sidebar is still in
    // the DOM.
    await signUpAndEnterApp(page, studentEmail("mobile"));
    await page.setViewportSize({ width: 390, height: 844 });

    await page.getByRole("button", { name: "Open menu" }).click();
    const drawer = page.locator(".app-mobile-drawer");
    await drawer.getByRole("button", { name: "Limbic Student" }).click();
    await drawer.getByRole("link", { name: "Weekly Roundup" }).click();

    await expect(page).toHaveURL(/\/student\/roundup$/);
    await expect(page.getByRole("heading", { name: "Weekly Roundup" })).toBeVisible();
    await expect(drawer).toBeHidden();

    await page.getByRole("button", { name: "Open menu" }).click();
    const reopened = page.locator(".app-mobile-drawer");
    await expect(reopened.getByRole("link", { name: "Weekly Roundup" })).toHaveAttribute("data-active", "true");
    await expect(reopened.getByRole("link", { name: "Atrium", exact: true })).toHaveAttribute("data-active", "false");
  });
});
