import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatClock, formatMinutes, isEveningHour, localDateKey } from "./focus-settings";

/**
 * Small display helpers the Focus timer leans on. localDateKey in particular has to match
 * FocusSession.dateKey exactly, or "today" in the daily goal silently counts the wrong day.
 */

describe("localDateKey()", () => {
  it("formats the local calendar date as zero-padded YYYY-MM-DD", () => {
    assert.equal(localDateKey(new Date(2026, 0, 5, 23, 59)), "2026-01-05");
    assert.equal(localDateKey(new Date(2026, 11, 31, 0, 1)), "2026-12-31");
  });
});

describe("isEveningHour()", () => {
  it("covers 7 pm through 5:59 am", () => {
    assert.equal(isEveningHour(18), false);
    assert.equal(isEveningHour(19), true);
    assert.equal(isEveningHour(0), true);
    assert.equal(isEveningHour(5), true);
    assert.equal(isEveningHour(6), false);
  });
});

describe("formatClock() and formatMinutes()", () => {
  it("rounds partial seconds up so the dial never shows 00:00 early", () => {
    assert.equal(formatClock(1499.2), "25:00");
    assert.equal(formatClock(0.4), "00:01");
    assert.equal(formatClock(-3), "00:00");
  });

  it("switches to hours past 59 minutes", () => {
    assert.equal(formatMinutes(45), "45m");
    assert.equal(formatMinutes(60), "1h");
    assert.equal(formatMinutes(95), "1h 35m");
  });
});
