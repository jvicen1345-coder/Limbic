import { test, expect } from "@playwright/test";
import { PLAYBOOKS, playbookChecklist, type PlaybookBlock } from "@/lib/playbook-content";
import { parsePlaybookInline } from "@/lib/playbook-inline";
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

      const boxes = page.locator(".playbook-check-table input[type=checkbox]");
      await expect(boxes).toHaveCount(items.length);
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
