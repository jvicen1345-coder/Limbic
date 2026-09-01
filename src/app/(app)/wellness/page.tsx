import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getWellnessArticles } from "@/lib/articles";
import { computeWellnessSet, WELLNESS_ARTICLE_TARGET } from "@/lib/wellness-rotation";
import { wellnessTipForDate, splitWellnessTip } from "@/lib/wellness-tips-static";
import { todayDateKey } from "@/lib/wordle-words";
import { isMetricsLogMetric, type MetricsLogMetric } from "@/lib/metrics";
import { VITALS_CATEGORY_LABEL, isWellnessProfileComplete, type VitalsCategory } from "@/lib/vitals";
import { getWellnessProfile } from "@/lib/wellness-profile";
import { summarizeSleep, summarizeMood } from "@/lib/wellness-recovery";
import { dateToLocalIso } from "@/lib/limbic-calendar";
import { wellnessCardOrder, type WellnessCardKey } from "@/lib/user-role";
import { WellnessOverviewTabs } from "@/components/WellnessOverviewTabs";
import { WellnessArticlePreview } from "@/components/wellness/WellnessArticlePreview";
import { MetricsTrackingSection, type MetricsLogEntry } from "@/components/metrics/MetricsTrackingSection";
import { RecoverySection } from "@/components/wellness/RecoverySection";
import { BodyMetricsCard } from "@/components/vitals/BodyMetricsCard";
import {
  ActivityIcon,
  LeafIcon,
  CheckCircleIcon,
  DumbbellIcon,
  ShieldIcon,
  ChevronRightIcon,
  ZapIcon,
  LockIcon,
} from "@/components/icons";
import { getTimeZone } from "@/lib/user-time-zone";

/** The six Explore cards, keyed by lib/user-role.ts's WellnessCardKey — which two lead (and
 *  so get the large primary-row treatment) is decided per-role by wellnessCardOrder there,
 *  not here, so this map only ever holds a card's content. Ask Limbic Agent is deliberately
 *  absent: it's the featured banner above the grid now, not a seventh card. Common
 *  Pathologies is likewise gone from the hub — it's clinical reference reading, so it sits
 *  under LimbicPRO in the sidebar instead (see components/AppShell.tsx); /wellness/pathologies
 *  itself is untouched. */
const EXPLORE_CARDS: Record<WellnessCardKey, { title: string; href: string; icon: typeof ActivityIcon; accent: string; description: string }> = {
  metrics: { title: "Metrics", href: "/wellness/metrics", icon: ActivityIcon, accent: "blue", description: "Calculators for the numbers that matter." },
  activity: { title: "Activity Log", href: "/wellness/activity", icon: ZapIcon, accent: "orange", description: "Log your weekly cardio, strength, mobility, and mindfulness." },
  nutrition: { title: "Nutrition", href: "/wellness/nutrition", icon: LeafIcon, accent: "green", description: "General nutrition guidance and a free macro calculator." },
  assess: { title: "Assess Yourself", href: "/wellness/assess", icon: CheckCircleIcon, accent: "amber", description: "Simple movement screens you can do at home." },
  exercises: { title: "Exercise Library", href: "/wellness/exercises", icon: DumbbellIcon, accent: "purple", description: "Functional exercises for general health, and how reps and load relate to your training goal." },
  connexion: {
    title: "Connexion Method",
    href: "/connexion",
    icon: ShieldIcon,
    accent: "teal",
    description: "Senior home safety assessment and fall prevention — developed by Dr. Delia Vicencio, PT, DPT.",
  },
};

/** Display labels and units for the single most recent MetricsLog row, shown as the Metrics
 *  card's live preview. Intentionally its own small map rather than an import from
 *  components/metrics/MetricsTrackingSection.tsx's TRACKED_METRICS — that list is scoped to
 *  what the trends chart plots, while every metric a reader can log needs a label here. */
