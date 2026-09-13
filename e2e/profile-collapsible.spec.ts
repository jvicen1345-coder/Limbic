import { test, expect, type Page } from "@playwright/test";
import { freshEmail, signUpAndEnterApp } from "./helpers";

/**
 * Profile's CollapsibleCards share a native `<details name>` group (issue #492) so opening
 * one closes the others. This is browser-enforced — no client JS — and the regression that
 * matters is a card left out of the group, which would silently allow two panels open.
 *
 * Exercise Library cards are the documented standalone case: they must not receive a name.
 */

function profileCard(page: Page, title: string) {
  return page.locator("details.collapsible-card").filter({
    has: page.locator(".collapsible-card-title", { hasText: title }),
  });
}

test.describe("Profile exclusive collapsible cards", () => {
  test("opening one card closes the previous; all can be closed; keyboard still toggles", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("profile-collapse"));
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();

    const cards = page.locator("details.collapsible-card");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count, "a non-admin Profile should still render the settings cards").toBeGreaterThanOrEqual(7);

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i), `card ${i} is missing the shared exclusive name`).toHaveAttribute(
        "name",
        "profile",
      );
    }

    const theme = profileCard(page, "Theme");
    const tour = profileCard(page, "Platform Tour");

    await expect(theme).not.toHaveAttribute("open");
    await expect(tour).not.toHaveAttribute("open");

    await theme.locator("summary").click();
    await expect(theme).toHaveAttribute("open", "");
    await expect(tour).not.toHaveAttribute("open");

    await tour.locator("summary").click();
    await expect(tour).toHaveAttribute("open", "");
    await expect(theme).not.toHaveAttribute("open");

    // Closing the open card must leave none forced open.
    await tour.locator("summary").click();
    await expect(tour).not.toHaveAttribute("open");
    await expect(theme).not.toHaveAttribute("open");

    const about = profileCard(page, "About you");
    await about.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(about).toHaveAttribute("open", "");
    await page.keyboard.press("Space");
    await expect(about).not.toHaveAttribute("open");
  });

  test("Exercise Library cards stay standalone — no exclusive name", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("exercise-collapse"));
    await page.goto("/wellness/exercises");
    await expect(page.getByRole("heading", { name: "Exercise Library" })).toBeVisible();

    const cards = page.locator("details.collapsible-card");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThan(1);

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i), `exercise card ${i} should not be in an exclusive group`).not.toHaveAttribute(
        "name",
      );
    }
  });
});
