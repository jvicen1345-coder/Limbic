export type SubscriptionPlanKey = "free" | "pro" | "student" | "wellnessPlus" | "clinic";

export type SubscriptionCardModel = {
  planKey: SubscriptionPlanKey;
  planName: string;
  status: string;
  statusParts: string[];
  daysRemaining: number | null;
};

export type SubscriptionFlags = {
  isPro: boolean;
  studentTier: string;
  isWellnessPlus: boolean;
  isClinicPro: boolean;
  stripeCurrentPeriodEnd: Date | null;
};

const MS_PER_DAY = 86_400_000;

/** Light / Dark / System — the three persisted themePreference values. Anything else
 *  (including a missing or legacy string) is treated as System, matching ThemeSection. */
export function themePreferenceLabel(pref: string): "Light" | "Dark" | "System" {
  if (pref === "light") return "Light";
  if (pref === "dark") return "Dark";
  return "System";
}

/** Whole days until `periodEnd`. Null when there is no date, the date is invalid, or the
 *  remaining time is not a positive whole day — callers must omit the countdown rather
 *  than render "0 days left" or a negative number. */
export function daysRemainingFromPeriodEnd(periodEnd: Date | null | undefined, now = new Date()): number | null {
  if (!periodEnd) return null;
  const ms = periodEnd.getTime() - now.getTime();
  if (!Number.isFinite(ms)) return null;
  const days = Math.ceil(ms / MS_PER_DAY);
  if (days <= 0) return null;
  return days;
}

/** Stripe API 2025+ moved current_period_end onto each Subscription Item. Older payloads
 *  (and some Dashboard-created objects) still put it on the Subscription itself — accept
 *  either so a missing item field does not silently drop the write. */
export function periodEndFromStripeSubscription(subscription: {
  items?: { data?: Array<{ current_period_end?: number }> };
  current_period_end?: number;
}): Date | null {
  const fromItem = subscription.items?.data?.[0]?.current_period_end;
  const fromSubscription = subscription.current_period_end;
  const unix = typeof fromItem === "number" ? fromItem : typeof fromSubscription === "number" ? fromSubscription : null;
  if (unix == null || !Number.isFinite(unix) || unix <= 0) return null;
  return new Date(unix * 1000);
}

function headlinePlan(user: SubscriptionFlags): { planKey: SubscriptionPlanKey; planName: string } {
  if (user.isPro) return { planKey: "pro", planName: "LimbicPRO" };
  if (user.studentTier !== "none") return { planKey: "student", planName: "Limbic Student" };
  if (user.isWellnessPlus) return { planKey: "wellnessPlus", planName: "Limbic Wellness+" };
  if (user.isClinicPro) return { planKey: "clinic", planName: "Clinic PRO" };
  return { planKey: "free", planName: "Free" };
}

/** One-card summary for a reader who can stack Wellness+ or Clinic PRO on top of
 *  Pro/Student. Headline is the clinician plan when present (Pro > Student > Wellness+ >
 *  Clinic > Free). Add-ons are named in the status line rather than replacing the headline. */
export function subscriptionCardModel(user: SubscriptionFlags, now = new Date()): SubscriptionCardModel {
  const { planKey, planName } = headlinePlan(user);
  const daysRemaining = daysRemainingFromPeriodEnd(user.stripeCurrentPeriodEnd, now);

  if (planKey === "free") {
    return { planKey, planName, status: "Free plan", statusParts: ["Free plan"], daysRemaining: null };
  }

  const parts = ["Active"];
  if (planKey !== "wellnessPlus" && user.isWellnessPlus) parts.push("also Wellness+");
  if (planKey !== "clinic" && user.isClinicPro) parts.push("also Clinic PRO");
  if (daysRemaining != null) {
    parts.push(`${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`);
  }

  return { planKey, planName, status: parts.join(" · "), statusParts: parts, daysRemaining };
}
