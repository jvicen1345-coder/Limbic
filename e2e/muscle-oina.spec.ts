import { test, expect } from "@playwright/test";
import { grantLimbicStudent, signUpAndEnterApp } from "./helpers";

const URL = "/student/guides/muscle-oina";

/** Recall on the muscle OINA guide used to leave .figgrid .t1 readable, and a legend entry
 *  could not be revealed from the keyboard or from a tap — only, if at all, by hovering, which
 *  a phone never does. The knee guide hides those lines and lifts one entry on click. This
 *  guide does the same, and the entry is a button so Enter, Space, and a tap all work. */
test.describe("Muscle OINA recall", () => {
  test("recall hides figure legends and lifts one entry by click or keyboard", async ({ page }) => {
    const email = `pw-oina-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@school.edu`;
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);
    await page.goto(URL);

    const legends = page.locator("figure:has(.figgrid > div)");
    const count = await legends.count();
    expect(count, "figures carrying a legend").toBe(2);

    await page.getByRole("button", { name: "Recall all" }).click();

    for (let i = 0; i < count; i++) {
      const fig = legends.nth(i);
      const title = (await fig.locator(".figtitle").textContent())?.trim() ?? `figure ${i}`;
      await expect(fig, `${title} was skipped by recall`).toHaveClass(/labels-hidden/);
      await expect(fig.locator(".figgrid .t1").first(), `${title} leaks its answer`).toHaveCSS(
        "filter",
        "blur(5px)",
      );
      await expect(fig.locator(".figgrid .lbl").first(), `${title} hides its own prompt`).toHaveCSS(
        "filter",
        "none",
      );
    }

    const grid = legends.last().locator(".figgrid > div");
    const first = grid.first();
    const second = grid.nth(1);
    const third = grid.nth(2);

    await first.hover();
    await expect(first.locator(".t1"), "hover revealed a legend entry").toHaveCSS("filter", "blur(5px)");

    await first.click();
    await expect(first).toHaveAttribute("aria-pressed", "true");
    await expect(first.locator(".t1")).toHaveCSS("filter", "none");
    await expect(second.locator(".t1"), "lifting one entry revealed its neighbour").toHaveCSS(
      "filter",
      "blur(5px)",
    );

    await second.focus();
    await page.keyboard.press("Enter");
    await expect(second).toHaveAttribute("aria-pressed", "true");
    await expect(second.locator(".t1")).toHaveCSS("filter", "none");
    await expect(third.locator(".t1"), "the keyboard revealed a neighbour").toHaveCSS("filter", "blur(5px)");

    await page.keyboard.press("Space");
    await expect(second, "Space toggles the focused entry closed again").toHaveAttribute("aria-pressed", "false");
    await expect(second.locator(".t1")).toHaveCSS("filter", "blur(5px)");
    await expect(first.locator(".t1"), "closing one entry re-hid another").toHaveCSS("filter", "none");
  });

  test("the drill starts closed, the checklist box is tappable, and the scapula figure is above its row", async ({
    page,
  }) => {
    const email = `pw-oina-nits-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@school.edu`;
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);
    await page.goto(URL);

    const together = page.locator("#together");
    await expect(together).toContainText("See the figure above.");
    await expect(together).not.toContainText("See the figure below.");
    const figureTop = await together.locator("figure").boundingBox();
    const rowTop = await together.getByText("See the figure above.").boundingBox();
    expect(figureTop && rowTop && figureTop.y < rowTop.y, "the figure sits above the row that cites it").toBe(
      true,
    );

    const box = await page.locator("#checklist input[type=checkbox]").first().boundingBox();
    expect(box?.width ?? 0, "checklist box is still a 15px tap").toBeGreaterThanOrEqual(24);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);

    const answer = page.locator("#drill tbody td.mask-on").first();
    await expect(answer, "the drill answer column should start masked").toBeVisible();
    await expect(answer.locator(".maskwrap")).toHaveCSS("filter", "blur(5.5px)");
    const neighbour = page.locator("#drill tbody td.mask-on").nth(1);
    await expect(neighbour.locator(".maskwrap")).toHaveCSS("filter", "blur(5.5px)");

    await answer.locator(".maskwrap").focus();
    await page.keyboard.press("Enter");
    await expect(answer).toHaveClass(/shown/);
    await expect(answer.locator(".maskwrap")).toHaveCSS("filter", "none");
    await expect(neighbour.locator(".maskwrap"), "revealing one drill answer revealed the next").toHaveCSS(
      "filter",
      "blur(5.5px)",
    );
  });
});