const METRIC_PREVIEW: Record<MetricsLogMetric, { label: string; unit: string; decimals: number }> = {
  bmi: { label: "BMI", unit: "", decimals: 1 },
  hrv: { label: "HRV", unit: "ms", decimals: 0 },
  vo2max: { label: "VO2 Max", unit: "mL/kg/min", decimals: 1 },
  restingHR: { label: "Resting HR", unit: "bpm", decimals: 0 },
  maxHR: { label: "Max HR", unit: "bpm", decimals: 0 },
  singleLegStance: { label: "Single-Leg Stance", unit: "s", decimals: 0 },
  sitAndRise: { label: "Sit and Rise", unit: "", decimals: 1 },
  wallSit: { label: "Wall Sit", unit: "s", decimals: 0 },
  shoulderScratch: { label: "Shoulder Scratch", unit: "in", decimals: 1 },
  bodyFat: { label: "Body Fat", unit: "%", decimals: 1 },
  oxygenSaturation: { label: "O2 Saturation", unit: "%", decimals: 0 },
  bloodGlucose: { label: "Blood Glucose", unit: "mg/dL", decimals: 0 },
  sleepHours: { label: "Sleep", unit: "hrs", decimals: 1 },
  caloriesConsumed: { label: "Calories", unit: "kcal", decimals: 0 },
  proteinConsumedG: { label: "Protein", unit: "g", decimals: 0 },
  carbsConsumedG: { label: "Carbs", unit: "g", decimals: 0 },
  fatConsumedG: { label: "Fat", unit: "g", decimals: 0 },
};

/** How far back the Trends tab's Recovery block looks. Two weeks is long enough for a
 *  nightly average and an active-vs-rest-day mood split to mean something, and short enough
 *  that both still describe how the reader is doing now. */
const RECOVERY_WINDOW_DAYS = 14;

function shortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function WellnessOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const recoveryWindowStart = new Date();
  recoveryWindowStart.setDate(recoveryWindowStart.getDate() - (RECOVERY_WINDOW_DAYS - 1));
  recoveryWindowStart.setHours(0, 0, 0, 0);

  const [profile, latestVitalsLog, latestMetricsLog, metricsLogRows, sleepRows, moodRows, activeDayRows, articlePool] =
    await Promise.all([
      // Drives the setup prompt below rather than the old Health Snapshot card — the two
      // queries that fed that card (this one, plus a latest-HRV lookup) had been left in
      // place with no reader; the HRV one is gone and this one has a real purpose again.
      getWellnessProfile(user.id),
      prisma.vitalsLog.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      prisma.metricsLog.findFirst({ where: { userId: user.id }, orderBy: { loggedAt: "desc" } }),
      prisma.metricsLog.findMany({ where: { userId: user.id }, orderBy: { loggedAt: "desc" }, take: 60 }),
      // Sleep and mood for the Trends tab's Recovery block. SleepLog is written by
      // lib/google-health-sleep-sync.ts and, until this read, had no reader anywhere in the
      // app; MoodLog was read only by the Activity Log page that writes it.
      prisma.sleepLog.findMany({ where: { userId: user.id, date: { gte: recoveryWindowStart } }, orderBy: { date: "desc" } }),
      prisma.moodLog.findMany({ where: { userId: user.id, date: { gte: recoveryWindowStart } }, orderBy: { date: "desc" } }),
      prisma.vitalsLog.findMany({
        where: { userId: user.id, date: { gte: recoveryWindowStart } },
        select: { date: true },
      }),
      getWellnessArticles(),
    ]);

  const metricsLogs: MetricsLogEntry[] = metricsLogRows
    .filter((r) => isMetricsLogMetric(r.metric))
    .map((r) => ({ id: r.id, metric: r.metric as MetricsLogEntry["metric"], value: r.value, loggedAt: r.loggedAt }));

  // Bucketed by local date so a late-evening workout and that evening's mood check-in land
  // on the same day — see summarizeMood in lib/wellness-recovery.ts.
  const activeDateKeys = new Set(activeDayRows.map((r) => dateToLocalIso(r.date)));
  const sleepSummary = summarizeSleep(
    sleepRows.map((r) => ({ date: r.date, minutesAsleep: r.minutesAsleep, minutesInBed: r.minutesInBed }))
  );
  const moodSummary = summarizeMood(
    moodRows.map((r) => ({ dateKey: dateToLocalIso(r.date), mood: r.mood })),
    activeDateKeys
  );

  // Every calculator in this section reads the same profile, but it could only ever be
  // entered on Metrics — so a new reader met "add your details first" on Assess Yourself and
  // Nutrition with no way to act on it from where they stood. The same card, shown here
  // until the profile can actually drive those calculators.
  const needsProfile = !isWellnessProfileComplete(profile);

  const timeZone = await getTimeZone(user);
  const dailyTip = splitWellnessTip(wellnessTipForDate(todayDateKey(timeZone)));
  const todayLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone });

  // Same gate the agent itself enforces (see app/(app)/wellness/agent/page.tsx) — the banner
  // only ever mirrors it, so a locked reader lands on Membership instead of a paywall.
  const agentUnlocked = user.isWellnessPlus || user.isPro;

  const latestMetric =
    latestMetricsLog && isMetricsLogMetric(latestMetricsLog.metric)
      ? { ...METRIC_PREVIEW[latestMetricsLog.metric], value: latestMetricsLog.value, loggedAt: latestMetricsLog.loggedAt }
      : null;

  const latestActivity = latestVitalsLog
    ? {
        label: VITALS_CATEGORY_LABEL[latestVitalsLog.category as VitalsCategory] ?? latestVitalsLog.category,
        activity: latestVitalsLog.activity,
        date: latestVitalsLog.date,
      }
    : null;

  /** The live preview line under a card's description — only Metrics and Activity Log have
   *  one. Attached to the card, not to the row it happens to land in: the role orders below
   *  move Activity Log out of the primary row for two of the three roles, and Fix 7's rule
   *  is that role changes position only, never a card's content. */
  const CARD_PREVIEW: Partial<Record<WellnessCardKey, string>> = {
    metrics: latestMetric
      ? `Last logged: ${latestMetric.label} ${latestMetric.value.toFixed(latestMetric.decimals)}${latestMetric.unit ? ` ${latestMetric.unit}` : ""} on ${shortDate(latestMetric.loggedAt)}`
      : "No metrics logged yet — start tracking",
    activity: latestActivity
      ? `Last logged: ${latestActivity.activity || latestActivity.label} on ${shortDate(latestActivity.date)}`
      : "No activity logged — add your first entry",
  };

  const cardOrder = wellnessCardOrder(user.userRole);
  const primaryKeys = cardOrder.slice(0, 2);
  const secondaryKeys = cardOrder.slice(2);

  function renderCard(key: WellnessCardKey, size: "primary" | "secondary") {
    const card = EXPLORE_CARDS[key];
    const Icon = card.icon;
    const preview = CARD_PREVIEW[key];
    return (
      <Link
        key={card.href}
        href={card.href}
        className={`wellness-explore-card wellness-explore-card--${card.accent} wellness-explore-card--${size}`}
      >
        <span className="wellness-explore-icon">
          <Icon size={size === "primary" ? 22 : 18} />
        </span>
        <span className="wellness-explore-title">{card.title}</span>
        <span className="wellness-explore-desc">{card.description}</span>
        {preview && <span className="wellness-explore-preview">{preview}</span>}
        <ChevronRightIcon size={16} className="wellness-explore-arrow" />
      </Link>
    );
  }

  // Latest 3 for the Overview preview — same rotation pool as the full feed (see
  // app/(app)/wellness/articles/page.tsx), just capped rather than recomputed separately.
  const storedArticleIds = (user.wellnessArticleIds as string[]) ?? [];
  const openedIds = (user.wellnessOpenedIds as string[]) ?? [];
  const articleIds = computeWellnessSet(articlePool.map((a) => a.id), storedArticleIds, openedIds, WELLNESS_ARTICLE_TARGET, false);
  const articlePoolById = new Map(articlePool.map((a) => [a.id, a]));
  const savedWellnessRows = await prisma.savedWellness.findMany({ where: { userId: user.id }, select: { itemId: true } });
  const savedIds = savedWellnessRows.map((r) => r.itemId);
  const previewArticles = articleIds
    .map((id) => articlePoolById.get(id))
    .filter((a) => a != null)
    .slice(0, 3);

  return (
    <div className="screen-pad wellness-hub-page page-enter" style={{ maxWidth: 980 }}>
      <div className="wellness-hub-header">
        <h1 className="wellness-hub-title">Health and Wellness</h1>
        <p className="wellness-hub-subtitle">Your personal health hub</p>
      </div>

      {/* Replaces the old Health Snapshot card — the three things a reader actually comes
          here to do, rather than a restatement of numbers the cards below already show. */}
      <div className="wellness-quick-actions">
        <Link href="/wellness/activity" className="wellness-quick-action">
          <span className="wellness-quick-action-glyph" aria-hidden="true">
            +
          </span>
          Log Activity
        </Link>
        <Link href="/wellness/metrics" className="wellness-quick-action">
          <span className="wellness-quick-action-glyph" aria-hidden="true">
            ↗
          </span>
          View My Metrics
        </Link>
        <Link href="/wellness/agent" className="wellness-quick-action">
          <span className="wellness-quick-action-glyph wellness-quick-action-glyph--brand" aria-hidden="true">
            ⚡
          </span>
          Ask Limbic Agent
        </Link>
      </div>

      {needsProfile && (
        <div className="wellness-profile-setup">
          <div className="wellness-profile-setup-head">
            <span className="wellness-profile-setup-kicker">Finish your setup</span>
            <Link href="/wellness/metrics" className="wellness-snapshot-link" style={{ marginTop: 0 }}>
              Go to Metrics &rarr;
            </Link>
          </div>
          <p className="wellness-profile-setup-copy">
            Your age, height, weight, and biological sex are what the BMI, heart-rate, VO2 Max, and macro calculators
            compute from, and what Assess Yourself scores against. Add them once here and every one of them starts
            working &mdash; all optional, all private to you.
          </p>
          <BodyMetricsCard initial={profile} compact />
        </div>
      )}

      <div className="wellness-agent-banner">
        <div className="wellness-agent-banner-main">
          <div className="wellness-agent-banner-pill-row">
            <span className="wellness-agent-banner-pill">Premium</span>
            {!agentUnlocked && (
              <LockIcon size={12} className="wellness-agent-banner-lock" aria-label="Requires Wellness+ or LimbicPRO" />
            )}
          </div>
          <div className="wellness-agent-banner-title">Ask Limbic Agent</div>
          <p className="wellness-agent-banner-sub">
            Evidence-based wellness guidance — powered by physical therapy research.
          </p>
        </div>
        <div className="wellness-agent-banner-cta">
          {/* Membership lives under Profile (see lib/section-nav.ts PROFILE_TABS) — no
              ?tab= query, it's a real route. */}
          <Link href={agentUnlocked ? "/wellness/agent" : "/profile/membership"} className="wellness-agent-banner-btn">
            {agentUnlocked ? "Ask a Question →" : "Unlock with Wellness+"}
          </Link>
          <span className="wellness-agent-banner-note">Powered by Anthropic — clinical decision support only</span>
        </div>
      </div>

      <div className="wellness-tip-card">
        <div className="wellness-tip-card-head">
          <span className="wellness-tip-card-kicker">Today&rsquo;s Tip</span>
          <span className="wellness-tip-card-date">{todayLabel}</span>
        </div>
        <p className="wellness-tip-card-text">{dailyTip.text}</p>
        {dailyTip.source && <p className="wellness-tip-card-source">Source: {dailyTip.source}</p>}
      </div>

      <WellnessOverviewTabs
        explore={
          <div className="wellness-explore-rows">
            <div className="wellness-explore-grid wellness-explore-grid--primary">
              {primaryKeys.map((key) => renderCard(key, "primary"))}
            </div>
            <div className="wellness-explore-grid wellness-explore-grid--secondary">
              {secondaryKeys.map((key) => renderCard(key, "secondary"))}
            </div>
          </div>
        }
        trends={
          <div className="wellness-trends-panel">
            <MetricsTrackingSection logs={metricsLogs} />
            <RecoverySection sleep={sleepSummary} mood={moodSummary} moodWindowDays={RECOVERY_WINDOW_DAYS} />
          </div>
        }
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div className="wellness-section-label" style={{ margin: 0 }}>
          Latest Wellness Articles
        </div>
        <Link href="/wellness/articles" className="wellness-snapshot-link" style={{ marginTop: 0 }}>
          View all →
        </Link>
      </div>
      <WellnessArticlePreview articles={previewArticles} savedIds={savedIds} openedIds={openedIds} />
    </div>
  );
}
