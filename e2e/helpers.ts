import { expect, type Page } from "@playwright/test";

/**
 * Shared sign-up and first-run helpers.
 *
 * Not a `.spec.ts`, so Playwright's default testMatch (`**​/*.@(spec|test).?(c|m)[jt]s?(x)`)
 * skips it — it's imported, never collected.
 *
 * These live here because the first-run flow moved and only one of the two spec files that
 * walked it was updated: auth.spec.ts kept clicking "Skip for now" straight after sign-up
 * and timed out for weeks once a name step landed in front of it. Any spec that needs a
 * signed-in account should call `signUpAndEnterApp` rather than re-deriving the sequence, so
 * the next time a gate is added or reordered there is exactly one place to fix.
 */

/** Each caller gets its own email so tests can run in parallel without colliding on the same
 *  row in SignInThrottle/User — see playwright.config.ts's fullyParallel. */
export function freshEmail(label: string) {
  return `pw-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export const PASSWORD = "TestPass123!";

/** Creates the account and stops there, on whatever the first onboarding gate currently is.
 *  Callers that only need the account to exist (the sign-in and rate-limit tests) use this
 *  directly and never enter the app. */
export async function signUp(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByText("New here? Create an account").click();
  await page.getByLabel("Email").fill(email);
  const passwordFields = page.locator('input[type="password"]');
  await passwordFields.nth(0).fill(PASSWORD);
  await passwordFields.nth(1).fill(PASSWORD);
  // Clickwrap assent (components/SignInForm.tsx AcceptTermsField) — required, and enforced
  // server-side in app/actions/auth.ts, so no account is created without ticking it.
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create account" }).click();
}

/**
 * Clears the three first-run gates app/(app)/layout.tsx enforces, in the order it enforces
 * them:
 *
 *   1. `hasSetName`            → redirect to /onboarding/name
 *   2. `hasOnboarded`          → redirect to /onboarding (topic picker)
 *   3. `hasCompletedOnboarding`→ OnboardingRoleModal, rendered *in place* of the whole app
 *                                shell, so the URL is already /home while it is showing
 *
 * Picks "Physical Therapist" at the role step deliberately: "PT Student" adds a fourth
 * screen (the DPT program picker), while "Physical Therapist" and "General" go straight
 * through — see the note at the top of components/OnboardingRoleModal.tsx.
 *
 * The two routed gates are waited on by URL rather than assumed, so a step moving between
 * them surfaces as a clear URL-wait failure instead of a mystery click timeout.
 */
export async function completeFirstRun(page: Page, { firstName = "Pw", lastName = "Tester" } = {}) {
  // Longer wait on this first gate only, for local runs: playwright.config.ts's webServer
  // starts `next dev` there, which compiles each route on first request, so the first
  // sign-up of a run pays for compiling /onboarding/name on top of the request itself. The
  // later gates are warm. Under CI the same config serves a finished build instead and this
  // gate resolves in well under a second — the wait is kept as headroom for the local path,
  // not because CI still needs it.
  await page.waitForURL(/\/onboarding\/name/, { timeout: 25_000 });
  await page.getByLabel("First name").fill(firstName);
  await page.getByLabel("Last name").fill(lastName);
  await page.getByRole("button", { name: "Continue to Limbic" }).click();

  await page.waitForURL(/\/onboarding$/);
  await page.getByRole("button", { name: "Skip for now" }).click();

  await page.waitForURL(/\/home/);
  await page.getByRole("button", { name: /Physical Therapist/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  // The modal renders *instead of* AppShell, so the sidebar appearing is what says the
  // account is genuinely through — not a navigation, since the URL was already /home while
  // the modal was up. Waiting on the sidebar (a positive signal) rather than on the modal
  // disappearing also gives a far better failure message if a gate is ever added after this
  // one: "navigation not visible" rather than "the button you clicked is still there".
  //
  // The generous timeout is deliberate. Completing this step is a server action plus a
  // revalidate, and the default 5s is not always enough when several workers are signing up
  // at once — that showed up as an intermittent failure here under load, not as a bug. Most
  // of that load was `next dev` compiling routes under parallel workers, which CI no longer
  // does (see playwright.config.ts's webServer), but the local path still can.
  await expect(page.getByRole("navigation")).toBeVisible({ timeout: 20_000 });
}

/** Sign up and land inside the app, past every first-run gate. */
export async function signUpAndEnterApp(page: Page, email: string) {
  await signUp(page, email);
  await completeFirstRun(page);
}
