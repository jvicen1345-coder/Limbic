import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "./types";
import type { DecoratedArticle } from "./feed";
import {
  articleMatchesSearch,
  filterSearchArticles,
  normalizeDoi,
  parseSearchQuery,
  searchArticlesHref,
  searchRelevance,
  searchScreenRemountKey,
  SEARCH_RANK,
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

  it("accepts the cardiopulm specialty added on main", () => {
    assert.equal(parseSearchQuery({ specialty: "cardiopulm" }).specialty, "cardiopulm");
  });

  it("omits default filters from the href so existing deep links stay short", () => {
    assert.equal(searchArticlesHref({ type: "all", specialty: "all", q: "  ", page: 1 }), "/search");
    assert.equal(
      searchArticlesHref({ type: "research", specialty: "ortho", q: "ACL", newOnly: true, page: 2 }),
      "/search?type=research&specialty=ortho&q=ACL&new=1&page=2"
    );
  });

  it("remounts SearchScreen on chips, not on q or page", () => {
    assert.equal(
      searchScreenRemountKey({ type: "guideline", specialty: "ortho", newOnly: false }),
      "/search?type=guideline&specialty=ortho"
    );
    assert.equal(
      searchScreenRemountKey({ type: "guideline", specialty: "ortho", newOnly: false }),
      searchArticlesHref({ type: "guideline", specialty: "ortho" })
    );
    assert.notEqual(
      searchScreenRemountKey({ type: "guideline", specialty: "ortho", newOnly: false }),
      searchArticlesHref({ type: "guideline", specialty: "ortho", q: "neck", page: 2 })
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

describe("finding one known article", () => {
  const today = "2026-09-11";
  // The article the reader is looking for, and a newer one that only mentions its words.
  const target = article({
    id: "target",
    title: "Neck Pain: Revision 2017",
    date: "2017-01-01",
    doi: "10.2519/jospt.2017.0302",
  });
  const newerMention = article({
    id: "newer",
    title: "Weekly roundup",
    date: today,
    summary: "Includes Neck Pain: Revision 2017 among this week's reading.",
  });

  it("puts the article you named above a newer one that merely mentions it", () => {
    const hits = filterSearchArticles(
      [newerMention, target],
      { type: "all", specialty: "all", q: "Neck Pain: Revision 2017", newOnly: false },
      today
    );
    assert.deepEqual(hits.map((a) => a.id), ["target", "newer"]);
  });

  it("finds an article by its DOI, however the reader pasted it", () => {
    for (const typed of [
      "10.2519/jospt.2017.0302",
      "https://doi.org/10.2519/jospt.2017.0302",
      "https://dx.doi.org/10.2519/JOSPT.2017.0302",
      "doi:10.2519/jospt.2017.0302",
    ]) {
      const hits = filterSearchArticles([newerMention, target], { type: "all", specialty: "all", q: typed, newOnly: false }, today);
      assert.deepEqual(hits.map((a) => a.id), ["target"], `pasted as ${typed}`);
    }
  });

  it("does not let a bare registrant prefix match every DOI", () => {
    assert.equal(articleMatchesSearch(target, { type: "all", specialty: "all", q: "10", newOnly: false }, today), false);
    assert.equal(articleMatchesSearch(target, { type: "all", specialty: "all", q: "10.2519/", newOnly: false }, today), true);
  });

  it("ranks an exact title over a prefix, a prefix over a mention", () => {
    const q = "neck pain";
    assert.equal(searchRelevance(article({ title: "Neck Pain" }), q), SEARCH_RANK.EXACT_TITLE);
    assert.equal(searchRelevance(article({ title: "Neck Pain: Revision 2017" }), q), SEARCH_RANK.TITLE_PREFIX);
    assert.equal(searchRelevance(article({ title: "Chronic neck pain in cyclists" }), q), SEARCH_RANK.TITLE_CONTAINS);
    // tags and source overridden: the default fixture is tagged "Neck pain", which would
    // otherwise score this SOURCE_OR_TAG before the summary is ever reached.
    assert.equal(
      searchRelevance(article({ title: "Roundup", summary: "on neck pain", tags: ["Weekly"], source: "Limbic" }), q),
      SEARCH_RANK.SUMMARY
    );
    assert.equal(
      searchRelevance(article({ title: "Roundup", summary: "nothing relevant", tags: ["Neck pain"], source: "Limbic" }), q),
      SEARCH_RANK.SOURCE_OR_TAG
    );
  });

  it("matches a title pasted with a line break in it", () => {
    assert.equal(
      searchRelevance(target, "Neck Pain:\n  Revision 2017"),
      SEARCH_RANK.EXACT_TITLE
    );
  });

  it("strips the doi.org wrapper a reader copies from a publisher page", () => {
    assert.equal(normalizeDoi("https://doi.org/10.1/X"), "10.1/x");
    assert.equal(normalizeDoi("  doi: 10.1/x "), "10.1/x");
    assert.equal(normalizeDoi("10.1/x"), "10.1/x");
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
