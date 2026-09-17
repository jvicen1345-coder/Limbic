import { test, expect, type Page } from "@playwright/test";
import { freshEmail, setUserColumn, signUpAndEnterApp } from "./helpers";

/**
 * Profile's Get the App card (#494): the dismiss switch was already built
 * (GetTheAppToggle + setGetTheAppDismissedAction + User.getTheAppDismissed) but never
 * rendered. This covers the wiring — optimistic compact done state, persistence, the Home
 * shortcut icon, and installed-app auto-hide that must not write the database.
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

/** Runs in the page before any app script. The argument is passed through
 *  `addInitScript` because Playwright serializes the function and cannot close over
 *  Node-side locals. */
function mockStandaloneDisplay(source: "display-mode" | "ios-standalone") {
  if (source === "display-mode") {
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
    return;
  }
  Object.defineProperty(window.navigator, "standalone", {
    configurable: true,
    get: () => true,
  });
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
      if (value === true || value === 1) return 1;
      if (value === false || value === 0) return 0;
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
    const dismiss = card.getByRole("switch", { name: "Hide the Get the App instructions" });
    await expect(dismiss).toHaveAttribute("aria-checked", "false");

    await dismiss.click();
    await expect(dismiss).toHaveAttribute("aria-checked", "true");
    await expect(card.getByText("You've added Limbic")).toBeVisible();
    await expect(card.getByText("iPhone & iPad (Safari)")).toHaveCount(0);
    await expect(page.locator("#get-the-app")).toHaveCount(1);

    await page.reload();
    await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
    const reloaded = await openGetTheAppCard(page);
    await expect(reloaded.getByRole("switch", { name: "Hide the Get the App instructions" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(reloaded.getByText("You've added Limbic")).toBeVisible();
    await expect(reloaded.getByText("iPhone & iPad (Safari)")).toHaveCount(0);

    await page.goto("/home");
    await expect(page.getByRole("link", { name: "Get the app" })).toHaveCount(0);

    await page.goto("/profile");
    const again = await openGetTheAppCard(page);
    await again.getByRole("switch", { name: "Hide the Get the App instructions" }).click();
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
    await expect(card.getByText("You've added Limbic")).toBeVisible();
    await expect(card.getByText("iPhone & iPad (Safari)")).toHaveCount(0);
    await expect(card.getByRole("switch", { name: "Hide the Get the App instructions" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await page.goto("/home");
    await expect(page.getByRole("link", { name: "Get the app" })).toHaveCount(0);
  });

  test("display-mode standalone hides the card without writing the database", async ({ page }) => {
    const email = freshEmail("get-the-app-standalone");
    await signUpAndEnterApp(page, email);

    let nextActionPosts = 0;
    page.on("request", (request) => {
      if (request.method() === "POST" && request.headers()["next-action"]) nextActionPosts += 1;
    });

    const hydration: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (/hydrat/i.test(text)) hydration.push(text);
    });

    await page.addInitScript(mockStandaloneDisplay, "display-mode");
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
    await expect(getTheAppCard(page)).toBeHidden();
    await expect(page.locator("#get-the-app")).toHaveCount(1);
    expect(nextActionPosts).toBe(0);
    expect(hydration).toEqual([]);
    expect(await readGetTheAppDismissed(email)).toBe(0);

    const tab = await page.context().newPage();
    await tab.goto("/profile");
    await expect(tab.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
    const card = await openGetTheAppCard(tab);
    await expect(card.getByText("iPhone & iPad (Safari)")).toBeVisible();
    await tab.close();
  });

  test("iOS navigator.standalone hides the card without writing the database", async ({ page }) => {
    const email = freshEmail("get-the-app-ios");
    await signUpAndEnterApp(page, email);

    await page.addInitScript(mockStandaloneDisplay, "ios-standalone");
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
    await expect(getTheAppCard(page)).toBeHidden();
    expect(await readGetTheAppDismissed(email)).toBe(0);

    const tab = await page.context().newPage();
    await tab.goto("/profile");
    const card = await openGetTheAppCard(tab);
    await expect(card.getByText("Add Limbic to your home screen")).toBeVisible();
    await tab.close();
  });
});
