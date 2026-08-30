import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getWellnessArticles } from "@/lib/articles";
import { computeWellnessSet, WELLNESS_ARTICLE_TARGET } from "@/lib/wellness-rotation";
import { WellnessListItem } from "@/components/RowCards";
import { wellnessTipForDate } from "@/lib/wellness-tips-static";
import { todayDateKey } from "@/lib/wordle-words";
import { calculateBmi, bmiCategory, hrvCategory, isMetricsLogMetric } from "@/lib/metrics";
import { WellnessOverviewTabs } from "@/components/WellnessOverviewTabs";
import { MetricsTrackingSection, type MetricsLogEntry } from "@/components/metrics/MetricsTrackingSection";
import {
  ActivityIcon,
  LeafIcon,
  CheckCircleIcon,
  DumbbellIcon,
  NetworkIcon,
  ChevronRightIcon,
  ZapIcon,
  BandageIcon,
} from "@/components/icons";
import { getTimeZone } from "@/lib/user-time-zone";

const EXPLORE_CARDS = [
  { title: "Metrics", href: "/wellness/metrics", icon: ActivityIcon, accent: "blue", description: "Calculators for the numbers that matter." },
  { title: "Activity Log", href: "/wellness/activity", icon: ZapIcon, accent: "orange", description: "Log your weekly cardio, strength, mobility, and mindfulness." },
  { title: "Nutrition", href: "/wellness/nutrition", icon: LeafIcon, accent: "green", description: "General nutrition guidance and a free macro calculator." },
  { title: "Assess Yourself", href: "/wellness/assess", icon: CheckCircleIcon, accent: "amber", description: "Simple movement screens you can do at home." },
  { title: "Exercise Library", href: "/wellness/exercises", icon: DumbbellIcon, accent: "purple", description: "Functional exercises for general health, and how reps and load relate to your training goal." },
  { title: "Common Pathologies", href: "/wellness/pathologies", icon: BandageIcon, accent: "red", description: "Plain-language condition explanations, each with a video." },
] as const;

export default async function WellnessOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [profile, latestVitalsLog, latestHrv, latestMetricsLog, metricsLogRows, articlePool] = await Promise.all([
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

  const hasProfile = !!profile && (profile.heightFeet != null || profile.weightLbs != null || profile.wellnessGoal != null);

  const bmi =
    profile?.heightFeet != null && profile?.heightInches != null && profile?.weightLbs != null
      ? calculateBmi(profile.heightFeet, profile.heightInches, profile.weightLbs)
      : null;

  const hrvInterp = latestHrv && profile?.age != null ? hrvCategory(profile.age, latestHrv.value) : null;

  const lastActiveMs = Math.max(latestVitalsLog?.createdAt.getTime() ?? 0, latestMetricsLog?.loggedAt.getTime() ?? 0);
  const lastActiveDate = lastActiveMs > 0 ? new Date(lastActiveMs) : null;

  const dailyTip = wellnessTipForDate(todayDateKey(await getTimeZone(user)));

  // Latest 3 for the Overview preview — same rotation pool as the full feed (see
  // app/(app)/wellness/articles/page.tsx), just capped rather than recomputed separately.
  const storedArticleIds = (user.wellnessArticleIds as string[]) ?? [];
  const openedIds = (user.wellnessOpenedIds as string[]) ?? [];
  const articleIds = computeWellnessSet(articlePool.map((a) => a.id), storedArticleIds, openedIds, WELLNESS_ARTICLE_TARGET, false);
  const articlePoolById = new Map(articlePool.map((a) => [a.id, a]));
  const savedWellnessRows = await prisma.savedWellness.findMany({ where: { userId: user.id }, select: { itemId: true } });
  const savedIds = new Set(savedWellnessRows.map((r) => r.itemId));
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

      <div className="wellness-snapshot-card">
        <div className="wellness-snapshot-kicker">Health Snapshot</div>
        {hasProfile ? (
          <>
            <div className="wellness-snapshot-grid">
              {bmi != null && (
                <div className="wellness-snapshot-stat">
                  <div className="wellness-snapshot-stat-label">BMI</div>
                  <div className="wellness-snapshot-stat-value">{bmi.toFixed(1)}</div>
                  <div className="wellness-snapshot-stat-note">{bmiCategory(bmi)}</div>
                </div>
              )}
              {latestHrv && (
                <div className="wellness-snapshot-stat">
                  <div className="wellness-snapshot-stat-label">Last HRV</div>
                  <div className="wellness-snapshot-stat-value">{Math.round(latestHrv.value)}ms</div>
                  <div className="wellness-snapshot-stat-note">{hrvInterp ?? "Logged"}</div>
                </div>
              )}
              {profile?.wellnessGoal && (
                <div className="wellness-snapshot-stat">
                  <div className="wellness-snapshot-stat-label">Wellness Goal</div>
                  <div className="wellness-snapshot-stat-value" style={{ fontSize: 15 }}>
                    {profile.wellnessGoal}
                  </div>
                </div>
              )}
              <div className="wellness-snapshot-stat">
                <div className="wellness-snapshot-stat-label">Last Active</div>
                <div className="wellness-snapshot-stat-value" style={{ fontSize: 15 }}>
                  {lastActiveDate
                    ? lastActiveDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "Not yet"}
                </div>
              </div>
            </div>
            <Link href="/wellness/activity" className="wellness-snapshot-link">
              Update Profile →
            </Link>
          </>
        ) : (
          <>
            <p className="wellness-snapshot-empty">Set up your health profile to see your snapshot.</p>
            <Link href="/wellness/activity" className="wellness-snapshot-link">
              → Go to Activity Log
            </Link>
          </>
        )}
      </div>

      <div className="wellness-tip-of-day">
        <div className="wellness-snapshot-kicker">Today&rsquo;s Wellness Tip</div>
        <p className="wellness-tip-of-day-text">{dailyTip}</p>
      </div>

      <WellnessOverviewTabs
        explore={
          <div className="wellness-explore-grid">
            {EXPLORE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href} className={`wellness-explore-card wellness-explore-card--${card.accent}`}>
                  <span className="wellness-explore-icon">
                    <Icon size={22} />
                  </span>
                  <span className="wellness-explore-title">{card.title}</span>
                  <span className="wellness-explore-desc">{card.description}</span>
                  <ChevronRightIcon size={16} className="wellness-explore-arrow" />
                </Link>
              );
            })}
            <Link href="/wellness/agent" className="wellness-explore-card wellness-explore-card--gold wellness-explore-card--agent">
              <span className="wellness-explore-badge">Premium</span>
              <span className="wellness-explore-icon">
                <NetworkIcon size={26} />
              </span>
              <span className="wellness-explore-title" style={{ fontSize: 17 }}>
                Ask Limbic Agent
              </span>
              <span className="wellness-explore-desc">Evidence based wellness guidance, powered by current PT research.</span>
              <ChevronRightIcon size={16} className="wellness-explore-arrow" />
            </Link>
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
      <div className="card elev-sm" style={{ padding: "0 18px" }}>
        {previewArticles.map((w) => (
          <WellnessListItem key={w.id} w={w} saved={savedIds.has(w.id)} opened={openedIds.includes(w.id)} />
        ))}
      </div>
    </div>
  );
}
