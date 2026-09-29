import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { EXAM_PREP_GUIDES, EXAM_PREP_PARTS, examPrepFile, examPrepHref } from "@/lib/exam-prep";
import { GUIDES } from "@/lib/guides";
import { grantLimbicStudent, signUpAndEnterApp } from "./helpers";

/**
 * Exam Prep guides (lib/exam-prep.ts) — study guides served whole from content/exam-prep,
 * each with a games page and an atlas beside it. What is worth catching: a guide or part
 * readable without entitlement, a registry slug with no file behind it, a companion link
 * that points somewhere the route doesn't answer, and a slug colliding with a playbook's
 * (they share the one free-pick column).
 */

test.describe("Exam Prep content", () => {
  test("every guide and companion page has a file, and no slug collides with a playbook", async () => {
    const playbookSlugs = new Set(GUIDES.map((g) => g.slug));
    for (const guide of EXAM_PREP_GUIDES) {
      expect(playbookSlugs.has(guide.slug), `${guide.slug} collides with a playbook slug`).toBe(false);
      if (guide.playbook) expect(playbookSlugs.has(guide.playbook), `${guide.slug} pairs with an unknown playbook`).toBe(true);
      const main = await readFile(path.join(process.cwd(), "content", "exam-prep", examPrepFile(guide.slug)), "utf8");
      // The document links to its companions by absolute path; each must be one the route serves.
      for (const part of EXAM_PREP_PARTS) {
        await readFile(path.join(process.cwd(), "content", "exam-prep", examPrepFile(guide.slug, part)), "utf8");
        expect(main, `${guide.slug} links to its ${part}`).toContain(`href="${examPrepHref(guide)}/${part}"`);
      }
      expect(main, `${guide.slug} is marked noindex`).toContain("noindex");
    }
  });
});

test.describe("Exam Prep serving", () => {
  test("gated like the playbooks, served whole to a subscriber", async ({ page }) => {
    const email = `pw-examprep-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@school.edu`;
    await signUpAndEnterApp(page, email);

    for (const guide of EXAM_PREP_GUIDES) {
      const locked = await page.request.get(examPrepHref(guide));
      expect(locked.status(), `${guide.slug} is readable without a subscription`).toBe(404);
      for (const part of EXAM_PREP_PARTS) {
        const lockedPart = await page.request.get(`${examPrepHref(guide)}/${part}`);
        expect(lockedPart.status(), `${guide.slug}/${part} is readable without a subscription`).toBe(404);
      }
    }

    await grantLimbicStudent(email);
    expect((await page.request.get("/student/exam-prep/elbow-exam-prep")).status()).toBe(404);
    expect((await page.request.get(`${examPrepHref(EXAM_PREP_GUIDES[0])}/package`)).status()).toBe(404);

    for (const guide of EXAM_PREP_GUIDES) {
      for (const url of [examPrepHref(guide), ...EXAM_PREP_PARTS.map((part) => `${examPrepHref(guide)}/${part}`)]) {
        const open = await page.request.get(url);
        expect(open.status(), `${url} does not open for a subscriber`).toBe(200);
        expect(open.headers()["content-type"]).toContain("text/html");
        expect(open.headers()["cache-control"]).toContain("no-store");
      }
      await page.goto(examPrepHref(guide));
      await expect(page.locator("#key .kp")).toHaveCount(guide.keyPoints);
      await expect(page.locator("#c-q")).toHaveText(String(guide.questions));
    }

    await page.goto("/student/exam-prep");
    await expect(page.locator(".playbook-hub-card")).toHaveCount(EXAM_PREP_GUIDES.length);
    await expect(page.getByRole("link", { name: "Open" })).toHaveCount(EXAM_PREP_GUIDES.length);
  });
});
