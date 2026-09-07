import { test, expect } from "@playwright/test";
import { PLAYBOOKS, playbookChecklist, playbookChecklistRows, type PlaybookBlock } from "@/lib/playbook-content";
import { parsePlaybookInline } from "@/lib/playbook-inline";
import { playbookTaughtCells } from "@/lib/playbook-taught";
import { signUpAndEnterApp } from "./helpers";

/**
 * Limbic Playbooks — the content bank (lib/playbooks/*) and the page that renders it
 * (app/(app)/student/playbooks).
 *
 * The data checks matter because a playbook is a few hundred hand-authored table rows: a
 * row with one cell too few silently renders a short row, a duplicated checklist id
 * silently ties two items to the same saved tick, and a figure block naming an id no
 * component answers to silently drops the drawing. None of those throw, so nothing but a
 * check like this catches them.
 */

function everyBlock(): { playbook: string; section: string; block: PlaybookBlock }[] {
  return PLAYBOOKS.flatMap((playbook) =>
    playbook.sections.flatMap((section) =>
      section.blocks.map((block) => ({ playbook: playbook.slug, section: section.id, block })),
    ),
  );
}

test.describe("Playbook content", () => {
  test("checklist item ids are unique within a playbook", () => {
    for (const playbook of PLAYBOOKS) {
      const ids = playbookChecklist(playbook).map((item) => item.id);
      expect(new Set(ids).size, `duplicate checklist id in ${playbook.slug}`).toBe(ids.length);
    }
  });

  test("section ids are unique within a playbook", () => {
    for (const playbook of PLAYBOOKS) {
      const ids = playbook.sections.map((section) => section.id);
      expect(new Set(ids).size, `duplicate section id in ${playbook.slug}`).toBe(ids.length);
    }
  });

  test("a table that declares column widths declares one per column", () => {
    const problems: string[] = [];
    for (const { playbook, section, block } of everyBlock()) {
      if (block.kind !== "table" || !block.widths) continue;
      if (block.widths.length !== block.columns.length) {
        problems.push(`${playbook}/${section}: ${block.widths.length} widths, ${block.columns.length} columns`);
      }
    }
    expect(problems).toEqual([]);
  });

  test("every table row has exactly as many cells as the table has columns", () => {
    const problems: string[] = [];
    for (const { playbook, section, block } of everyBlock()) {
      if (block.kind !== "table") continue;
      block.rows.forEach((row, i) => {
        if (!Array.isArray(row)) return; // a full-width group heading spans the table
        if (row.length !== block.columns.length) {
          problems.push(`${playbook}/${section} row ${i}: ${row.length} cells, ${block.columns.length} columns`);
        }
      });
    }
    expect(problems).toEqual([]);
  });

  test("inline markup leaves no unclosed delimiters", () => {
    const strings: string[] = [];
    for (const playbook of PLAYBOOKS) {
      strings.push(playbook.summary, playbook.footer);
      for (const { block } of everyBlock()) {
        if (block.kind === "lede" || block.kind === "footnote") strings.push(block.text);
        if (block.kind === "callout") strings.push(block.body);
        if (block.kind === "figure") strings.push(block.caption);
        if (block.kind === "checklist") block.items.forEach((item) => strings.push(item.how, item.finding));
        if (block.kind === "table") {
          block.rows.forEach((row) => {
            if (Array.isArray(row)) row.forEach((cell) => strings.push(typeof cell === "string" ? cell : cell.text));
          });
        }
      }
    }
    // A stray delimiter survives the parser as literal text, so the rendered page would show
    // the asterisks rather than the emphasis the author meant.
    const leftovers = strings.filter((s) => /\*/.test(parsePlaybookInline(s).filter((n) => n.type === "text").map((n) => ("text" in n ? n.text : "")).join("")));
    expect(leftovers).toEqual([]);
  });

  test("case scenarios and every labelled line are filled in", () => {
    const problems: string[] = [];
    for (const { playbook, block } of everyBlock()) {
      if (block.kind !== "cases") continue;
      block.items.forEach((item) => {
        if (!item.scenario.trim() || !item.lines.length) problems.push(`${playbook}: empty case`);
        item.lines.forEach((line) => {
          if (!line.label.trim() || !line.body.trim()) problems.push(`${playbook}: ${item.scenario.slice(0, 40)}`);
        });
      });
    }
    expect(problems).toEqual([]);
  });

  test("drill questions and answers are both filled in", () => {
    const problems: string[] = [];
    for (const { playbook, block } of everyBlock()) {
      if (block.kind !== "drill") continue;
      block.items.forEach((item) => {
        if (!item.question.trim() || !item.answer.trim()) problems.push(`${playbook}: ${item.question}`);
      });
    }
    expect(problems).toEqual([]);
  });
});

