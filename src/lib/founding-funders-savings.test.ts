import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeFoundingSavings } from "./founding-funders-savings";

describe("computeFoundingSavings()", () => {
  it("annualizes a monthly-only plan and finds the break-even month", () => {
    const s = computeFoundingSavings(40, { name: "LimbicPRO", monthlyUsd: 10, yearlyUsd: null }, [1, 3, 5]);
    assert.equal(s.cadence, "month");
    assert.equal(s.perYearUsd, 120);
    assert.equal(s.breakEvenMonths, 4);
    assert.deepEqual(s.rows, [
      { years: 1, subscriptionUsd: 120, savedUsd: 80 },
      { years: 3, subscriptionUsd: 360, savedUsd: 320 },
      { years: 5, subscriptionUsd: 600, savedUsd: 560 },
    ]);
  });

  it("compares against the yearly price when the plan offers one", () => {
    const s = computeFoundingSavings(40, { name: "Wellness+", monthlyUsd: 2, yearlyUsd: 20 }, [1, 2, 3]);
    assert.equal(s.cadence, "year");
    assert.equal(s.perYearUsd, 20);
    assert.equal(s.breakEvenMonths, 20);
    assert.deepEqual(s.rows.map((r) => r.savedUsd), [0, 0, 20]);
  });
});
