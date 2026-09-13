import { test, expect, type Page } from "@playwright/test";
import { freshEmail, setUserColumn, signUpAndEnterApp } from "./helpers";

async function setAppTheme(page: Page, theme: "light" | "dark") {
  await page.evaluate((next) => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private browsing / storage disabled — attribute still applies for this session.
    }
  }, theme);
}

async function nativeColorScheme(page: Page) {
  return page.locator(".date-field-native").first().evaluate((el) => getComputedStyle(el).colorScheme);
}

async function displayBackground(page: Page) {
  return page.locator(".date-field-display").first().evaluate((el) => getComputedStyle(el).backgroundColor);
}

/** Hidden overlay date inputs do not always emit React onChange from Playwright's fill()
 *  (especially on a phone viewport). Set the native value and fire the same events a
 *  picker commit would. */
async function setNativeDate(page: Page, iso: string) {
  await page.locator(".date-field-native").first().evaluate((el, value) => {
    const input = el as HTMLInputElement;
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    descriptor?.set?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, iso);
}

test.describe("Credentials date field theme", () => {
  test("native picker color-scheme follows the app theme; clear still works", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("cred-date-theme"));
    await page.goto("/profile/credentials");
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
    await expect(page.getByText("Professional dates")).toBeVisible();

    const native = page.locator(".date-field-native").first();
    const display = page.locator(".date-field-display").first();
    await expect(native).toHaveCount(1);
    await expect(display).toBeVisible();

    await setAppTheme(page, "light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await nativeColorScheme(page)).toBe("light");
    const lightBg = await displayBackground(page);
    await expect(display).toHaveCSS("opacity", "1");

    await setAppTheme(page, "dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await nativeColorScheme(page)).toBe("dark");
    const darkBg = await displayBackground(page);
    // Themed pill stays a surface token, not a white native box (the #471 regression).
    expect(darkBg).not.toBe("rgb(255, 255, 255)");
    expect(darkBg).not.toBe(lightBg);

    // Commit via the native control (hidden overlay) then clear with the explicit x.
    await setNativeDate(page, "2026-09-13");
    await expect(display).toHaveText("Sep 13, 2026");
    await page.getByRole("button", { name: "Clear CEU deadline" }).click();
    await expect(display).toHaveText("Not set");
  });

  test("clear works on a phone viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const email = freshEmail("cred-date-touch");
    await signUpAndEnterApp(page, email);
    // Seed a saved date so this test is about the x control (including tap), not the picker.
    await setUserColumn(email, "ceuDeadline", "2026-11-01T12:00:00.000Z");
    await page.goto("/profile/credentials");
    await expect(page.getByText("Professional dates")).toBeVisible();

    const display = page.locator(".date-field-wrap").first().locator(".date-field-display");
    await expect(display).toHaveText("Nov 1, 2026");
    const clear = page.getByRole("button", { name: "Clear CEU deadline" });
    await clear.scrollIntoViewIfNeeded();
    await clear.tap();
    await expect(display).toHaveText("Not set");

    await setAppTheme(page, "dark");
    expect(await nativeColorScheme(page)).toBe("dark");
    expect(await displayBackground(page)).not.toBe("rgb(255, 255, 255)");
  });
});