/** Parameterized over PLAYBOOKS rather than written per region: every assertion below is
 *  derived from the playbook's own data — its section count, its figure blocks, the length
 *  of its checklist — so a new file under lib/playbooks/ is covered the moment it is added
 *  to PLAYBOOKS, and nothing here needs editing to keep up. */
test.describe("Playbook page", () => {
  for (const playbook of PLAYBOOKS) {
    const items = playbookChecklist(playbook);
    const figureBlocks = playbook.sections.flatMap((section) => section.blocks).filter((block) => block.kind === "figure");

    test(`renders the ${playbook.slug} playbook and remembers the checklist`, async ({ page }) => {
      // A .edu address rather than helpers' default @example.com — every /student route is
      // gated on hasStudentAccess (lib/session.ts), which is what that domain buys.
      await signUpAndEnterApp(page, `pw-playbook-${playbook.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@school.edu`);

      // Reached through the hub rather than by URL, so the index keeps proving it lists and
      // links every playbook — matched on the card's own heading so one playbook's name
      // being a prefix of another's can't select the wrong card.
      await page.goto("/student/playbooks");
      await page
        .locator(".playbook-hub-card")
        .filter({ has: page.getByRole("heading", { name: playbook.name, exact: true }) })
        .getByRole("link", { name: "Open" })
        .click();
      await page.waitForURL(new RegExp(`/student/playbooks/${playbook.slug}$`));
      await expect(page.getByRole("heading", { name: playbook.title })).toBeVisible();

      // Every nav entry points at a section that exists on the page.
      const anchors = await page.locator(".playbook-navrow a").evaluateAll((links) =>
        links.map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? ""),
      );
      expect(anchors.length).toBe(playbook.sections.length);
      for (const href of anchors) {
        await expect(page.locator(href)).toHaveCount(1);
      }

      // Each figure block resolved to a real drawing — an unknown figure id renders the
      // <figure> shell with no <svg> inside it.
      const figures = page.locator("figure.playbook-figure");
      await expect(figures).toHaveCount(figureBlocks.length);
      for (let i = 0; i < figureBlocks.length; i++) {
        await expect(figures.nth(i).locator("svg")).toHaveCount(1);
      }

      // One tick box per item, but an item may span several rows.
      const boxes = page.locator(".playbook-check-table input[type=checkbox]");
      await expect(boxes).toHaveCount(items.length);
      // :not(.playbook-row-group) throughout: a grouped checklist prints a full-width phase
      // heading above the first item of each phase, and those are not rows a reader ticks,
      // recalls or is counted against.
      await expect(page.locator(".playbook-check-table tbody tr:not(.playbook-row-group)")).toHaveCount(
        playbookChecklistRows(items).length,
      );
      await expect(page.locator(".playbook-progress span").first()).toHaveText(`0 / ${items.length}`);

      await boxes.first().check();
      await expect(page.locator(".playbook-progress span").first()).toHaveText(`1 / ${items.length}`);

      await page.reload();
      await expect(boxes.first()).toBeChecked();
      await expect(page.locator(".playbook-progress span").first()).toHaveText(`1 / ${items.length}`);

      // The jump nav wraps above 900px (globals.css) precisely so a playbook with many
      // sections doesn't hide its last entries behind a sideways scroll — the failure the
      // hip playbook's 15 sections hit before that rule existed.
      const nav = await page.locator(".playbook-navrow").evaluate((el) => [el.scrollWidth, el.clientWidth]);
      expect(nav[0]).toBeLessThanOrEqual(nav[1] + 1);

      // Wide content — tables, figures — scrolls inside its own container, never the page.
      await page.setViewportSize({ width: 390, height: 844 });
      const pageOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(pageOverflow).toBeLessThanOrEqual(1);
    });
  }
});

