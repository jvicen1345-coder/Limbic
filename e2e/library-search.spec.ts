import { test, expect } from "@playwright/test";
import { grantLimbicStudent, setUserColumn, signUpAndEnterApp } from "./helpers";

/**
 * Cross-playbook search on the Playbooks hub (components/playbook/LibrarySearch.tsx,
 * actions/library-search.ts).
 *
 * Covers the two things unit tests cannot: that the index actually builds from the real
 * committed HTML inside a running server, and that a free-tier reader cannot read a guide
 * they have not unlocked by searching it. The second is the one that matters — the ranking
 * rules are checked against synthetic passages in lib/library-search.test.ts, but the
 * entitlement filter only means anything wired to a real session.
 *
 * The box searches as you type (lexical only) and asks for related vocabulary on submit.
 * These tests use the typing path, because the submit path calls the Anthropic API and a
 * test that depends on a model's output is a test that fails for reasons unrelated to this
 * code. Its fallback — no terms, lexical results stand — is covered by the action's own
 * contract in lib/library-query-expansion.ts.
 */

function studentEmail(tag: string): string {
  return `pw-libsearch-${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@school.edu`;
}

const PAGE = "/student/search";
const HUB = "/student/playbooks";
const BOX = 'input[aria-label="Search playbooks and study guides"]';

test.describe("Library search", () => {
  test("finds a test by name and links into the guide that covers it", async ({ page }) => {
    const email = studentEmail("paid");
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);

    await page.goto(PAGE);
    await page.locator(BOX).fill("Thessaly");

    const hits = page.locator(".libsearch-hit");
    await expect(hits.first()).toBeVisible({ timeout: 15000 });

    // Thessaly is a knee test and appears in no other guide, so every hit must be the knee's.
    const guides = await page.locator(".libsearch-hit-guide").allTextContents();
    expect(guides.length).toBeGreaterThan(0);
    for (const guide of guides) expect(guide).toBe("Knee Examination");

    // The result has to land on a section, not the top of a quarter-megabyte document.
    const href = await hits.first().locator("a").getAttribute("href");
    expect(href).toMatch(/^\/student\/guides\/knee-examination#.+/);

    // And it has to show why it matched.
    await expect(hits.first().locator("mark")).toContainText(/thessaly/i);
  });

  test("searches prose the in-page filter cannot reach", async ({ page }) => {
    const email = studentEmail("prose");
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);

    await page.goto(PAGE);
    // This sentence lives in a `p.statnote`, which each playbook's own Filter box does not
    // index — it collects table rows, numcells, references, drill cases and callouts only.
    // Finding it here is the whole reason this index exists.
    await page.locator(BOX).fill("Apley sums");

    const first = page.locator(".libsearch-hit").first();
    await expect(first).toBeVisible({ timeout: 15000 });
    await expect(first.locator(".libsearch-hit-guide")).toHaveText("Knee Examination");
    await expect(first.locator("a")).toHaveAttribute("href", "/student/guides/knee-examination#special");
    await expect(first.locator(".libsearch-hit-kind")).toHaveText(/stat note/i);
  });

  test("never shows a free-tier reader text from a guide they have not unlocked", async ({ page }) => {
    const email = studentEmail("free");
    await signUpAndEnterApp(page, email);
    // No paid tier — just the one free pick, spent on the knee. This is the account shape the
    // entitlement filter exists for: six of seven guides are locked, per slug rather than
    // per tier.
    await setUserColumn(email, "freePlaybookSlug", "knee-examination");

    await page.goto(HUB);
    // "Hawkins" appears 16 times in the shoulder guide and in none of the others.
    await page.locator(BOX).fill("Hawkins");

    const locked = page.locator(".libsearch-locked");
    await expect(locked).toBeVisible({ timeout: 15000 });
    await expect(locked).toContainText("Shoulder Examination");

    // The guide may be named and counted. Its content may not appear at all.
    await expect(page.locator(".libsearch-hit")).toHaveCount(0);
    const results = await page.locator(".libsearch-results").innerText();
    expect(results).not.toMatch(/impingement/i);
    expect(results).not.toMatch(/Hawkins-Kennedy/i);

    // Their own guide still answers.
    await page.locator(BOX).fill("Thessaly");
    await expect(page.locator(".libsearch-hit").first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator(".libsearch-hit-guide").first()).toHaveText("Knee Examination");
  });

  test("says so plainly when the library has no answer", async ({ page }) => {
    const email = studentEmail("miss");
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);

    await page.goto(PAGE);
    // A real anatomical term that appears nowhere in these ten documents — re-checked
    // across both content directories when the study guides joined the index. Picked by
    // grepping the library rather than by looking unlikely: "zygomaticus" and "arcuate"
    // both read like misses and both appear, which is exactly the mistake this comment is
    // here to stop the next person repeating.
    await page.locator(BOX).fill("fasciculus");

    await expect(page.locator(".libsearch-note")).toContainText(/Nothing in the playbooks or study guides matches/i, {
      timeout: 15000,
    });
    await expect(page.locator(".libsearch-hit")).toHaveCount(0);
  });
});

