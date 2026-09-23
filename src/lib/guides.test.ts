import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GUIDES, canReadGuide, guideIsReadable, isKnownGuide } from "./guides";

describe("guide publication rule", () => {
  // Covered here rather than through the registry so the rule survives every guide being
  // published — which is the state the registry is in now.
  it("hides an unpublished guide from a reader and opens it to an admin", () => {
    assert.equal(guideIsReadable({ comingSoon: true }, false), false);
    assert.equal(guideIsReadable({ comingSoon: true }, true), true);
  });

  it("opens a published guide to both", () => {
    assert.equal(guideIsReadable({}, false), true);
    assert.equal(guideIsReadable({}, true), true);
  });

  it("keeps an unknown slug a 404 for everyone, admin included", () => {
    for (const slug of ["", "../secrets", "elbow-examination"]) {
      assert.equal(isKnownGuide(slug), false, slug);
      assert.equal(canReadGuide(slug, { admin: true }), false, slug);
      assert.equal(canReadGuide(slug, { admin: false }), false, slug);
    }
  });

  it("every registry guide resolves through the same rule", () => {
    assert.ok(GUIDES.length > 0);
    for (const guide of GUIDES) {
      assert.equal(isKnownGuide(guide.slug), true, guide.slug);
      assert.equal(canReadGuide(guide.slug, { admin: true }), true, guide.slug);
      assert.equal(canReadGuide(guide.slug, { admin: false }), !guide.comingSoon, guide.slug);
    }
  });
});
