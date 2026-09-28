import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assessEffect, assessEffects, matchMeasure } from "./clinical-meaning";
import type { ExtractedEffect } from "./article-breakdown-shared";

const effect = (e: Partial<ExtractedEffect>): ExtractedEffect => ({
  outcome: "NPRS",
  comparison: "between-group",
  estimate: 0,
  ciLower: null,
  ciUpper: null,
  unit: "points",
  ...e,
});

describe("matchMeasure()", () => {
  it("recognizes measures by abbreviation and full name", () => {
    assert.equal(matchMeasure("Oswestry Disability Index")?.id, "odi");
    assert.equal(matchMeasure("pain (NPRS, 0-10)")?.id, "nprs");
    assert.equal(matchMeasure("LEFS score")?.id, "lefs");
  });

  it("does not match QuickDASH to the DASH MCID", () => {
    assert.equal(matchMeasure("QuickDASH"), null);
    assert.equal(matchMeasure("Quick-DASH"), null);
    assert.equal(matchMeasure("DASH"), matchMeasure("Disabilities of the Arm, Shoulder and Hand"));
  });

  it("never judges a measure with no accepted MCID", () => {
    assert.equal(matchMeasure("Berg Balance Scale"), null);
    assert.equal(matchMeasure("Timed Up and Go"), null);
  });
});

describe("assessEffect()", () => {
  it("is likely meaningful when even the cautious CI end clears the MCID", () => {
    const r = assessEffect(effect({ estimate: -3.1, ciLower: -4, ciUpper: -2.2 }));
    assert.equal(r?.verdict, "likely");
  });

  it("is uncertain when the point clears but the CI reaches below the MCID", () => {
    const r = assessEffect(effect({ estimate: 2.5, ciLower: 0.8, ciUpper: 4.2 }));
    assert.equal(r?.verdict, "uncertain");
  });

  it("is unlikely when the CI includes zero", () => {
    const r = assessEffect(effect({ estimate: 2.5, ciLower: -0.5, ciUpper: 5 }));
    assert.equal(r?.verdict, "unlikely");
    assert.match(r!.detail, /includes zero/);
  });

  it("is unlikely when the point estimate is below the MCID", () => {
    assert.equal(assessEffect(effect({ estimate: 1.2 }))?.verdict, "unlikely");
  });

  it("is uncertain, not likely, without a CI", () => {
    assert.equal(assessEffect(effect({ estimate: 3 }))?.verdict, "uncertain");
  });

  it("skips within-group changes, unknown measures, and out-of-scale numbers", () => {
    assert.equal(assessEffect(effect({ comparison: "within-group", estimate: 4 })), null);
    assert.equal(assessEffect(effect({ outcome: "VAS", estimate: 20 })), null);
    assert.equal(assessEffect(effect({ estimate: 25 })), null);
    assert.equal(assessEffect(effect({ estimate: 3, unit: "%" })), null);
  });

  it("keeps one result per measure", () => {
    const r = assessEffects([effect({ estimate: 3 }), effect({ estimate: 1 }), effect({ outcome: "ODI", estimate: 12 })]);
    assert.deepEqual(
      r.map((m) => m.measure.id),
      ["nprs", "odi"]
    );
  });
});
