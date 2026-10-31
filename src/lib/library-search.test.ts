import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { LibraryPassage } from "@/lib/library-passages";
import {
  EXPANSION_WEIGHT,
  bestCoverage,
  buildIndex,
  guideAffinity,
  queryTerms,
  rank,
  snippet,
  splitByEntitlement,
  tokenize,
  weightTerms,
} from "@/lib/library-search";

/**
 * Ranking and entitlement for cross-playbook search.
 *
 * Synthetic passages rather than the real library: these assert the *rules* — an exact token
 * outranks a topical mention, an expansion term cannot outvote a typed one, a locked guide
 * contributes no text — and a rule stated against three passages is readable, where the same
 * rule stated against 1,955 is a guess about why a number came out the way it did. The real
 * corpus is exercised in library-passages.test.ts.
 */

function passage(over: Partial<LibraryPassage> & { text: string }): LibraryPassage {
  return {
    slug: "knee-examination",
    sectionId: "special",
    heading: "Special tests",
    kind: "row",
    ...over,
  };
}

describe("tokenize", () => {
  it("keeps a decimal statistic as one token", () => {
    assert.ok(tokenize("sums to 1.06, which").includes("1.06"));
  });

  it("emits a hyphenated term whole and in parts", () => {
    const tokens = tokenize("the concave-convex rule");
    assert.ok(tokens.includes("concave-convex"), "compound missing");
    assert.ok(tokens.includes("concave") && tokens.includes("convex"), "parts missing");
  });

  it("folds the dash and quote variants a document actually contains", () => {
    assert.deepEqual(tokenize("knee–ankle"), tokenize("knee-ankle"));
    assert.ok(tokenize("Thessaly’s sensitivity").includes("thessaly's"));
  });
});

describe("queryTerms", () => {
  it("drops the scaffolding of a question but keeps the clinical words", () => {
    assert.deepEqual(queryTerms("how do I test the meniscus"), ["test", "meniscus"]);
  });

  it("keeps a short numeric token, which is a real query", () => {
    assert.ok(queryTerms("c5 myotome").includes("c5"));
    assert.ok(queryTerms("0.54").includes("0.54"));
  });

  it("returns nothing for a query that is only stopwords", () => {
    assert.deepEqual(queryTerms("how do I"), []);
  });
});

describe("rank", () => {
  const passages = [
    passage({ text: "Thessaly test · 20 degrees of knee flexion, standing", kind: "number" }),
    passage({ text: "Meniscal testing in general, and why the cluster matters more", kind: "prose" }),
    passage({ text: "Rehabilitation after meniscus procedures, graded A", kind: "row" }),
  ];
  const index = buildIndex(passages);

  it("puts the passage naming a rare term above one merely about the topic", () => {
    const terms = weightTerms(queryTerms("Thessaly"), []);
    const [top] = rank(index, terms, "Thessaly");
    assert.match(top.passage.text, /Thessaly/);
  });

  it("reports full coverage only when a passage holds every term the reader typed", () => {
    const covered = rank(index, weightTerms(queryTerms("Thessaly knee"), []), "Thessaly knee");
    assert.equal(bestCoverage(covered), 1);

    const uncovered = rank(index, weightTerms(queryTerms("meniscus gives way"), []), "meniscus gives way");
    assert.ok(bestCoverage(uncovered) < 1, "nothing here says 'gives way', so coverage must be partial");
  });

  it("returns nothing rather than everything when no term matches", () => {
    assert.deepEqual(rank(index, weightTerms(["zygomaticus"], []), "zygomaticus"), []);
  });

  it("caps how many results one section may contribute", () => {
    const crowded = buildIndex([
      passage({ text: "meniscus one" }),
      passage({ text: "meniscus two" }),
      passage({ text: "meniscus three" }),
      passage({ text: "meniscus four", sectionId: "arom", heading: "Active range" }),
    ]);
    const hits = rank(crowded, weightTerms(["meniscus"], []), "meniscus", { perSection: 2 });
    const fromSpecial = hits.filter((hit) => hit.passage.sectionId === "special");
    assert.equal(fromSpecial.length, 2, "one section flooded the results");
    assert.equal(hits.length, 3);
  });

  it("weights a typed term above an expansion term", () => {
    const pair = buildIndex([
      passage({ text: "instability on the pivot shift", sectionId: "a" }),
      passage({ text: "the knee gives way descending stairs", sectionId: "b" }),
    ]);
    // "gives way" is what the reader typed; "instability" is what expansion offered. The
    // reader's own words have to win, or the model's guess at the vocabulary silently
    // replaces the query.
    const terms = weightTerms(queryTerms("gives way"), ["instability"]);
    const [top] = rank(pair, terms, "gives way");
    assert.equal(top.passage.sectionId, "b");
  });

  it("lets expansion surface a passage the typed words miss entirely", () => {
    const only = buildIndex([passage({ text: "instability on the pivot shift test" })]);
    assert.deepEqual(rank(only, weightTerms(queryTerms("gives way"), []), "gives way"), []);
    const widened = rank(only, weightTerms(queryTerms("gives way"), ["instability"]), "gives way");
    assert.equal(widened.length, 1, "expansion did not reach the passage");
  });

  it("boosts the guide the query names", () => {
    const across = buildIndex([
      passage({ slug: "shoulder-examination", text: "the arm gives way against the push" }),
      passage({ slug: "knee-examination", text: "gives way on the stairs" }),
    ]);
    const terms = weightTerms(queryTerms("knee gives way"), []);
    const guides = [
      { slug: "shoulder-examination", name: "Shoulder Examination" },
      { slug: "knee-examination", name: "Knee Examination" },
    ];
    const weights = guideAffinity(queryTerms("knee gives way"), guides);
    assert.equal(weights.get("knee-examination"), 1.6);
    assert.equal(weights.get("shoulder-examination"), undefined);

    const [top] = rank(across, terms, "knee gives way", { slugWeights: weights });
    assert.equal(top.passage.slug, "knee-examination");
  });
});

