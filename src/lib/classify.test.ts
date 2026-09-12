import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classify, allKnownKeywordTopics } from "./classify";

/**
 * classify() buckets every live-sourced PubMed/Google News article into a specialty and
 * type, and mines it for followable topic keywords — get it wrong and a whole class of real
 * research silently mis-files under the wrong specialty, or never surfaces as a topic at
 * all. That's exactly what happened with cardiopulmonary: a Student Specialty Track existed
 * with no matching Specialty, so every cardiopulmonary study fell through classify()'s
 * "ortho" default and was never its own filterable category (see specialty-content.test.ts
 * for the crosswalk that now guards against that specific drift).
 */

describe("classify() specialty detection", () => {
  it("recognizes every specialty, including cardiopulmonary", () => {
    assert.equal(classify("A randomized trial of ACL reconstruction rehabilitation protocols", "research").specialty, "ortho");
    assert.equal(classify("Stroke survivors show improved gait after vestibular therapy", "research").specialty, "neuro");
    assert.equal(classify("Cardiac rehabilitation improves outcomes in COPD patients", "research").specialty, "cardiopulm");
    assert.equal(classify("Return-to-sport testing after ACL injury in NCAA athletes", "research").specialty, "sports");
    assert.equal(classify("Cerebral palsy toddlers benefit from early intervention", "research").specialty, "pediatric");
    assert.equal(classify("Falls prevention programs reduce fall risk in older adults", "research").specialty, "geriatric");
  });

  it("falls back to ortho when nothing matches, rather than silently to some other specialty", () => {
    assert.equal(classify("A completely unrelated sentence about nothing clinical", "research").specialty, "ortho");
  });
});

describe("classify() exercise/technique tagging", () => {
  it("tags technique keywords alongside whichever specialty wins", () => {
    const result = classify(
      "A randomized trial of blood flow restriction combined with resistance training after ACL reconstruction",
      "research"
    );
    assert.equal(result.specialty, "ortho");
    assert.ok(result.matchedKeywords.includes("Blood Flow Restriction"));
    assert.ok(result.matchedKeywords.includes("Resistance Training"));
  });

  it("keeps every technique match on one article, unlike specialty/type's single winner", () => {
    const result = classify("Telerehabilitation-delivered therapeutic exercise and manual therapy for chronic low back pain", "research");
    assert.ok(result.matchedKeywords.includes("Telerehabilitation"));
    assert.ok(result.matchedKeywords.includes("Therapeutic Exercise"));
    assert.ok(result.matchedKeywords.includes("Manual Therapy"));
  });
});

describe("classify() type confidence", () => {
  it("is not confident when no type keyword appears, so a weak match isn't kept under that category", () => {
    assert.equal(classify("A physical therapist opened a new clinic downtown", "industry").typeConfident, false);
    assert.equal(classify("Medicare reimbursement policy changes for outpatient PT", "industry").typeConfident, true);
  });
});

describe("allKnownKeywordTopics()", () => {
  it("includes the new specialty and technique keywords as followable topics", () => {
    const topics = allKnownKeywordTopics();
    assert.ok(topics.includes("Cardiopulmonary"));
    assert.ok(topics.includes("Resistance Training"));
    assert.ok(topics.includes("Blood Flow Restriction"));
  });
});
