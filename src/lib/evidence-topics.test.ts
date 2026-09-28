import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EVIDENCE_TOPICS, getEvidenceTopic, topicsForArticle } from "./evidence-topics";
import { readFileSync } from "node:fs";
import { OUTCOME_MEASURES } from "./outcome-measures";
import { findRetraction } from "./retraction-check";
import { RETRACTION_WATCH_ARTICLES } from "./retraction-watch-data";

// Read from source rather than imported: orthopt-cpg-static.ts reaches next/cache through
// lib/news-live.ts, which Node's test runner cannot load outside Next.
const ORTHOPT_CPG_SEED = [
  ...readFileSync(new URL("./orthopt-cpg-static.ts", import.meta.url), "utf8").matchAll(/cpg\(\s*"([a-z0-9-]+)"/g),
].map((m) => ({ id: `cpg-${m[1]}` }));

describe("EVIDENCE_TOPICS", () => {
  it("has unique slugs and only references real guidelines and measures", () => {
    const slugs = EVIDENCE_TOPICS.map((t) => t.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    const cpgIds = new Set(ORTHOPT_CPG_SEED.map((c) => c.id));
    const measureIds = new Set(OUTCOME_MEASURES.map((m) => m.id));
    for (const t of EVIDENCE_TOPICS) {
      for (const id of t.cpgIds) assert.ok(cpgIds.has(id), `${t.slug}: unknown guideline ${id}`);
      for (const id of t.measureIds) assert.ok(measureIds.has(id), `${t.slug}: unknown measure ${id}`);
    }
  });

  it("every guideline belongs to at least one topic", () => {
    assert.ok(ORTHOPT_CPG_SEED.length >= 5);
    for (const c of ORTHOPT_CPG_SEED) {
      assert.ok(EVIDENCE_TOPICS.some((t) => t.cpgIds.includes(c.id)), `${c.id} has no topic`);
    }
  });

  it("matches articles on title and tags", () => {
    const slugs = (title: string, tags: string[] = []) => topicsForArticle({ title, tags }).map((t) => t.slug);
    assert.deepEqual(slugs("Motor control exercise for chronic low back pain: an RCT"), ["low-back-pain"]);
    assert.ok(slugs("Return to sport after ACL reconstruction").includes("acl"));
    assert.deepEqual(slugs("Hand grip strength in healthy adults"), []);
    // "ACL" is case-sensitive: the word "acl" inside other text must not match.
    assert.deepEqual(slugs("Oracle-based scheduling"), []);
  });

  it("looks topics up by slug", () => {
    assert.equal(getEvidenceTopic("neck-pain")?.name, "Neck pain");
    assert.equal(getEvidenceTopic("nope"), null);
  });
});

describe("findRetraction()", () => {
  const sample = RETRACTION_WATCH_ARTICLES.find((a) => a.sourceUrl?.includes("doi.org/"))!;

  it("flags a retracted paper by DOI in any common form", () => {
    const doi = sample.sourceUrl!.replace(/^https?:\/\/doi\.org\//, "");
    assert.ok(findRetraction({ doi, title: "unrelated" }));
    assert.ok(findRetraction({ doi: doi.toUpperCase(), title: "unrelated" }));
    assert.ok(findRetraction({ title: "unrelated", sourceUrl: sample.sourceUrl }));
  });

  it("flags by exact title and ignores near misses", () => {
    assert.ok(findRetraction({ title: sample.title.toUpperCase() + "." }));
    assert.equal(findRetraction({ title: sample.title + " a follow-up study" }), null);
  });
});
