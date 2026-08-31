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

/** Walks the three one-time gates a brand-new account passes before it can reach anything
 *  else, in the order app/(app)/layout.tsx redirects through them: name (app/onboarding/
 *  name), then pick-topics (app/onboarding), then the "How are you using Limbic?" role
 *  modal (components/OnboardingRoleModal.tsx, which renders in place of the whole app).
 *
 *  Every step is driven off its own control rather than off a URL. The gates hand off via
 *  server-action redirects, so the URL is briefly ambiguous between two of them mid-flight;
 *  waiting on an element instead lets Playwright's auto-waiting ride that out, where
 *  asserting a URL first would race it. */
async function completeOnboarding(page: import("@playwright/test").Page) {
  // Both name fields are `required`, and only the first is prefilled (from an email-derived
  // guess), so a last name has to be typed for this step to submit at all.
  await page.getByLabel("First name").fill("Jamie");
  await page.getByLabel("Last name").fill("Rivera");
  await page.getByRole("button", { name: "Continue to Limbic" }).click();

  await page.getByRole("button", { name: "Skip for now" }).click();

  // The role picker's options are buttons whose accessible name combines title and subtitle
  // ("Physical Therapist Licensed clinician"), hence the regex rather than a literal. Its
  // Continue takes exact: true because accessible-name matching is substring by default,
  // which would otherwise also match the topic step's "Continue to Limbic".
  await page.getByRole("button", { name: /Physical Therapist/ }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
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

    await completeOnboarding(page);

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
