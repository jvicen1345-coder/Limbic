import { test, expect } from "@playwright/test";
import { planHomeImages, type ArticleImageCacheRow } from "@/lib/home-image-plan";
import type { Article } from "@/lib/types";

function article(id: string, sourceUrl = `https://publisher.example/${id}`): Article {
  return {
    id,
    sourceUrl,
    type: "research",
    specialty: "ortho",
    title: `Knee rehabilitation study ${id}`,
    source: "Example Journal",
    date: "2026-09-08",
    readMins: 4,
    summary: "Summary",
    tags: ["knee"],
  };
}

test.describe("Home image planning", () => {
  const now = new Date("2026-09-08T12:00:00.000Z");

  test("uses fresh cached publisher images and warms stale or changed sources", () => {
    const articles = [article("fresh"), article("stale"), article("changed", "https://new.example/story")];
    const rows: ArticleImageCacheRow[] = [
      {
        articleId: "fresh",
        sourceUrl: articles[0].sourceUrl!,
        imageUrl: "https://images.example/fresh.jpg",
        checkedAt: new Date("2026-09-01T12:00:00.000Z"),
      },
      {
        articleId: "stale",
        sourceUrl: articles[1].sourceUrl!,
        imageUrl: "https://images.example/stale.jpg",
        checkedAt: new Date("2026-07-01T12:00:00.000Z"),
      },
      {
        articleId: "changed",
        sourceUrl: "https://old.example/story",
        imageUrl: "https://images.example/old.jpg",
        checkedAt: now,
      },
    ];

    const planned = planHomeImages(articles, rows, now);

    expect(planned.articles[0].image).toBe("https://images.example/fresh.jpg");
    expect(planned.articles[1].image).not.toBe("https://images.example/stale.jpg");
    expect(planned.articles[2].image).not.toBe("https://images.example/old.jpg");
    expect(planned.toRefresh.map((item) => item.id)).toEqual(["stale", "changed"]);
  });

  test("negative-caches missing images and skips sources that cannot contain og:image", () => {
    const articles = [
      article("missing"),
      article("google", "https://news.google.com/rss/articles/example"),
      article("pdf", "https://publisher.example/guideline.pdf"),
    ];
    const rows: ArticleImageCacheRow[] = [
      {
        articleId: "missing",
        sourceUrl: articles[0].sourceUrl!,
        imageUrl: null,
        checkedAt: new Date("2026-09-07T12:00:00.000Z"),
      },
    ];

    const planned = planHomeImages(articles, rows, now);

    expect(planned.articles.every((item) => Boolean(item.image))).toBe(true);
    expect(planned.toRefresh).toEqual([]);
  });

  test("assigns enough distinct bundled photos for the hero and seven-card grid", () => {
    const planned = planHomeImages(
      Array.from({ length: 12 }, (_, index) => article(`cold-${index}`)),
      [],
      now
    );
    const images = planned.articles.map((item) => item.image);

    expect(images.every(Boolean)).toBe(true);
    expect(new Set(images).size).toBe(12);
    expect(planned.toRefresh).toHaveLength(12);
  });
});
