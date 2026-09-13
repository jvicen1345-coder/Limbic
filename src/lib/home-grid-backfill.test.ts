import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveGridArticles } from "./home-grid-backfill";
import type { DecoratedArticle } from "./feed";
import type { ArticleType } from "./types";

function article(id: string, image: string | undefined, type: ArticleType = "research"): DecoratedArticle {
  return {
    id,
    type,
    specialty: "ortho",
    title: id,
    source: "Journal",
    date: "2026-09-01",
    readMins: 4,
    summary: "",
    tags: [],
    image,
    typeLabel: "Research",
    typeTagClass: "tag",
    specialtyLabel: "Orthopedic",
    dateLabel: "Sep 1",
    dateLabelWithYear: "Sep 1, 2026",
    saved: false,
    isNew: false,
    isRead: false,
  };
}

describe("resolveGridArticles", () => {
  it("keeps the grid untouched when nothing collides with the hero", () => {
    const grid = [article("a", "img-a"), article("b", "img-b")];
    const result = resolveGridArticles(grid, [], new Set(["img-hero"]));
    assert.deepEqual(result.map((a) => a.id), ["a", "b"]);
  });

  it("swaps a hero-colliding card for a backfill candidate, keeping the same count", () => {
    const grid = [article("a", "img-hero"), article("b", "img-b")];
    const backfill = [article("c", "img-c")];
    const result = resolveGridArticles(grid, backfill, new Set(["img-hero"]));
    assert.equal(result.length, 2);
    assert.deepEqual(result.map((a) => a.id), ["c", "b"]);
  });

  it("never introduces a duplicate image, even across the backfill queue itself", () => {
    const grid = [article("a", "img-hero"), article("b", "img-hero")];
    const backfill = [article("c", "img-c")];
    const result = resolveGridArticles(grid, backfill, new Set(["img-hero"]));
    const images = result.map((a) => a.image);
    assert.deepEqual(new Set(images).size, images.length);
    assert.equal(result.length, 1); // only one non-duplicate backfill candidate existed
  });

  it("only backfills from the same type class, so News stays confined to its row on 'All'", () => {
    const grid = [article("hero-collides", "img-hero", "industry")];
    const backfill = [article("wrong-class", "img-x", "research"), article("right-class", "img-y", "product")];
    const result = resolveGridArticles(grid, backfill, new Set(["img-hero"]));
    assert.deepEqual(result.map((a) => a.id), ["right-class"]);
  });

  it("drops the slot rather than showing a duplicate when backfill is exhausted", () => {
    const grid = [article("a", "img-hero"), article("b", "img-b")];
    const result = resolveGridArticles(grid, [], new Set(["img-hero"]));
    assert.deepEqual(result.map((a) => a.id), ["b"]);
  });
});
