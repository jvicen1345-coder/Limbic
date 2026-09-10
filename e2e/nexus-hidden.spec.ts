import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import { freshEmail, signUpAndEnterApp } from "./helpers";

/**
 * Nexus is admin-only while its future is being decided (see lib/nexus-visibility.ts), and
 * "hidden" here means *no sign of it at all* — not a waitlist, not a "coming soon", not a
 * greyed-out nav entry. That is a stronger claim than "the routes are gated", and it is the
 * kind of thing that rots quietly: one new card, one bit of copy, one nav link added later
 * by someone who doesn't know, and the feature is back on screen for everyone.
 *
 * So this asserts the absence directly, on the pages a reader actually lands on, rather
 * than trusting the call sites individually.
 *
 * These tests deliberately do NOT grant admin. The admin path is exercised by the app's own
 * use of it; what needs guarding is the default.
 */
test.describe("Nexus is hidden from non-admins", () => {
  test("no Nexus anywhere on Home, Profile, or in the nav", async ({ page }) => {
    const email = freshEmail("nexus-hidden");
    await signUpAndEnterApp(page, email);

    for (const path of ["/home", "/profile"]) {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
      // The word itself must not appear — copy, labels, headings, toggles, anything.
      await expect(page.getByText(/nexus/i), `"${path}" mentions Nexus`).toHaveCount(0);
      // Nor a link to it, which would survive even if the label changed.
      await expect(page.locator('a[href^="/nexus"]'), `"${path}" links to Nexus`).toHaveCount(0);
    }
  });

  test("every /nexus route 404s rather than offering a waitlist", async ({ page }) => {
    const email = freshEmail("nexus-404");
    await signUpAndEnterApp(page, email);

    for (const path of ["/nexus", "/nexus/directory", "/nexus/connections", "/nexus/messages"]) {
      const res = await page.request.get(path);
      expect(res.status(), `${path} did not 404`).toBe(404);
      // A "coming soon" screen would be a 200 with Nexus copy — precisely what we removed.
      expect(await res.text(), `${path} still advertises Nexus`).not.toMatch(/coming soon/i);
    }
  });

  test("the signed-out landing page does not advertise it", async ({ page }) => {
    // The marketing page is the one surface a reader meets *before* any of the gates above
    // can apply to them, and it used to carry a "Limbic Nexus — the professional network
    // built for physical therapy" card in FEATURES. That is the worst version of the thing
    // this file exists to prevent: it pitches the feature to someone who then signs up and
    // finds no trace of it, which is the promise-and-withdraw that lib/nexus-visibility.ts
    // says the 404 is there to avoid.
    await page.goto("/");
    await expect(page.getByText(/nexus/i)).toHaveCount(0);
  });

  test("the nav badge endpoint reports no Nexus requests", async ({ page }) => {
    const email = freshEmail("nexus-badge");
    await signUpAndEnterApp(page, email);

    const res = await page.request.get("/api/navigation-badges");
    expect(res.status()).toBe(200);
    // Shape is unchanged for the client, but a non-admin's count is never anything but 0 —
    // a number here would be a signal that a feature they cannot see exists.
    expect((await res.json()).nexusRequestCount).toBe(0);
  });
});

/** The PT industry stock ticker was removed outright. Its Profile toggle going with it is
 *  the part worth asserting: a toggle for a widget that no longer exists is a dead control
 *  that silently does nothing. */
test("the removed stock widget leaves no Profile toggle behind", async ({ page }) => {
  const email = freshEmail("no-stock");
  await signUpAndEnterApp(page, email);

  await page.goto("/profile");
  await expect(page.getByText(/PT Industry Index/i)).toHaveCount(0);
});

/**
 * The gates above all hide *screens*. A Server Action is an endpoint, so hiding the button
 * that calls it proves nothing: the action ids ship in the client bundle wherever a
 * component importing them is bundled, and an account that opted into Nexus before it went
 * admin-only would still satisfy a bare `nexusOptIn` check. Every write in
 * app/actions/nexus.ts therefore resolves its caller through `nexusMember()`, which folds in
 * nexusVisibleTo.
 *
 * That invariant cannot be reached through the UI — there is no button left to press — so
 * it is asserted against the source instead, the same way src/styles/global-css-scope.test.ts
 * guards a rule no rendered page can show. A new action added later with a hand-written
 * `getCurrentUser()` check is exactly the regression this catches.
 */
test("every Nexus write action resolves its caller through the visibility gate", () => {
  const source = readFileSync(join(process.cwd(), "src/app/actions/nexus.ts"), "utf8");
  const actions = [...source.matchAll(/export async function (\w+)\(([\s\S]*?)\n}/g)];
  expect(actions.length, "no exported actions found — did the file move?").toBeGreaterThan(0);

  for (const [, name, body] of actions) {
    // leaveNexusAction is the documented exception: it only ever deletes the caller's own
    // rows, so it stays reachable for someone Nexus is hidden from. optInToNexusAction
    // cannot use nexusMember() either — it creates the membership nexusMember() requires —
    // so it calls nexusVisibleTo directly.
    if (name === "leaveNexusAction") continue;
    const gated = name === "optInToNexusAction" ? /nexusVisibleTo\(user\)/ : /await nexusMember\(\)/;
    expect(body, `${name} does not gate on Nexus visibility`).toMatch(gated);
    if (name !== "optInToNexusAction") {
      expect(body, `${name} still calls getCurrentUser() directly`).not.toMatch(/getCurrentUser\(\)/);
    }
  }
});
