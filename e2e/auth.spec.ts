import { test, expect } from "@playwright/test";

/** Each test gets its own email so they can run in parallel without colliding on the same
 *  row in SignInThrottle/User — see playwright.config.ts's fullyParallel. */
function freshEmail(label: string) {
  return `pw-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

const PASSWORD = "TestPass123!";

async function signUp(page: import("@playwright/test").Page, email: string) {
  await page.goto("/sign-in");
  await page.getByText("New here? Create an account").click();
  await page.getByLabel("Email").fill(email);
  const passwordFields = page.locator('input[type="password"]');
  await passwordFields.nth(0).fill(PASSWORD);
  await passwordFields.nth(1).fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
}

test.describe("landing + auth", () => {
  test("landing page renders for a signed-out visitor", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible();
    await expect(page.getByRole("navigation").getByRole("link", { name: "Sign In" })).toBeVisible();
  });

  test("a protected route redirects a signed-out visitor to sign-in", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-up reaches onboarding, and onboarding leads into the real app", async ({ page }) => {
    const email = freshEmail("signup");
    await signUp(page, email);
    await expect(page).toHaveURL(/\/onboarding/);

    // A brand-new signup goes through three gates in order (see app/(app)/layout.tsx, which
    // redirects on hasSetName, then hasOnboarded, then hasCompletedOnboarding): the name
    // screen, pick-topics, then "How are you using Limbic?" — .click() auto-waits for each
    // element rather than needing manual visibility polling. The role picker's options are
    // buttons whose accessible name combines title and subtitle ("Physical Therapist
    // Licensed clinician").
    await expect(page).toHaveURL(/\/onboarding\/name/);
    await page.locator("#onb-first-name").fill("Test");
    await page.locator("#onb-last-name").fill("Account");
    await page.getByRole("button", { name: "Continue to Limbic" }).click();

    await page.getByText("Skip for now").click();
    await page.getByRole("button", { name: /Physical Therapist/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();
  });

  test("signing in with the wrong password shows a generic error", async ({ page }) => {
    const email = freshEmail("wrongpw");
    await signUp(page, email);
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("not-the-right-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Incorrect email or password.")).toBeVisible();
  });

  test("five failed sign-ins lock the account out for a sixth attempt", async ({ page }) => {
    const email = freshEmail("ratelimit");
    // No sign-up needed — every failure (wrong password or no account at all) counts the
    // same way against the per-email limiter (see lib/sign-in-rate-limit.ts).
    for (let i = 0; i < 5; i++) {
      await page.goto("/sign-in");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill("wrong-password");
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page.getByText("Incorrect email or password.")).toBeVisible();
    }

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Too many attempts. Please try again later.")).toBeVisible();
  });
});
