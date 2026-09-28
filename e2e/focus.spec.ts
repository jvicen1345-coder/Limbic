import { test, expect } from "@playwright/test";
import { freshEmail, grantLimbicStudent, signUpAndEnterApp } from "./helpers";

/**
 * Focus timer — /student/focus (components/student/FocusTimer.tsx).
 *
 * Covers what a student sees before any AI is involved: the page is reachable from the
 * Atrium, the dial counts down and pauses, the tools tray opens, and a preset changes the
 * block length. The recall check itself calls Claude and is not exercised here.
 */

test.describe("Focus timer", () => {
  test("is linked from the Atrium and runs a focus block", async ({ page }) => {
    const email = freshEmail("focus");
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);

    await page.goto("/student");
    await page.getByRole("link", { name: /Focus Timer/ }).first().click();
    await page.waitForURL(/\/student\/focus/);

    await expect(page.getByRole("heading", { name: "Focus" })).toBeVisible();
    await expect(page.getByText("25:00")).toBeVisible();
    await expect(page.getByText("Focus · 1 of 4")).toBeVisible();

    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
    await expect(page.getByText("24:5", { exact: false })).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByText("25:00")).toBeVisible();
  });

  test("tools tray changes the block length", async ({ page }) => {
    const email = freshEmail("focus-tray");
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);

    await page.goto("/student/focus");
    await page.getByRole("button", { name: "Settings", exact: true }).first().click();
    await page.getByRole("button", { name: "Deep 50 / 10" }).click();
    await page.getByRole("button", { name: "Done" }).click();
    await expect(page.getByText("50:00")).toBeVisible();

    await page.getByRole("button", { name: /^Review/ }).first().click();
    await expect(page.getByText("Nothing due.")).toBeVisible();
  });
});