/** Recall mode (components/playbook/PlaybookRecall.tsx). Parameterized for the same reason
 *  the page test is: what is asserted comes from the playbook's own data, so a new region is
 *  covered by being added to PLAYBOOKS. The checklist is the group under test because every
 *  playbook has exactly one and its columns are fixed, so the expected counts are known. */
test.describe("Playbook recall", () => {
  for (const playbook of PLAYBOOKS) {
    const checklistRows = playbookChecklistRows(playbookChecklist(playbook)).length;
    const figures = playbook.sections.flatMap((s) => s.blocks).filter((b) => b.kind === "figure");

    test(`hides, checks and remembers answers on the ${playbook.slug} playbook`, async ({ page }) => {
      await signUpAndEnterApp(page, `pw-recall-${playbook.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@school.edu`);
      await page.goto(`/student/playbooks/${playbook.slug}`);
      await expect(page.getByRole("heading", { name: playbook.title })).toBeVisible();

      // Nothing is hidden until asked, and the controls stay out of the way until then.
      await expect(page.locator(".playbook-mask-on")).toHaveCount(0);
      await expect(page.locator(".playbook-recallbar")).toHaveCount(0);

      // A group's own switch hides its last column — the finding — and nothing else. The
      // first control in the section belongs to the checklist itself; a playbook may put
      // further tables in the same section.
      const checklist = page.locator("#checklist");
      await checklist.locator(".playbook-tbl-recall").first().click();
      await expect(page.locator(".playbook-recallbar")).toBeVisible();
      await expect(checklist.locator(".playbook-mask-on")).toHaveCount(checklistRows);
      const firstRow = checklist.locator("tbody tr:not(.playbook-row-group)").first();
      await expect(firstRow.locator("td").nth(2)).not.toHaveClass(/playbook-mask-on/);

      // Clicking a hidden cell checks it, and only then offers to record it as missed.
      const cell = firstRow.locator("td").last();
      await expect(cell.locator(".playbook-missbtn")).toHaveCount(0);
      await cell.locator("button.playbook-maskwrap").click();
      await expect(cell).not.toHaveClass(/playbook-mask-on/);
      await cell.locator(".playbook-missbtn").click();
      await expect(checklist.locator("tr.playbook-row-missed")).toHaveCount(1);
      await expect(page.locator(".playbook-flagcount")).toHaveText("1 flagged from recall");

      // The hidden column and the flag survive a reload; which cells were peeked at does
      // not, so the column comes back fully blanked for a second pass.
      await page.reload();
      await expect(checklist.locator(".playbook-mask-on")).toHaveCount(checklistRows);
      await expect(page.locator(".playbook-flagcount")).toHaveText("1 flagged from recall");

      // The master switch clears first, then blanks everything — diagram labels included,
      // leaving the column that names each row.
      await page.locator(".playbook-recall-toggle").click();
      await expect(page.locator(".playbook-mask-on")).toHaveCount(0);
      await page.locator(".playbook-recall-toggle").click();
      await expect(page.locator(".playbook-recall-toggle")).toHaveText("Recall all");
      await expect(page.locator("figure.playbook-labels-hidden")).toHaveCount(figures.length);
      await expect(firstRow.locator("td").nth(2)).not.toHaveClass(/playbook-mask-on/);

      // Drilling the misses blanks only what was marked, wherever it is.
      await page.locator(".playbook-recallbar button", { hasText: "Hide missed" }).click();
      await expect(page.locator(".playbook-mask-on")).toHaveCount(1);
      await page.locator(".playbook-recallbar button", { hasText: "Clear missed" }).click();
      await expect(page.locator(".playbook-flagcount")).toHaveCount(0);

      // On a narrow screen every table is a stack of cards that prints its column names.
      await page.setViewportSize({ width: 390, height: 844 });
      const label = await checklist
        .locator("td[data-label]")
        .first()
        .evaluate((el) => getComputedStyle(el, "::before").content);
      expect(label).toContain("Item");
    });
  }
});

