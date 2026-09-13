import { test, expect } from "@playwright/test";
import { freshEmail, grantLimbicPro, grantLimbicStudent, setUserColumn, signUpAndEnterApp } from "./helpers";

/**
 * Profile header is Role / Theme / Subscription (#493), not the three streak cards.
 * Streak cards still exist as components and still render on Games / Wellness when the
 * account actually has a streak.
 */

test.describe("Profile status cards", () => {
  test("header shows Role, Theme, and Free subscription — no streak cards", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("profile-status-free"));
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();

    const role = page.locator(".profile-status-card").filter({ hasText: "Role" });
    const theme = page.locator(".profile-status-card").filter({ hasText: "Theme" });
    const subscription = page.locator(".profile-status-card").filter({ hasText: "Subscription" });

    await expect(role).toBeVisible();
    await expect(role.getByText("Physical Therapist", { exact: true })).toBeVisible();
    await expect(theme.getByText("System", { exact: true })).toBeVisible();
    await expect(subscription.getByText("Free", { exact: true })).toBeVisible();
    await expect(subscription.getByText("No paid plan")).toBeVisible();
    await expect(subscription.getByText(/days? left/)).toHaveCount(0);

    await expect(page.getByText("Reading activity")).toHaveCount(0);
    await expect(page.getByText("Limbic Games activity")).toHaveCount(0);
    await expect(page.getByText("Health and Wellness activity")).toHaveCount(0);
  });

  test("Role Edit reaches the Role section; Theme Change opens Theme; Subscription goes to membership", async ({
    page,
  }) => {
    await signUpAndEnterApp(page, freshEmail("profile-status-jumps"));
    await page.goto("/profile");

    await page.locator(".profile-status-card").filter({ hasText: "Role" }).click();
    await expect(page.locator("#profile-role")).toBeInViewport();

    await page.locator(".profile-status-card").filter({ hasText: "Theme" }).click();
    const themeCard = page.locator("#profile-theme");
    await expect(themeCard).toBeInViewport();
    await expect(themeCard).toHaveAttribute("open", "");

    await page.locator(".profile-status-card").filter({ hasText: "Subscription" }).click();
    await expect(page).toHaveURL(/\/profile\/membership/);
  });

  test("Theme card updates after changing the theme", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("profile-status-theme"));
    await page.goto("/profile");

    const headerTheme = page.locator(".profile-status-card").filter({ hasText: "Theme" });
    await expect(headerTheme.getByText("System", { exact: true })).toBeVisible();

    const themeDetails = page.locator("#profile-theme");
    await themeDetails.locator("summary").click();
    await themeDetails.getByRole("button", { name: "Dark", exact: true }).click();

    await expect(headerTheme.getByText("Dark", { exact: true })).toBeVisible();
  });

  test("Subscription card names Pro and Student; null period-end has no countdown", async ({ page }) => {
    const email = freshEmail("profile-status-pro");
    await signUpAndEnterApp(page, email);
    await grantLimbicPro(email);
    await page.goto("/profile");

    const subscription = page.locator(".profile-status-card").filter({ hasText: "Subscription" });
    await expect(subscription.getByText("LimbicPRO", { exact: true })).toBeVisible();
    await expect(subscription.getByText("Active", { exact: true })).toBeVisible();
    await expect(subscription.getByText(/0 days? left/)).toHaveCount(0);
    await expect(subscription.getByText(/days? left/)).toHaveCount(0);

    await grantLimbicStudent(email);
    await setUserColumn(email, "isPro", 0);
    await page.goto("/profile");
    await expect(subscription.getByText("Limbic Student", { exact: true })).toBeVisible();
    await expect(subscription.getByText(/0 days? left/)).toHaveCount(0);

    await setUserColumn(email, "studentTier", "none");
    await setUserColumn(email, "isWellnessPlus", 1);
    await page.goto("/profile");
    await expect(subscription.getByText("Limbic Wellness+", { exact: true })).toBeVisible();
    await expect(subscription.getByText(/0 days? left/)).toHaveCount(0);
  });

  test("positive period-end shows days left; past/zero does not", async ({ page }) => {
    const email = freshEmail("profile-status-days");
    await signUpAndEnterApp(page, email);
    await grantLimbicPro(email);
    const future = new Date(Date.now() + 7 * 86_400_000).toISOString();
    await setUserColumn(email, "stripeCurrentPeriodEnd", future);
    await page.goto("/profile");

    const subscription = page.locator(".profile-status-card").filter({ hasText: "Subscription" });
    await expect(subscription.getByText(/[1-9]\d* days? left/)).toBeVisible();
    await expect(subscription.getByText(/0 days? left/)).toHaveCount(0);

    const past = new Date(Date.now() - 2 * 86_400_000).toISOString();
    await setUserColumn(email, "stripeCurrentPeriodEnd", past);
    await page.goto("/profile");
    await expect(subscription.getByText("LimbicPRO", { exact: true })).toBeVisible();
    await expect(subscription.getByText(/days? left/)).toHaveCount(0);
  });

  test("Games and Wellness streaks still render off Profile", async ({ page }) => {
    const email = freshEmail("profile-status-streaks");
    await signUpAndEnterApp(page, email);
    await setUserColumn(email, "gamesStreakDays", 4);
    await setUserColumn(email, "wellnessStreakDays", 3);

    await page.goto("/profile");
    await expect(page.getByText("Limbic Games activity")).toHaveCount(0);
    await expect(page.getByText("Health and Wellness activity")).toHaveCount(0);

    await page.goto("/games");
    await expect(page.getByText("4 day streak")).toBeVisible();

    await page.goto("/wellness");
    await expect(page.getByText("3").first()).toBeVisible();
    await expect(page.locator(".wellness-hub-streak")).toContainText("day");
  });
});
