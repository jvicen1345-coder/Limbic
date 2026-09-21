import { expect, test, type Page } from "@playwright/test";
import { freshEmail, setUserColumn, signUpAndEnterApp } from "./helpers";

/** Layout contract for the home calendar + agent row (#533 / #542 / #531).
 *  Side-by-side only when the slot can hold 340 + 20 + 340. Narrower main columns
 *  (the sidebar+aside band from ~800–1200) stack both full width. ≤799 stays stacked
 *  even when the column itself is wide enough for two cards, and the calendar wrap
 *  stays at the 340px widget density so the month grid is not full-bleed tall. */

const PAIR_MIN = 700;
const CAL_WIDGET = 340;

type Box = { top: number; left: number; right: number; width: number; bottom: number; height: number };

type RowBoxes = {
  rowWidth: number;
  cal: Box;
  agent: Box;
  dayCell: { width: number; height: number };
  dayGrid: { width: number; height: number };
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
      return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const dayButton = [...cal.querySelectorAll("button")].find((b) => {
      const label = b.getAttribute("aria-label");
      return label !== "Previous month" && label !== "Next month";
    });
    const dayGrid = dayButton?.parentElement;
    if (!dayButton || !dayGrid) return null;
    const rowBox = box(row);
    const mainBox = box(main);
    return {
      rowWidth: rowBox.width,
      cal: box(cal),
      agent: box(agent),
      dayCell: { width: dayButton.getBoundingClientRect().width, height: dayButton.getBoundingClientRect().height },
      dayGrid: { width: dayGrid.getBoundingClientRect().width, height: dayGrid.getBoundingClientRect().height },
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

/** ≤799: calendar stays at the desktop widget width (or the column, if narrower). */
function expectNarrowCompactCalendar(boxes: RowBoxes) {
  expect(boxes.agent.top).toBeGreaterThanOrEqual(boxes.cal.bottom - 2);
  const target = Math.min(CAL_WIDGET, boxes.rowWidth);
  expect(boxes.cal.width).toBeGreaterThan(target - 4);
  expect(boxes.cal.width).toBeLessThanOrEqual(target + 1);
  expect(boxes.agent.width).toBeGreaterThan(boxes.rowWidth - 2);
  expect(boxes.dayCell.width).toBeGreaterThan(30);
  expect(boxes.dayCell.width).toBeLessThan(52);
  expect(Math.abs(boxes.dayCell.width - boxes.dayCell.height)).toBeLessThan(2);
  expect(boxes.dayGrid.height).toBeLessThan(320);
  expect(boxes.dayGrid.width).toBeLessThanOrEqual(boxes.cal.width + 1);
}

function expectSideBySide(boxes: RowBoxes) {
  expect(Math.abs(boxes.cal.top - boxes.agent.top)).toBeLessThan(8);
  expect(boxes.agent.left).toBeGreaterThanOrEqual(boxes.cal.right - 2);
  expect(boxes.cal.width).toBeGreaterThan(330);
  expect(boxes.cal.width).toBeLessThan(350);
  expect(boxes.agent.width).toBeGreaterThan(270);
  expect(boxes.agent.width).toBeLessThan(350);
}

function monthLabel(offset: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offset, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

test("calendar and agent stay readable from phone through mid-width desktop", async ({ page }) => {
  const email = freshEmail("cal-agent-row");
  await signUpAndEnterApp(page, email);
  await expect(page.locator(".home-calendar-agent-row")).toBeVisible();
  await expect(page.locator(".home-calendar-top-wrap")).toBeVisible();

  for (const width of [390, 780]) {
    await page.setViewportSize({ width, height: 900 });
    const boxes = await measureRow(page);
    expect(boxes, `row missing at ${width}px`).not.toBeNull();
    expectInsideMain(boxes!);
    expectNarrowCompactCalendar(boxes!);
  }

  for (const width of [800, 1024, 1200]) {
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

  await page.setViewportSize({ width: 390, height: 900 });
  const skipTour = page.getByRole("button", { name: "Skip tour" });
  if (await skipTour.isVisible()) await skipTour.click();
  await expect(page.locator(".tour-tooltip")).toHaveCount(0);

  const cal = page.locator(".home-calendar-top-wrap");
  await expect(cal.getByText(monthLabel(0))).toBeVisible();
  const nextMonth = cal.getByRole("button", { name: "Next month" });
  const prevMonth = cal.getByRole("button", { name: "Previous month" });
  await nextMonth.evaluate((el) => el.scrollIntoView({ block: "center", inline: "nearest" }));
  await nextMonth.click();
  await expect(cal.getByText(monthLabel(1))).toBeVisible();
  await prevMonth.evaluate((el) => el.scrollIntoView({ block: "center", inline: "nearest" }));
  await prevMonth.click();
  await expect(cal.getByText(monthLabel(0))).toBeVisible();

  const now = new Date();
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-15T12:00:00.000Z`;
  await setUserColumn(email, "ceuDeadline", iso);
  await page.goto("/home");
  await expect(cal).toBeVisible();
  const day = cal.getByRole("button", { name: "15", exact: true });
  await day.evaluate((el) => el.scrollIntoView({ block: "center", inline: "nearest" }));
  await day.click();
  await expect(cal.getByText("CEU Deadline", { exact: true })).toBeVisible();
});
