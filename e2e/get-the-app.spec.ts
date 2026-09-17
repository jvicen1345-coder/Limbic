import { test, expect, type Page } from "@playwright/test";
import { freshEmail, setUserColumn, signUpAndEnterApp } from "./helpers";

/**
 * Profile's Get the App card (#494): the dismiss switch was already built
 * (GetTheAppToggle + setGetTheAppDismissedAction + User.getTheAppDismissed) but never
 * rendered. This covers the wiring — optimistic compact done state, persistence, the Home
 * shortcut icon, and installed-app auto-hide (Profile card and Home shortcut) that must
 * not write the database.
 */

function getTheAppCard(page: Page) {
  return page.locator("details.collapsible-card").filter({
    has: page.locator(".collapsible-card-title", { hasText: "Get the app" }),
  });
}

async function openGetTheAppCard(page: Page) {
  const card = getTheAppCard(page);
  await card.locator("summary").click();
  await expect(card).toHaveAttribute("open", "");
  return card;
}

/** iOS path only: `navigator.standalone`. Deliberately does not mock `matchMedia` —
 *  CSS `@media (display-mode: standalone)` is a real media query and is not flipped by
 *  patching `window.matchMedia`. The iOS test must hide via the JS `--installed` class
 *  while `matchMedia("(display-mode: standalone)").matches` stays false. */
function mockIosStandalone() {
  Object.defineProperty(window.navigator, "standalone", {
    configurable: true,
    get: () => true,
  });
}

/** Android/desktop JS path. `addInitScript` re-applies on every navigation of this page
 *  (unlike CDP `Emulation.setEmulatedMedia`, which does not stick across `goto`). This
 *  mocks `matchMedia` so `useStandaloneDisplay` adds `--installed`; it does not make the
 *  CSS `@media (display-mode: standalone)` rule match — hide is asserted via that class. */
function mockMatchMediaStandalone() {
  const original = window.matchMedia.bind(window);
  window.matchMedia = (query: string) => {
    if (query.includes("display-mode: standalone")) {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {
          return false;
        },
      } as MediaQueryList;
    }
    return original(query);
  };
}