test.describe("Library search spans both pools", () => {
  test("says what it searches, before anything is typed", async ({ page }) => {
    const email = studentEmail("scope");
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);

    await page.goto(PAGE);
    // The whole point of this surface: a reader should not have to infer the scope from
    // whatever happens to come back.
    await expect(page.locator("h1")).toHaveText(/Search playbooks & study guides/i);
    await expect(page.locator(".libsearch-scope")).toHaveText(/7 playbooks · 3 study guides/i);
  });

  test("returns study-guide results, tagged as such", async ({ page }) => {
    const email = studentEmail("sg");
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);

    await page.goto(PAGE);
    // "upglide" appears 123 times in the cervical study guide and in no playbook — so every
    // hit must come from the study-guide pool, and must say so.
    await page.locator(BOX).fill("upglide");

    const first = page.locator(".libsearch-hit").first();
    await expect(first).toBeVisible({ timeout: 15000 });
    await expect(first.locator(".libsearch-hit-guide")).toHaveText("Cervical Spine");
    await expect(first.locator(".libsearch-pool")).toHaveText(/study guide/i);
    await expect(first.locator("a")).toHaveAttribute("href", /^\/student\/exam-prep\/cervical-exam-prep#.+/);
  });

  test("finds a key point whole, prompt and breakdown together", async ({ page }) => {
    const email = studentEmail("kp");
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);

    await page.goto(PAGE);
    await page.locator(BOX).fill("atypical cervical vertebrae");

    const keypoint = page.locator(".libsearch-hit", { has: page.locator("text=Key point") }).first();
    await expect(keypoint).toBeVisible({ timeout: 15000 });
    await expect(keypoint.locator(".libsearch-pool")).toHaveText(/study guide/i);
  });

  test("ranks both pools against one query", async ({ page }) => {
    const email = studentEmail("both");
    await signUpAndEnterApp(page, email);
    await grantLimbicStudent(email);

    await page.goto(PAGE);
    // The neurologic examination playbook and the neuro study guide both cover this.
    await page.locator(BOX).fill("Babinski");
    await expect(page.locator(".libsearch-hit").first()).toBeVisible({ timeout: 15000 });

    const pools = await page.locator(".libsearch-pool").allTextContents();
    expect(pools.length).toBeGreaterThan(0);
    // Every result is labelled, whichever pool it came from.
    for (const pool of pools) expect(pool).toMatch(/playbook|study guide/i);
  });

  test("withholds a locked study guide the same way it withholds a locked playbook", async ({ page }) => {
    const email = studentEmail("sglock");
    await signUpAndEnterApp(page, email);
    // One free pick, spent on a playbook. Both pools share that single pick, so every study
    // guide is locked for this reader.
    await setUserColumn(email, "freePlaybookSlug", "knee-examination");

    await page.goto(PAGE);
    await page.locator(BOX).fill("upglide");

    const locked = page.locator(".libsearch-locked");
    await expect(locked).toBeVisible({ timeout: 15000 });
    await expect(locked).toContainText("Cervical Spine");
    await expect(page.locator(".libsearch-hit")).toHaveCount(0);

    const results = await page.locator(".libsearch-results").innerText();
    expect(results).not.toMatch(/upglide/i);
    expect(results).not.toMatch(/facet/i);
  });
});
