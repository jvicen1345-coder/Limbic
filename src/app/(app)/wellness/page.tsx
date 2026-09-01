import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getWellnessArticles } from "@/lib/articles";
import { computeWellnessSet, WELLNESS_ARTICLE_TARGET } from "@/lib/wellness-rotation";
import { wellnessTipForDate, splitWellnessTip } from "@/lib/wellness-tips-static";
import { todayDateKey } from "@/lib/wordle-words";
import { isMetricsLogMetric, type MetricsLogMetric } from "@/lib/metrics";
import { VITALS_CATEGORY_LABEL, type VitalsCategory } from "@/lib/vitals";
import { wellnessCardOrder, type WellnessCardKey } from "@/lib/user-role";
import { WellnessOverviewTabs } from "@/components/WellnessOverviewTabs";
import { WellnessArticlePreview } from "@/components/wellness/WellnessArticlePreview";
import { MetricsTrackingSection, type MetricsLogEntry } from "@/components/metrics/MetricsTrackingSection";
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
import { WellnessDisclaimer } from "@/components/vitals/WellnessDisclaimer";

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

function shortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function WellnessOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Unchanged from before this layout pass — same six queries, same shapes. `profile` and
  // `latestHrv` fed the removed Health Snapshot card and no longer have a reader on this
  // page; they stay in the batch (rather than being dropped) because this pass was scoped to
  // layout only, and they run in parallel with the four results below that are still used.
  const [, latestVitalsLog, , latestMetricsLog, metricsLogRows, articlePool] = await Promise.all([
    prisma.vitalsProfile.findUnique({ where: { userId: user.id } }),
    prisma.vitalsLog.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.metricsLog.findFirst({ where: { userId: user.id, metric: "hrv" }, orderBy: { loggedAt: "desc" } }),
    prisma.metricsLog.findFirst({ where: { userId: user.id }, orderBy: { loggedAt: "desc" } }),
    prisma.metricsLog.findMany({ where: { userId: user.id }, orderBy: { loggedAt: "desc" }, take: 60 }),
    getWellnessArticles(),
  ]);

  const metricsLogs: MetricsLogEntry[] = metricsLogRows
    .filter((r) => isMetricsLogMetric(r.metric))
    .map((r) => ({ id: r.id, metric: r.metric as MetricsLogEntry["metric"], value: r.value, loggedAt: r.loggedAt }));

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

      <WellnessDisclaimer />
    </div>
  );
}
