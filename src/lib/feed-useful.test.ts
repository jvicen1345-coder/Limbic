import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rankFeed, usefulBonus } from "./feed";
import type { Article } from "./types";

const article = (id: string, date: string): Article => ({
  id,
  type: "research",
  specialty: "ortho",
  title: id,
  source: "Journal",
  date,
  readMins: 2,
  summary: "",
  tags: [],
});

describe("usefulBonus()", () => {
  it("is zero without votes and capped with many", () => {
    assert.equal(usefulBonus(undefined), 0);
    assert.equal(usefulBonus(0), 0);
    assert.ok(usefulBonus(1) > 0);
    assert.equal(usefulBonus(10_000), 1.5);
  });
});

describe("rankFeed() usefulCounts", () => {
  it("lifts a well-received study above an equally matched newer one", () => {
    const older = article("older", "2026-01-01");
    const newer = article("newer", "2026-06-01");
    const base = { articles: [newer, older], specialty: "neuro" as const, followedTopics: [] };
    assert.deepEqual(rankFeed(base).map((a) => a.id), ["newer", "older"]);
    assert.deepEqual(rankFeed({ ...base, usefulCounts: { older: 3 } }).map((a) => a.id), ["older", "newer"]);
  });

  it("never outweighs the reader's own specialty match", () => {
    const mine = { ...article("mine", "2026-01-01"), specialty: "neuro" as const };
    const popular = article("popular", "2026-06-01");
    const ranked = rankFeed({ articles: [popular, mine], specialty: "neuro", followedTopics: [], usefulCounts: { popular: 500 } });
    assert.equal(ranked[0].id, "mine");
  });
});
