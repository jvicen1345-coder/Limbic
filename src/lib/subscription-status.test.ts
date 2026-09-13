import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  daysRemainingFromPeriodEnd,
  periodEndFromStripeSubscription,
  subscriptionCardModel,
  themePreferenceLabel,
} from "./subscription-status";

const NOW = new Date("2026-09-13T12:00:00.000Z");

function flags(overrides: Partial<Parameters<typeof subscriptionCardModel>[0]> = {}) {
  return {
    isPro: false,
    studentTier: "none",
    isWellnessPlus: false,
    isClinicPro: false,
    stripeCurrentPeriodEnd: null,
    ...overrides,
  };
}

describe("themePreferenceLabel", () => {
  it("maps the three persisted values and treats anything else as System", () => {
    assert.equal(themePreferenceLabel("light"), "Light");
    assert.equal(themePreferenceLabel("dark"), "Dark");
    assert.equal(themePreferenceLabel("system"), "System");
    assert.equal(themePreferenceLabel(""), "System");
    assert.equal(themePreferenceLabel("sepia"), "System");
  });
});

describe("daysRemainingFromPeriodEnd", () => {
  it("returns null for missing, invalid, zero, or past dates — never 0 or negative", () => {
    assert.equal(daysRemainingFromPeriodEnd(null, NOW), null);
    assert.equal(daysRemainingFromPeriodEnd(undefined, NOW), null);
    assert.equal(daysRemainingFromPeriodEnd(new Date(NaN), NOW), null);
    assert.equal(daysRemainingFromPeriodEnd(NOW, NOW), null);
    assert.equal(daysRemainingFromPeriodEnd(new Date("2026-09-12T12:00:00.000Z"), NOW), null);
  });

  it("ceils remaining time to a positive whole day", () => {
    assert.equal(daysRemainingFromPeriodEnd(new Date("2026-09-14T12:00:00.000Z"), NOW), 1);
    assert.equal(daysRemainingFromPeriodEnd(new Date("2026-09-13T12:00:01.000Z"), NOW), 1);
    assert.equal(daysRemainingFromPeriodEnd(new Date("2026-09-23T12:00:00.000Z"), NOW), 10);
  });
});

describe("periodEndFromStripeSubscription", () => {
  it("prefers the subscription-item field Stripe API 2025+ uses", () => {
    const end = periodEndFromStripeSubscription({
      items: { data: [{ current_period_end: 1_800_000_000 }] },
      current_period_end: 1,
    });
    assert.deepEqual(end, new Date(1_800_000_000 * 1000));
  });

  it("falls back to a legacy subscription-level current_period_end", () => {
    const end = periodEndFromStripeSubscription({
      items: { data: [] },
      current_period_end: 1_800_000_000,
    });
    assert.deepEqual(end, new Date(1_800_000_000 * 1000));
  });

  it("returns null when neither field is a positive unix timestamp", () => {
    assert.equal(periodEndFromStripeSubscription({ items: { data: [] } }), null);
    assert.equal(
      periodEndFromStripeSubscription({ items: { data: [{ current_period_end: 0 }] } }),
      null,
    );
  });
});

describe("subscriptionCardModel", () => {
  it("shows Free + status and never a countdown", () => {
    const model = subscriptionCardModel(flags(), NOW);
    assert.equal(model.planName, "Free");
    assert.equal(model.status, "Free plan");
    assert.deepEqual(model.statusParts, ["Free plan"]);
    assert.equal(model.daysRemaining, null);
    assert.doesNotMatch(model.status, /day/);
  });

  it("names Pro, Student, Wellness+, and Clinic correctly", () => {
    assert.equal(subscriptionCardModel(flags({ isPro: true }), NOW).planName, "LimbicPRO");
    assert.equal(subscriptionCardModel(flags({ studentTier: "limbicStudent" }), NOW).planName, "Limbic Student");
    assert.equal(subscriptionCardModel(flags({ isWellnessPlus: true }), NOW).planName, "Limbic Wellness+");
    assert.equal(subscriptionCardModel(flags({ isClinicPro: true }), NOW).planName, "Clinic PRO");
  });

  it("keeps the clinician plan as the headline when Wellness+ or Clinic is stacked", () => {
    const stacked = subscriptionCardModel(
      flags({ isPro: true, isWellnessPlus: true, isClinicPro: true }),
      NOW,
    );
    assert.equal(stacked.planName, "LimbicPRO");
    assert.match(stacked.status, /also Wellness\+/);
    assert.match(stacked.status, /also Clinic PRO/);
    assert.deepEqual(stacked.statusParts, ["Active", "also Wellness+", "also Clinic PRO"]);
  });

  it("omits the countdown when period-end is null — never 0 days left", () => {
    const model = subscriptionCardModel(flags({ isPro: true, stripeCurrentPeriodEnd: null }), NOW);
    assert.equal(model.status, "Active");
    assert.equal(model.daysRemaining, null);
    assert.doesNotMatch(model.status, /0 days? left/);
    assert.doesNotMatch(model.status, /-/);
  });

  it("appends a positive days-left countdown only", () => {
    const withDays = subscriptionCardModel(
      flags({ isPro: true, stripeCurrentPeriodEnd: new Date("2026-09-20T12:00:00.000Z") }),
      NOW,
    );
    assert.equal(withDays.daysRemaining, 7);
    assert.match(withDays.status, /7 days left/);

    const oneDay = subscriptionCardModel(
      flags({ studentTier: "limbicStudent", stripeCurrentPeriodEnd: new Date("2026-09-14T12:00:00.000Z") }),
      NOW,
    );
    assert.equal(oneDay.daysRemaining, 1);
    assert.match(oneDay.status, /1 day left/);

    const expired = subscriptionCardModel(
      flags({ isWellnessPlus: true, stripeCurrentPeriodEnd: new Date("2026-09-01T12:00:00.000Z") }),
      NOW,
    );
    assert.equal(expired.planName, "Limbic Wellness+");
    assert.equal(expired.status, "Active");
    assert.equal(expired.daysRemaining, null);
  });
});
