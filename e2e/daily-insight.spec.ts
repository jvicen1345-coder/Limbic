import { test, expect } from "@playwright/test";
import { freshEmail, signUpAndEnterApp } from "./helpers";
import { candidateArticles, fallbackInsight, readerLevelOf } from "@/lib/daily-insight";
import type { Article } from "@/lib/types";

/**
 * The Home sidebar's daily insight (see lib/daily-insight.ts).
 *
 * The claim that needs guarding is the source link. The card exists to hand a reader
 * something they can go and check, so a link that 404s, or a link a model invented, would
 * make the card worse than not having it. The design prevents that structurally — the URL
 * is copied from the article record and the model is never asked for one — and these tests
 * hold that design in place.
 */

function article(over: Partial<Article> = {}): Article {
  return {
    id: "a1",
    type: "research",
    specialty: "ortho",
    title: "A real study title",
    source: "Journal of Something",
    sourceUrl: "https://example.org/study",
    date: "2026-09-01",
    readMins: 6,
    summary: "What the study found.",
    tags: ["Tendinopathy"],
    ...over,
  } as Article;
}

test.describe("daily insight selection", () => {
  test("only ever picks an article that carries a real external source URL", () => {
    const pool = candidateArticles(
      [
        article({ id: "seed", sourceUrl: undefined }), // hand-authored: no source to link
        article({ id: "relative", sourceUrl: "/internal/path" }), // not a source either
        article({ id: "javascript", sourceUrl: "javascript:alert(1)" }),
        article({ id: "good" }),
      ],
      new Set(),
      [],
      "ortho",
    );
    expect(pool.map((a) => a.id), "an unlinkable article was eligible").toEqual(["good"]);
  });

  test("never re-surfaces something the reader has already read", () => {
    const pool = candidateArticles([article({ id: "read" }), article({ id: "unread" })], new Set(["read"]), [], "ortho");
    expect(pool.map((a) => a.id)).toEqual(["unread"]);
  });

  test("the fallback carries the article's own link, not a constructed one", () => {
    const a = article({ sourceUrl: "https://publisher.example/x?y=1" });
    const insight = fallbackInsight(a, "clinician", "2026-09-09");
    expect(insight.source.url).toBe("https://publisher.example/x?y=1");
    expect(insight.source.publisher).toBe(a.source);
    expect(insight.authored, "the fallback must not claim to be agent-written").toBe(false);
  });

  test("reader level follows the account facts, not a guess", () => {
    const base = { licenseNumber: null, email: null, studentTier: "none", school: null };
    expect(readerLevelOf({ ...base, licenseNumber: "PT12345" })).toBe("clinician");
    expect(readerLevelOf({ ...base, studentTier: "limbicStudent" })).toBe("student");
    expect(readerLevelOf({ ...base, school: "Some DPT Program" })).toBe("student");
    expect(readerLevelOf(base)).toBe("general");
  });
});

test("Home shows the insight, and its source link is a real absolute URL", async ({ page }) => {
  const email = freshEmail("insight");
  await signUpAndEnterApp(page, email);
  await page.goto("/home");

  const card = page.locator(".daily-insight-card");
  await expect(card).toHaveCount(1);

  const link = card.locator("a.daily-insight-source");
  await expect(link).toHaveCount(1);
  const href = await link.getAttribute("href");
  expect(href, "the source link has no href").toBeTruthy();
  // Absolute and openable — the whole point of the card.
  expect(() => new URL(href!)).not.toThrow();
  expect(new URL(href!).protocol, `source link is not http(s): ${href}`).toMatch(/^https?:$/);
  // Opens off-site safely.
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
});