async function readGetTheAppDismissed(email: string): Promise<number> {
  const { createClient } = await import("@libsql/client");
  let lastError: unknown;
  for (let attempt = 0; ; attempt++) {
    const db = createClient({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
    try {
      await db.execute("PRAGMA busy_timeout = 10000");
      const result = await db.execute({
        sql: "SELECT getTheAppDismissed FROM User WHERE email = ?",
        args: [email],
      });
      const value = result.rows[0]?.getTheAppDismissed;
      if (value === 1 || value === 0) return Number(value);
      if (typeof value === "bigint") return Number(value);
      lastError = new Error(`no getTheAppDismissed for ${email} (got ${String(value)})`);
    } catch (error) {
      if (!String(error).includes("SQLITE_BUSY")) throw error;
      lastError = error;
    } finally {
      db.close();
    }
    if (attempt >= 4) throw lastError;
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
  }
}

test.describe("Get the App dismiss", () => {
  test("switch collapses to a compact done state, persists, and hides the Home shortcut", async ({
    page,
  }) => {
    const email = freshEmail("get-the-app-dismiss");
    await signUpAndEnterApp(page, email);

    await expect(page.getByRole("link", { name: "Get the app" })).toBeVisible();

    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();

    const card = await openGetTheAppCard(page);
    await expect(card.getByText("iPhone & iPad (Safari)")).toBeVisible();
    const hideSwitch = card.getByRole("switch", { name: "Hide the Get the App instructions" });
    const showSwitch = card.getByRole("switch", { name: "Show the Get the App instructions" });
    await expect(hideSwitch).toHaveAttribute("aria-checked", "false");
    await expect(card.getByText("Shown")).toBeVisible();
    await expect(card.getByText("Already added?")).toHaveCount(0);

    await hideSwitch.click();
    await expect(showSwitch).toHaveAttribute("aria-checked", "true");
    await expect(card.getByText("Hidden", { exact: true })).toBeVisible();
    await expect(card.getByText("Install instructions are hidden")).toBeVisible();
    await expect(card.getByText("iPhone & iPad (Safari)")).toHaveCount(0);
    await expect(page.locator("#get-the-app")).toHaveCount(1);
    await expect(showSwitch).toBeEnabled();
    expect(await readGetTheAppDismissed(email)).toBe(1);

    await page.reload();
    await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
    const reloaded = await openGetTheAppCard(page);
    await expect(reloaded.getByRole("switch", { name: "Show the Get the App instructions" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(reloaded.getByText("Install instructions are hidden")).toBeVisible();
    await expect(reloaded.getByText("iPhone & iPad (Safari)")).toHaveCount(0);

    await page.goto("/home");
    await expect(page.getByRole("link", { name: "Get the app" })).toHaveCount(0);

    await page.goto("/profile");
    const again = await openGetTheAppCard(page);
    await again.getByRole("switch", { name: "Show the Get the App instructions" }).click();
    await expect(again.getByRole("switch", { name: "Hide the Get the App instructions" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    await expect(again.getByRole("switch", { name: "Hide the Get the App instructions" })).toBeEnabled();
    await expect(again.getByText("iPhone & iPad (Safari)")).toBeVisible();
    await expect(again.getByText("Add Limbic to your home screen")).toBeVisible();

    await page.goto("/home");
    await expect(page.getByRole("link", { name: "Get the app" })).toBeVisible();
  });

  test("seeded dismissed preference opens in the compact done state", async ({ page }) => {
    const email = freshEmail("get-the-app-seeded");
    await signUpAndEnterApp(page, email);
    await setUserColumn(email, "getTheAppDismissed", 1);

    await page.goto("/profile");
    const card = await openGetTheAppCard(page);
    await expect(card.getByText("Install instructions are hidden")).toBeVisible();
    await expect(card.getByText("iPhone & iPad (Safari)")).toHaveCount(0);
    await expect(card.getByRole("switch", { name: "Show the Get the App instructions" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await page.goto("/home");
    await expect(page.getByRole("link", { name: "Get the app" })).toHaveCount(0);
  });

  test("failed dismiss action rolls the compact UI back and does not persist", async ({ page }) => {
    const email = freshEmail("get-the-app-rollback");
    await signUpAndEnterApp(page, email);

    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
    const card = await openGetTheAppCard(page);
    const hideSwitch = card.getByRole("switch", { name: "Hide the Get the App instructions" });
    const showSwitch = card.getByRole("switch", { name: "Show the Get the App instructions" });

    await page.route("**/*", async (route) => {
      const request = route.request();
      if (request.method() === "POST" && request.headers()["next-action"]) {
        // Delay so the optimistic compact state is observable, then fail the round trip.
        await new Promise((resolve) => setTimeout(resolve, 400));
        await route.fulfill({ status: 500, body: "dismiss failed" });
        return;
      }
      await route.continue();
    });

    await hideSwitch.click();
    await expect(showSwitch).toHaveAttribute("aria-checked", "true");
    await expect(card.getByText("Install instructions are hidden")).toBeVisible();
    await expect(hideSwitch).toHaveAttribute("aria-checked", "false");
    await expect(card.getByText("iPhone & iPad (Safari)")).toBeVisible();
    await expect(card.getByText("Shown")).toBeVisible();
    await expect(hideSwitch).toBeEnabled();
    expect(await readGetTheAppDismissed(email)).toBe(0);
  });

  test("display-mode standalone hides the card without writing the database", async ({ page }) => {
    const email = freshEmail("get-the-app-standalone");
    await signUpAndEnterApp(page, email);

    // Only Profile posts `setGetTheAppDismissedAction`. Home fires unrelated Next-Action
    // POSTs (OpenAccessPill, TimeZoneSync) that must not count as a dismiss write.
    const profileActionPosts: string[] = [];
    page.on("request", (request) => {
      if (request.method() !== "POST" || !request.headers()["next-action"]) return;
      if (new URL(request.url()).pathname === "/profile") profileActionPosts.push(request.url());
    });

    const hydration: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (/hydrat/i.test(text)) hydration.push(text);
    });

    await page.addInitScript(mockMatchMediaStandalone);
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
    await expect
      .poll(async () => page.evaluate(() => window.matchMedia("(display-mode: standalone)").matches))
      .toBe(true);
    expect(
      await page.evaluate(() => Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)),
    ).toBe(false);
    await expect(getTheAppCard(page)).toHaveClass(/get-the-app-card--installed/);
    await expect(getTheAppCard(page)).toBeHidden();
    await expect(getTheAppCard(page)).toHaveCSS("display", "none");
    await expect(page.locator("#get-the-app")).toHaveCount(1);
    expect(profileActionPosts).toEqual([]);
    expect(hydration).toEqual([]);
    expect(await readGetTheAppDismissed(email)).toBe(0);

    await page.goto("/home");
    await expect
      .poll(async () => page.evaluate(() => window.matchMedia("(display-mode: standalone)").matches))
      .toBe(true);
    await expect(page.locator(".get-the-app-home-shortcut")).toHaveClass(
      /get-the-app-home-shortcut--installed/,
    );
    await expect(page.getByRole("link", { name: "Get the app" })).toHaveCount(0);
    expect(profileActionPosts).toEqual([]);
    expect(await readGetTheAppDismissed(email)).toBe(0);

    const tab = await page.context().newPage();
    await tab.goto("/profile");
    await expect(tab.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
    const card = await openGetTheAppCard(tab);
    await expect(card.getByText("iPhone & iPad (Safari)")).toBeVisible();
    await tab.goto("/home");
    await expect(tab.getByRole("link", { name: "Get the app" })).toBeVisible();
    await tab.close();
  });

  test("iOS navigator.standalone hides the card without writing the database", async ({ page }) => {
    const email = freshEmail("get-the-app-ios");
    await signUpAndEnterApp(page, email);

    await page.addInitScript(mockIosStandalone);
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.matchMedia("(display-mode: standalone)").matches)).toBe(
      false,
    );
    expect(
      await page.evaluate(() => Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)),
    ).toBe(true);
    await expect(getTheAppCard(page)).toHaveClass(/get-the-app-card--installed/);
    await expect(getTheAppCard(page)).toBeHidden();
    expect(await readGetTheAppDismissed(email)).toBe(0);

    await page.goto("/home");
    await expect(page.locator(".get-the-app-home-shortcut")).toHaveClass(
      /get-the-app-home-shortcut--installed/,
    );
    await expect(page.getByRole("link", { name: "Get the app" })).toHaveCount(0);
    expect(await readGetTheAppDismissed(email)).toBe(0);

    const tab = await page.context().newPage();
    await tab.goto("/profile");
    const card = await openGetTheAppCard(tab);
    await expect(card.getByText("Add Limbic to your home screen")).toBeVisible();
    await tab.goto("/home");
    await expect(tab.getByRole("link", { name: "Get the app" })).toBeVisible();
    await tab.close();
  });
});
