import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { REVIEW_INTERVAL_DAYS, initialReviewStage, nextReviewDate, nextReviewStage } from "./focus-review";

/**
 * The review schedule decides when a recalled topic comes back to the Focus timer's review
 * queue. If it drifts, students either see well-known topics every day (and stop trusting
 * the queue) or lose weak topics for weeks, so the rules are pinned here.
 */

describe("nextReviewStage()", () => {
  it("moves up one rung after a strong recall", () => {
    assert.equal(nextReviewStage(0, 90), 1);
    assert.equal(nextReviewStage(2, 80), 3);
  });

  it("stays on its rung after a partial recall", () => {
    assert.equal(nextReviewStage(2, 65), 2);
    assert.equal(nextReviewStage(0, 50), 0);
  });

  it("drops back to the first rung after a weak recall or no written recall", () => {
    assert.equal(nextReviewStage(4, 30), 0);
    assert.equal(nextReviewStage(3, null), 0);
  });

  it("never climbs past the last rung or below the first", () => {
    const last = REVIEW_INTERVAL_DAYS.length - 1;
    assert.equal(nextReviewStage(last, 100), last);
    assert.equal(nextReviewStage(99, 100), last);
    assert.equal(nextReviewStage(-3, 90), 1);
  });
});

describe("nextReviewDate()", () => {
  const from = new Date("2026-09-28T06:00:00.000Z");

  it("counts the rung's interval in days from the given time", () => {
    assert.equal(nextReviewDate(from, 0).toISOString(), "2026-09-29T06:00:00.000Z");
    assert.equal(nextReviewDate(from, 2).toISOString(), "2026-10-05T06:00:00.000Z");
  });

  it("clamps an out-of-range rung to the ladder", () => {
    assert.equal(nextReviewDate(from, 50).getTime(), nextReviewDate(from, REVIEW_INTERVAL_DAYS.length - 1).getTime());
  });
});

describe("initialReviewStage()", () => {
  it("lets a strong first recall skip the one-day review", () => {
    assert.equal(initialReviewStage(85), 1);
    assert.equal(initialReviewStage(60), 0);
    assert.equal(initialReviewStage(null), 0);
  });
});
