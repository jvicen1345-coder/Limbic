import { test, expect } from "@playwright/test";
import { freshEmail, signUpAndEnterApp } from "./helpers";

/**
 * Article pages resolve classified ids (PMID / apta- / cpg- / live-) without scanning the
 * full Home live pool. A curated CPG is the stable stand-in: it does not depend on Google
 * News or PubMed being reachable, and it must still render related guidelines from the
 * static CPG list.
 */
test.describe("article page", () => {
  test("opens a curated guideline without depending on the live Home pool", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("article-page"));

    await page.goto("/article/cpg-neck-pain-2017");
    await expect(page.getByRole("heading", { name: /Neck Pain: Revision 2017/ })).toBeVisible();
    await expect(page.getByText(/AOPT's evidence-based recommendations/)).toBeVisible();
  });

  test("News still loads from the shared APTA snapshot", async ({ page }) => {
    await signUpAndEnterApp(page, freshEmail("article-news"));

    await page.goto("/news");
    await expect(page.getByRole("heading", { name: "News" })).toBeVisible();
    await expect(
      page.getByText("News and coverage of the American Physical Therapy Association")
    ).toBeVisible();
  });
});
