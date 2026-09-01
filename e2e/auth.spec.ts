import { test, expect } from "@playwright/test";
import { freshEmail, signUp, PASSWORD } from "./helpers";

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

  /**
   * The first-run journey is this test's actual subject, so its three gates stay written out
   * here with an assertion on each rather than being delegated to helpers.ts's
   * completeFirstRun — a test that only called the helper would pass without ever checking
   * that the gates appear in the right order, which is exactly what it exists to catch.
   *
   * Each gate is waited on by URL (or, for the role modal, by the heading it renders)
   * *before* anything is clicked. The previous version clicked straight through and so
   * reported a `/onboarding/name` step appearing in front of the topic picker as a bare
   * "waiting for getByText('Skip for now')" timeout, which says nothing about what moved.
   */
  test("sign-up walks all three first-run gates and lands in the app", async ({ page }) => {
    const email = freshEmail("signup");
    await signUp(page, email);

    // Gate 1 — hasSetName. Both fields are required, so Continue does nothing until filled.
    await expect(page).toHaveURL(/\/onboarding\/name/);
    await page.getByLabel("First name").fill("Pw");
    await page.getByLabel("Last name").fill("Tester");
    await page.getByRole("button", { name: "Continue to Limbic" }).click();

    // Gate 2 — hasOnboarded. Picking topics is optional; "Skip for now" completes it too.
    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(page.getByText("What are you interested in?")).toBeVisible();
    await page.getByRole("button", { name: "Skip for now" }).click();

    // Gate 3 — hasCompletedOnboarding. The role modal renders in place of the whole app
    // shell (see app/(app)/layout.tsx), so the URL is already /home while it's showing —
    // which is why reaching /home is not on its own proof of being through onboarding.
    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByRole("heading", { name: "How are you using Limbic?" })).toBeVisible();
    // Options are buttons whose accessible name combines label and description
    // ("Physical Therapist Licensed clinician" — see lib/user-role.ts's USER_ROLES).
    // "Physical Therapist" goes straight through; "PT Student" would add a program picker.
    await page.getByRole("button", { name: /Physical Therapist/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Past every gate: the real Home, with the app shell around it.
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "How are you using Limbic?" })).toBeHidden();
  });

  /**
   * The clickwrap gate (components/SignInForm.tsx AcceptTermsField). The checkbox carries
   * `required`, so this bypasses the browser's own validation with a direct form submit to
   * exercise the *server-side* check in app/actions/auth.ts — that check is the one that
   * actually matters, since signUpAction is a callable endpoint in its own right and the
   * attribute only guards the happy path through the rendered form.
   */
  test("creating an account without accepting the terms is refused server-side", async ({ page }) => {
    const email = freshEmail("noterms");
    await page.goto("/sign-in");
    await page.getByText("New here? Create an account").click();
    await page.getByLabel("Email").fill(email);
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(PASSWORD);
    await passwordFields.nth(1).fill(PASSWORD);

    // Deliberately leave the box unticked, and drop `required` so the browser submits the
    // form rather than blocking it — the point is what the server does with the submission.
    await page.getByRole("checkbox").evaluate((el: HTMLInputElement) => el.removeAttribute("required"));
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/error=terms_required/);
    await expect(
      page.getByText("Please accept the Terms of Service and Privacy Policy to create an account.")
    ).toBeVisible();

    // And no account was created: signing in with those credentials fails.
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(email);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Incorrect email or password.")).toBeVisible();
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
