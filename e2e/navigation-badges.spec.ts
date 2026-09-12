import { test, expect } from "@playwright/test";
import { freshEmail, signUpAndEnterApp } from "./helpers";

const BADGES_URL = "**/api/navigation-badges";

test.describe("navigation badges", () => {
  test("rejects a signed-out request without making badge data public", async ({ request }) => {
    const response = await request.get("/api/navigation-badges");

    expect(response.status()).toBe(401);
    expect(response.headers()["cache-control"]).toContain("private");
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("loads counts in the background without blocking the shell", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("navigation-badges"));

    // Exercise the real authenticated endpoint once as a contract check. Live-news
    // failures degrade to an empty APTA list, so this remains deterministic and never
    // asserts on the external feed's current contents.
    const response = await page.request.get("/api/navigation-badges");
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("private");
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(await response.json()).toEqual({
      aptaCount: expect.any(Number),
      nexusRequestCount: 0,
      savedCount: 0,
      clinicMembership: null,
    });

    let markRequestStarted!: () => void;
    const requestStarted = new Promise<void>((resolve) => {
      markRequestStarted = resolve;
    });
    let releaseBadges!: () => void;
    const badgesReleased = new Promise<void>((resolve) => {
      releaseBadges = resolve;
    });

    await page.route(BADGES_URL, async (route) => {
      markRequestStarted();
      await badgesReleased;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "Cache-Control": "private, no-store" },
        body: JSON.stringify({ aptaCount: 4, nexusRequestCount: 2, savedCount: 7, clinicMembership: null }),
      });
    });

    // A hard load remounts AppShell and starts the background request. Keep that request
    // pending to prove neither the shared chrome nor the route content waits for it.
    const navigation = page.goto("/crossword");
    await requestStarted;
    await expect(page.getByRole("navigation").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mini Crossword" })).toBeVisible();
    await expect(page.getByText("7 saved")).toHaveCount(0);

    releaseBadges();
    await navigation;
    await expect(page.getByText("7 saved")).toBeAttached();
    await page.getByRole("button", { name: "Articles" }).click();
    await expect(page.getByRole("link", { name: /News 4/ })).toBeVisible();

    // Failed badge chrome is equally non-blocking and must not manufacture zero values.
    await page.unroute(BADGES_URL);
    await page.route(BADGES_URL, async (route) => {
      await route.fulfill({ status: 503, body: "Unavailable" });
    });
    await page.reload();
    await expect(page.getByRole("navigation").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mini Crossword" })).toBeVisible();
    await expect(page.getByText(/\d+ saved/)).toHaveCount(0);
    await page.getByRole("button", { name: "Articles" }).click();
    await expect(page.getByRole("link", { name: "News", exact: true })).toBeVisible();
  });
});
