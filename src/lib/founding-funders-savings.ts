// The "why now" math for /founding-funders — the one-time founding price set against what
// the same access costs on the regular subscription it replaces. Kept separate from
// founding-funders-config.ts so it stays a pure, unit-testable module (see the .test.ts).

/** The subscription a Founding Funder membership replaces. Prices mirror the display copy
 *  in app/(app)/profile/membership/page.tsx (the only other place dollar amounts live — see
 *  lib/stripe.ts). `yearlyUsd` is null when the plan has no annual option; the comparison
 *  then falls back to twelve monthly payments. Update both places together. */
export type ComparedPlan = { name: string; monthlyUsd: number; yearlyUsd: number | null };

export const FOUNDING_FUNDERS_COMPARED_PLAN: ComparedPlan = { name: "LimbicPRO", monthlyUsd: 10, yearlyUsd: null };

/** Year marks shown on the page's cost-over-time comparison. */
export const FOUNDING_FUNDERS_SAVINGS_YEARS = [1, 3, 5] as const;

export type SavingsRow = { years: number; subscriptionUsd: number; savedUsd: number };

export type FoundingSavings = {
  foundingUsd: number;
  plan: ComparedPlan;
  /** Cost of one year on the plan's cheapest regular billing (yearly if offered). */
  perYearUsd: number;
  /** "month" or "year" — which billing cycle perYearUsd is based on. */
  cadence: "month" | "year";
  /** Whole months of the monthly plan the founding price covers before it's paid for. */
  breakEvenMonths: number;
  rows: SavingsRow[];
};

export function computeFoundingSavings(
  foundingUsd: number,
  plan: ComparedPlan,
  years: readonly number[] = FOUNDING_FUNDERS_SAVINGS_YEARS,
): FoundingSavings {
  const cadence = plan.yearlyUsd != null ? "year" : "month";
  const perYearUsd = plan.yearlyUsd ?? plan.monthlyUsd * 12;
  return {
    foundingUsd,
    plan,
    perYearUsd,
    cadence,
    breakEvenMonths: Math.ceil(foundingUsd / plan.monthlyUsd),
    rows: years.map((y) => {
      const subscriptionUsd = perYearUsd * y;
      return { years: y, subscriptionUsd, savedUsd: Math.max(0, subscriptionUsd - foundingUsd) };
    }),
  };
}
