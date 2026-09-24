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

  test("section and reference jumps clear the wrapped sticky nav", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const email = `pw-oina-nav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@school.edu`;
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);
    await page.goto(URL);

    const nav = page.locator("nav");
    async function clearance(selector: string) {
      const navBox = await nav.boundingBox();
      const target = await page.locator(selector).boundingBox();
      expect(navBox, "sticky nav").toBeTruthy();
      expect(target, selector).toBeTruthy();
      return { navBottom: navBox!.y + navBox!.height, top: target!.y };
    }

    // The wrapped link row is much taller than the template's old 60px offset.
    const navHeight = await nav.evaluate((el) => el.offsetHeight);
    expect(navHeight, "nav should wrap at 1280").toBeGreaterThan(100);
    const sectionMargin = await page
      .locator("#shoulder")
      .evaluate((el) => parseFloat(getComputedStyle(el).scrollMarginTop));
    expect(Math.abs(sectionMargin - navHeight), "section offset tracks --navh").toBeLessThan(1);
    const liMargin = await page
      .locator("#refs li")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).scrollMarginTop));
    // #refs padding-top is 26px, so a cited entry keeps that clearance over the bar.
    expect(Math.abs(liMargin - (navHeight + 26)), "reference offset stays 26px over the nav").toBeLessThan(1);

    for (const href of ["#checklist", "#shoulder", "#breathing"]) {
      await page.locator(`nav .navlinks a[href="${href}"]`).click();
      const { navBottom, top } = await clearance(`${href} h2`);
      expect(top, `${href} heading buried under the nav`).toBeGreaterThanOrEqual(navBottom - 1);
      expect(top - navBottom, `${href} heading left a large gap`).toBeLessThan(16);
    }

    await page.goto(`${URL}#elbow`);
    const elbow = await clearance("#elbow h2");
    expect(elbow.top, "hash jump buried the heading").toBeGreaterThanOrEqual(elbow.navBottom - 1);
    expect(elbow.top - elbow.navBottom, "hash jump left a large gap").toBeLessThan(16);

    await page.locator('nav .navlinks a[href="#refs"]').click();
    const refs = await clearance("#refs h2");
    expect(refs.top, "refs heading buried under the nav").toBeGreaterThanOrEqual(refs.navBottom - 1);
    expect(refs.top - refs.navBottom, "refs heading left a large gap").toBeLessThan(48);

    const cite = page.locator("a.cite").first();
    const citeHref = await cite.getAttribute("href");
    expect(citeHref).toMatch(/^#ref-/);
    // A pointer click can land on the sticky bar once the link has been scrolled under it.
    await cite.evaluate((el: HTMLAnchorElement) => el.click());
    const cited = await clearance(citeHref!);
    expect(cited.top, "cited reference buried under the nav").toBeGreaterThanOrEqual(cited.navBottom - 1);
    expect(cited.top - cited.navBottom, "cited reference left a large gap").toBeLessThan(48);
  });
});
