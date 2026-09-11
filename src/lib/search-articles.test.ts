import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "./types";
import type { DecoratedArticle } from "./feed";
import {
  articleMatchesSearch,
  filterSearchArticles,
  parseSearchQuery,
  searchArticlesHref,
  toSearchArticle,
} from "./search-articles";

function article(overrides: Partial<Article> = {}): Article {
  return {
    id: "a1",
    type: "guideline",
    specialty: "ortho",
    title: "Neck Pain: Revision 2017",
    source: "Journal of Orthopaedic & Sports PT",
    date: "2017-07-01",
    readMins: 6,
    summary: "AOPT recommendations for neck pain.",
    tags: ["Guidelines", "Neck pain"],
    body: ["A long authored body that must not ship in the Search document."],
    fullAbstract: "A long PubMed abstract that must not ship in the Search document.",
    underReview: "not for search cards",
    ...overrides,
  };
}

function decorated(overrides: Partial<Article> = {}): DecoratedArticle {
  const base = article(overrides);
  return {
    ...base,
    typeLabel: "Guidelines",
    typeTagClass: "tag tag-accent-2",
    specialtyLabel: "Orthopedic",
    dateLabel: "Jul 1",
    dateLabelWithYear: "Jul 1, 2017",
    saved: true,
    isNew: false,
    isRead: false,
  };
}

describe("search filter params", () => {
  it("parses type, specialty, q, new, and page the way /search already did", () => {
    assert.deepEqual(parseSearchQuery({ type: "guideline", specialty: "sports", q: "ankle", new: "1", page: "3" }), {
      type: "guideline",
      specialty: "sports",
      q: "ankle",
      newOnly: true,
      page: 3,
    });
  });

  it("treats unknown filters as all / page 1", () => {
    assert.deepEqual(parseSearchQuery({ type: "nope", specialty: "nope", new: "yes", page: "0" }), {
      type: "all",
      specialty: "all",
      q: "",
      newOnly: false,
      page: 1,
    });
  });

  it("omits default filters from the href so existing deep links stay short", () => {
    assert.equal(searchArticlesHref({ type: "all", specialty: "all", q: "  ", page: 1 }), "/search");
    assert.equal(
      searchArticlesHref({ type: "research", specialty: "ortho", q: "ACL", newOnly: true, page: 2 }),
      "/search?type=research&specialty=ortho&q=ACL&new=1&page=2"
    );
  });
});

describe("search matching", () => {
  const today = "2026-09-11";
  const neck = article();
  const sports = article({
    id: "a2",
    title: "Ankle Stability",
    specialty: "sports",
    date: today,
    tags: ["Guidelines", "Ankle sprain"],
    summary: "Lateral ankle ligament sprains.",
  });

  it("filters type, specialty, q, and new-today the same way the client used to", () => {
    assert.equal(articleMatchesSearch(neck, { type: "guideline", specialty: "all", q: "", newOnly: false }, today), true);
    assert.equal(articleMatchesSearch(neck, { type: "research", specialty: "all", q: "", newOnly: false }, today), false);
    assert.equal(articleMatchesSearch(neck, { type: "all", specialty: "sports", q: "", newOnly: false }, today), false);
    assert.equal(articleMatchesSearch(neck, { type: "all", specialty: "all", q: "neck", newOnly: false }, today), true);
    assert.equal(articleMatchesSearch(neck, { type: "all", specialty: "all", q: "pubmed", newOnly: false }, today), false);
    assert.equal(articleMatchesSearch(sports, { type: "all", specialty: "all", q: "", newOnly: true }, today), true);
    assert.equal(articleMatchesSearch(neck, { type: "all", specialty: "all", q: "", newOnly: true }, today), false);
  });

  it("sorts matches newest-first", () => {
    const filtered = filterSearchArticles([neck, sports], { type: "all", specialty: "all", q: "", newOnly: false }, today);
    assert.deepEqual(
      filtered.map((a) => a.id),
      ["a2", "a1"]
    );
  });
});

describe("search DTO", () => {
  it("keeps Save/card fields and drops body, abstract, and review blobs", () => {
    const full = decorated({ sourceUrl: "https://example.org/cpg", doi: "10.1/neck" });
    const dto = toSearchArticle(full);
    const json = JSON.stringify(dto);

    assert.equal(dto.id, "a1");
    assert.equal(dto.title, "Neck Pain: Revision 2017");
    assert.equal(dto.saved, true);
    assert.equal(dto.sourceUrl, "https://example.org/cpg");
    assert.equal(dto.doi, "10.1/neck");
    assert.equal(dto.readMins, 6);
    assert.ok(!("body" in dto));
    assert.ok(!("fullAbstract" in dto));
    assert.ok(!("underReview" in dto));
    assert.ok(!("dateLabelWithYear" in dto));
    assert.doesNotMatch(json, /long authored body/);
    assert.doesNotMatch(json, /long PubMed abstract/);
    assert.ok(json.length < JSON.stringify(full).length);
  });
});
