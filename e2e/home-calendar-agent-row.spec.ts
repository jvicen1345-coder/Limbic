import { expect, test, type Page } from "@playwright/test";
import { freshEmail, signUpAndEnterApp } from "./helpers";

/** Layout contract for the home calendar + agent row (issue #533).
 *  Side-by-side only when the slot can hold 340 + 20 + 340. Narrower main columns
 *  (the sidebar+aside band from ~800–1200) stack both full width. ≤799 stays stacked
 *  even when the column itself is wide enough for two cards. */

const PAIR_MIN = 700;

type RowBoxes = {
  rowWidth: number;
  cal: { top: number; left: number; right: number; width: number; bottom: number };
  agent: { top: number; left: number; right: number; width: number; bottom: number };
  main: { left: number; right: number };
  overflow: number;
};

function measureRow(page: Page) {
  return page.evaluate(() => {
    const row = document.querySelector(".home-calendar-agent-row");
    const cal = document.querySelector(".home-calendar-top-wrap");
    const agent = document.querySelector(".home-agent-card-wrap");
    const main = document.querySelector(".home-main-col");
    const scroller = document.querySelector(".app-main");
    if (!row || !cal || !agent || !main || !scroller) return null;
    const box = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width };
    };
    const rowBox = box(row);
    const mainBox = box(main);
    return {
      rowWidth: rowBox.width,
      cal: box(cal),
      agent: box(agent),
      main: { left: mainBox.left, right: mainBox.right },
      overflow: scroller.scrollWidth - scroller.clientWidth,
    };
  });
}

function expectInsideMain(boxes: RowBoxes) {
  expect(boxes.overflow).toBeLessThanOrEqual(1);
  expect(boxes.cal.left).toBeGreaterThanOrEqual(boxes.main.left - 1);
  expect(boxes.agent.left).toBeGreaterThanOrEqual(boxes.main.left - 1);
  expect(boxes.cal.right).toBeLessThanOrEqual(boxes.main.right + 1);
  expect(boxes.agent.right).toBeLessThanOrEqual(boxes.main.right + 1);
}

function expectStackedFullWidth(boxes: RowBoxes) {
  expect(boxes.agent.top).toBeGreaterThanOrEqual(boxes.cal.bottom - 2);
  expect(boxes.cal.width).toBeGreaterThan(boxes.rowWidth - 2);
  expect(boxes.agent.width).toBeGreaterThan(boxes.rowWidth - 2);
}

function expectSideBySide(boxes: RowBoxes) {
  expect(Math.abs(boxes.cal.top - boxes.agent.top)).toBeLessThan(8);
  expect(boxes.agent.left).toBeGreaterThanOrEqual(boxes.cal.right - 2);
  expect(boxes.cal.width).toBeGreaterThan(330);
  expect(boxes.cal.width).toBeLessThan(350);
  expect(boxes.agent.width).toBeGreaterThan(270);
  expect(boxes.agent.width).toBeLessThan(350);
}

test("calendar and agent stay readable from phone through mid-width desktop", async ({ page }) => {
  await signUpAndEnterApp(page, freshEmail("cal-agent-row"));
  await expect(page.locator(".home-calendar-agent-row")).toBeVisible();
  await expect(page.locator(".home-calendar-top-wrap")).toBeVisible();

  for (const width of [390, 780, 800, 1024, 1200]) {
    await page.setViewportSize({ width, height: 900 });
    const boxes = await measureRow(page);
    expect(boxes, `row missing at ${width}px`).not.toBeNull();
    expectInsideMain(boxes!);
    expectStackedFullWidth(boxes!);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  const wide = await measureRow(page);
  expect(wide).not.toBeNull();
  expect(wide!.rowWidth).toBeGreaterThanOrEqual(PAIR_MIN);
  expectInsideMain(wide!);
  expectSideBySide(wide!);
});