describe("weightTerms", () => {
  it("keeps a typed term at full weight even when expansion repeats it", () => {
    const terms = weightTerms(["meniscus"], ["meniscus", "mcmurray"]);
    const meniscus = terms.filter((term) => term.term === "meniscus");
    assert.equal(meniscus.length, 1, "the term was added twice");
    assert.equal(meniscus[0].weight, 1, "expansion demoted a word the reader typed");
    assert.equal(terms.find((term) => term.term === "mcmurray")?.weight, EXPANSION_WEIGHT);
  });

  it("tokenizes a multi-word expansion phrase so it can match at all", () => {
    const terms = weightTerms([], ["joint line tenderness"]);
    assert.deepEqual(
      terms.map((term) => term.term).sort(),
      ["joint", "line", "tenderness"]
    );
  });
});

describe("splitByEntitlement", () => {
  const ranked = [
    { passage: passage({ slug: "knee-examination", text: "knee row" }), score: 9, coverage: 1 },
    { passage: passage({ slug: "shoulder-examination", text: "shoulder row" }), score: 8, coverage: 1 },
    { passage: passage({ slug: "shoulder-examination", text: "another shoulder row" }), score: 7, coverage: 1 },
  ];

  it("withholds every passage from a guide the reader has not unlocked", () => {
    const { visible, locked } = splitByEntitlement(ranked, (slug) => slug === "knee-examination");
    assert.equal(visible.length, 1);
    assert.equal(visible[0].passage.slug, "knee-examination");
    assert.deepEqual(locked, [{ slug: "shoulder-examination", matches: 2 }]);
  });

  it("carries no passage text in the locked summary", () => {
    const { locked } = splitByEntitlement(ranked, () => false);
    // A snippet is the paid content. The summary may name the guide and count matches; the
    // moment it carries text, search becomes a way to read a guide without buying it.
    const serialized = JSON.stringify(locked);
    assert.ok(!serialized.includes("shoulder row"), "locked summary leaked passage text");
    assert.ok(!serialized.includes("knee row"), "locked summary leaked passage text");
    assert.deepEqual(Object.keys(locked[0]).sort(), ["matches", "slug"]);
  });

  it("shows everything to a reader entitled to everything", () => {
    const { visible, locked } = splitByEntitlement(ranked, () => true);
    assert.equal(visible.length, 3);
    assert.deepEqual(locked, []);
  });
});

describe("snippet", () => {
  it("marks the matching run and leaves the rest alone", () => {
    const segments = snippet("Apley sums to 1.06, McMurray to 1.14", ["1.06"]);
    const marked = segments.filter((segment) => segment.hit).map((segment) => segment.text);
    assert.deepEqual(marked, ["1.06"]);
    assert.equal(segments.map((segment) => segment.text).join(""), "Apley sums to 1.06, McMurray to 1.14");
  });

  it("merges overlapping matches rather than nesting them", () => {
    const segments = snippet("the meniscus here", ["meniscus", "menisc"]);
    assert.equal(segments.filter((segment) => segment.hit).length, 1);
  });

  it("reconstructs the original text exactly when nothing is elided", () => {
    const text = "Joint line tenderness sums to 1.03";
    const joined = snippet(text, ["tenderness"]).map((segment) => segment.text).join("");
    assert.equal(joined, text);
  });

  it("windows a long passage around the first match and marks the elision", () => {
    const text = `${"filler words here ".repeat(40)}Thessaly${" and more after".repeat(40)}`;
    const segments = snippet(text, ["thessaly"], 120);
    assert.ok(segments.some((segment) => segment.hit && segment.text.toLowerCase() === "thessaly"));
    assert.ok(segments[0].text === "…", "an elided start should say so");
    assert.ok(segments[segments.length - 1].text === "…", "an elided end should say so");
    const shown = segments.map((segment) => segment.text).join("").length;
    assert.ok(shown < text.length, "nothing was windowed");
  });

  it("falls back to a readable head when no term is present in the text", () => {
    const segments = snippet("nothing relevant in here at all", ["thessaly"]);
    assert.equal(segments.length, 1);
    assert.equal(segments[0].hit, false);
  });
});
