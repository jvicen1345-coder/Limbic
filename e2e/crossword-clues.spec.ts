import { test, expect, type Page } from "@playwright/test";
import { puzzleForDate, type CrosswordPuzzle } from "@/lib/crossword-puzzles";
import { todayKeyInZone } from "@/lib/day";
import { freshEmail, signUpAndEnterApp } from "./helpers";

/**
 * Once every square of a clue has a letter, the clue list says whether the entry is right:
 * a correct entry dims and strikes its text (number stays readable) with a check; a wrong
 * one gets the danger accent and an X and is not struck through. Blank squares keep the
 * clue neutral.
 */

function mismatch(answer: string): string {
  return [...answer].map((letter) => (letter === "A" ? "B" : "A")).join("");
}

async function puzzleMatchingPage(page: Page): Promise<CrosswordPuzzle> {
  const firstClue = page.locator(".crossword-clues-panel .crossword-clue-text").first();
  await expect(firstClue).toBeVisible();
  let matched: CrosswordPuzzle | null = null;
  await expect
    .poll(async () => {
      const text = (await firstClue.textContent())?.trim() ?? "";
      const zone = await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
      matched = [zone, "UTC"].map((z) => puzzleForDate(todayKeyInZone(z))).find((p) => p.across[0].clue === text) ?? null;
      return matched?.id ?? "";
    })
    .not.toBe("");
  if (!matched) throw new Error("crossword clue list never matched today's puzzle");
  return matched;
}

function acrossItem(page: Page, number: number) {
  return page
    .locator(".crossword-clues-panel > div")
    .first()
    .locator(".crossword-clue-item")
    .filter({ has: page.locator(".crossword-clue-num", { hasText: new RegExp(`^${number}$`) }) });
}

async function typeIntoClue(page: Page, clue: ReturnType<typeof acrossItem>, letters: string) {
  await clue.click();
  await expect(page.locator(".crossword-hidden-input")).toBeFocused();
  await page.keyboard.type(letters);
}

test("clue list marks a full entry right or wrong", async ({ page }) => {
  await signUpAndEnterApp(page, freshEmail("crossword-clues"));
  await page.goto("/crossword");
  await expect(page.getByRole("heading", { name: "Mini Crossword" })).toBeVisible();

  const puzzle = await puzzleMatchingPage(page);
  const oneAcross = acrossItem(page, 1);
  const oneDown = page
    .locator(".crossword-clues-panel > div")
    .nth(1)
    .locator(".crossword-clue-item")
    .filter({ has: page.locator(".crossword-clue-num", { hasText: /^1$/ }) });

  await expect(page.locator(".crossword-clue-item-correct, .crossword-clue-item-wrong")).toHaveCount(0);

  const wrong = mismatch(puzzle.across[0].answer);
  await typeIntoClue(page, oneAcross, wrong);
  await expect(oneAcross).toHaveClass(/crossword-clue-item-wrong/);
  await expect(oneAcross).toHaveClass(/crossword-clue-item-active/);
  await expect(oneAcross).not.toHaveClass(/crossword-clue-item-correct/);
  await expect(oneAcross.locator(".crossword-sr-only")).toHaveText(", wrong");
  await expect(oneAcross.locator(".crossword-clue-mark-wrong")).toBeVisible();
  await expect(oneDown).not.toHaveClass(/crossword-clue-item-correct|crossword-clue-item-wrong/);
  const wrongLine = await oneAcross.locator(".crossword-clue-text").evaluate((el) => getComputedStyle(el).textDecorationLine);
  expect(wrongLine).not.toContain("line-through");

  await page.keyboard.press("Backspace");
  await expect(oneAcross).not.toHaveClass(/crossword-clue-item-correct|crossword-clue-item-wrong/);
  await expect(oneAcross.locator(".crossword-sr-only")).toHaveCount(0);

  await typeIntoClue(page, oneAcross, puzzle.across[0].answer);
  await expect(oneAcross).toHaveClass(/crossword-clue-item-correct/);
  await expect(oneAcross).not.toHaveClass(/crossword-clue-item-wrong/);
  await expect(oneAcross.locator(".crossword-sr-only")).toHaveText(", correct");
  await expect(oneAcross.locator(".crossword-clue-mark-correct")).toBeVisible();

  const textLine = await oneAcross.locator(".crossword-clue-text").evaluate((el) => getComputedStyle(el).textDecorationLine);
  const numLine = await oneAcross.locator(".crossword-clue-num").evaluate((el) => getComputedStyle(el).textDecorationLine);
  expect(textLine).toContain("line-through");
  expect(numLine).not.toContain("line-through");

  for (const clue of puzzle.across.slice(1)) {
    await typeIntoClue(page, acrossItem(page, clue.number), clue.answer);
  }

  await expect(page.getByText("Puzzle Complete")).toBeVisible();
  await expect(page.locator(".crossword-clue-item-wrong")).toHaveCount(0);
  await expect(page.locator(".crossword-clue-item-correct")).toHaveCount(puzzle.across.length + puzzle.down.length);
});
