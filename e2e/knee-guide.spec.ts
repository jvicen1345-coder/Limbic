import { test, expect } from "@playwright/test";
import { isServableGuide } from "@/lib/guides";
import { grantLimbicStudent, signUpAndEnterApp } from "./helpers";

const SLUG = "knee-examination";
const URL = `/student/guides/${SLUG}`;

/** The knee guide's own recall coverage. The shared assertion next door is written against the
 *  shoulder's markup - its last figure carries a .t1 line, which the knee's legends do not - so
 *  the knee needs its own. It also covers the one thing no other guide has: a figure whose
 *  orientation key must survive recall, because a plateau seen from above is unreadable without
 *  it and blurring the key would hand the reader back the blob the key exists to explain.
 *
 *  Skipped while the guide is still marked coming soon; it starts running the day it ships. */
test.describe("Knee guide asset", () => {
  test.skip(!isServableGuide(SLUG), "knee guide is still marked coming soon");

  test("recall hides every figure legend, keeps the key, and lifts one entry at a time", async ({ page }) => {
    const email = `pw-knee-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@school.edu`;
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);
    await page.goto(URL);

    const legends = page.locator("figure:has(.figgrid > div)");
    const count = await legends.count();
    expect(count, "figures carrying a legend").toBeGreaterThan(0);

    await page.getByRole("button", { name: "Recall all" }).click();

    for (let i = 0; i < count; i++) {
      const fig = legends.nth(i);
      const title = (await fig.locator(".figtitle").textContent())?.trim() ?? `figure ${i}`;
      await expect(fig, `${title} was skipped by recall`).toHaveClass(/labels-hidden/);
      await expect(fig.locator(".figgrid .t1, .figgrid .t2").first(), `${title} leaks its answer`)
        .toHaveCSS("filter", "blur(5px)");
      await expect(fig.locator(".figgrid .lbl").first(), `${title} hides its own prompt`)
        .toHaveCSS("filter", "none");
    }

    // The key says what the drawing is a picture of. Blurring it with the labels would leave
    // the reader an unlabelled shape at exactly the moment they need to name its parts.
    const keyed = page.locator("figure:has(.figkey)");
    await expect(keyed.locator(".figkey text").first(), "the key was blurred with the labels")
      .toHaveCSS("filter", "none");

    const grid = legends.last().locator(".figgrid > div");
    await grid.first().click();
    await expect(grid.first().locator(".t1, .t2")).toHaveCSS("filter", "none");
    await expect(grid.nth(1).locator(".t1, .t2"), "lifting one entry revealed its neighbour")
      .toHaveCSS("filter", "blur(5px)");
  });
});