/** The taught lane (components/playbook/PlaybookTaught.tsx). Only the shoulder is exercised
 *  in the browser: the lane hangs off every maskable cell of every playbook by the same code
 *  path, so a second region would re-test the same thing at the cost of another sign-up. What
 *  is worth checking per playbook is the id map below, which is data. */
test.describe("Playbook taught lane", () => {
  test("every taught cell has a unique id and something to label it with", () => {
    for (const playbook of PLAYBOOKS) {
      const cells = playbookTaughtCells(playbook);
      expect(cells.length, `no taught cells in ${playbook.slug}`).toBeGreaterThan(0);
      const ids = cells.map((cell) => cell.id);
      expect(new Set(ids).size, `duplicate taught cell id in ${playbook.slug}`).toBe(ids.length);
      for (const cell of cells) {
        expect(cell.row.trim(), `unlabelled taught cell ${cell.id} in ${playbook.slug}`).not.toBe("");
        expect(cell.id, `malformed taught cell id in ${playbook.slug}`).toMatch(/^[^|]+\|c\d+\|r\d+$/);
      }
    }
  });

  test("opens a line under every cell, keeps what is typed, and stays out of recall's way", async ({ page }) => {
    await signUpAndEnterApp(page, `pw-taught-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@school.edu`);
    await page.goto("/student/playbooks/shoulder");
    await expect(page.getByRole("heading", { name: "Shoulder Examination Playbook" })).toBeVisible();

    // Nothing is open, nothing is filled, and the bar stays down until one or the other.
    const toggle = page.locator(".playbook-taught-toggle");
    await expect(toggle).toHaveText("Taught");
    await expect(page.locator(".playbook-taught-input")).toHaveCount(0);
    await expect(page.locator(".playbook-taughtbar")).toHaveCount(0);

    // The switch opens a lane on every maskable cell at once — the same cells recall blanks.
    await toggle.click();
    await expect(page.locator(".playbook-taughtbar")).toBeVisible();
    const taughtCells = playbookTaughtCells(PLAYBOOKS.find((p) => p.slug === "shoulder")!).length;
    await expect(page.locator(".playbook-taught-input")).toHaveCount(taughtCells);

    // A line commits when the reader moves on, and the guide's own text is untouched by it.
    const checklist = page.locator("#checklist");
    const firstRow = checklist.locator("tbody tr:not(.playbook-row-group)").first();
    const finding = firstRow.locator("td").last();
    const before = (await finding.locator(".playbook-maskwrap").innerText()).trim();
    await finding.locator(".playbook-taught-input").fill("Our program marks the cervical screen as optional.");
    await page.locator("h1").click();
    await expect(toggle).toHaveText("Taught (1)");
    expect((await finding.locator(".playbook-maskwrap").innerText()).trim()).toBe(before);

    // Closed, the empty lanes go and the filled one stays — a note is part of the page.
    await toggle.click();
    await expect(page.locator(".playbook-taught-input")).toHaveCount(0);
    await expect(page.locator(".playbook-taught-set")).toHaveCount(1);

    // And it survives a reload, because that is the whole point of writing it down.
    await page.reload();
    await expect(page.locator(".playbook-taught-set")).toContainText("Our program marks the cervical screen as optional.");

    // Blanked for recall, the reader's own line goes with the answer — it would give it away.
    await page.locator(".playbook-recall-toggle").click();
    await expect(finding).toHaveClass(/playbook-mask-on/);
    await expect(page.locator(".playbook-taught-set")).toHaveCount(0);
    await finding.locator("button.playbook-maskwrap").click();
    await expect(page.locator(".playbook-taught-set")).toHaveCount(1);

    // Clearing empties every lane at once, and the count goes with them.
    await page.locator(".playbook-recall-toggle").click();
    await page.locator(".playbook-taughtbar button", { hasText: "Clear my lines" }).click();
    await expect(page.locator(".playbook-taught-set")).toHaveCount(0);
    await expect(toggle).toHaveText("Taught");
  });
});
