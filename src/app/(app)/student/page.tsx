import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Atrium",
};
import { firstName, timeOfDayGreeting } from "@/lib/meta";
import { questionForDate, todayDateKey } from "@/lib/board-content";
import { getAcceptedConnectionIds } from "@/lib/nexus";
import { last7DateKeys } from "@/lib/games";
import { getArticles } from "@/lib/articles";
import { currentWeekKey, pickWeeklyRoundup } from "@/lib/student-roundup";
import { AtriumProgressChart, type DomainAccuracy } from "@/components/AtriumProgressChart";
import { StudentGate } from "@/components/student/StudentGate";
import { FileTextIcon, UsersIcon, PencilIcon, GraduationCapIcon, HeartIcon, ChevronRightIcon, LockIcon, ZapIcon } from "@/components/icons";

const PATHS = [
  {
    title: "Break Down Slides",
    description: "Summaries and practice questions from your slides.",
    href: "/student/slides",
    icon: FileTextIcon,
    accent: "amber",
  },
  {
    title: "Find a Study Buddy",
    description: "Connect with classmates who match your schedule.",
    href: "/student/study",
    icon: UsersIcon,
    accent: "green",
  },
  {
    title: "Practice a SOAP Note",
    description: "Structured templates with feedback on your notes.",
    href: "/student/soap",
    icon: PencilIcon,
    accent: "blue",
  },
  {
    title: "Review Boards Content",
    description: "One question, one term, one case a day.",
    href: "/boards/sharpening",
    icon: GraduationCapIcon,
    accent: "purple",
  },
  {
    title: "Talk to Someone",
    description: "A safe, private space for mental wellness support.",
    href: "/student/wellness",
    icon: HeartIcon,
    accent: "rose",
  },
  {
    title: "Clinical Sharpening",
    description: "Three daily games for reasoning and recall.",
    href: "/student/clinical-sharpening",
    icon: ZapIcon,
    accent: "blue",
  },
] as const;

// The 5 real NPTE domains board-content.ts's questions are tagged with (see its own
// `domain` field) — fixed order/colors so the progress chart's legend below never
// reshuffles as different domains get touched week to week. Same 5-color palette
// components/BoardsTabs.tsx's NPTE_SYSTEMS cards use, kept visually consistent between the
// two even though the domain labels here are the real per-question tags, not that other
// component's higher-level system names ("Nonsystem / Safety" here vs. "Non-Systems"
// there — different granularity, not a typo).
const DOMAIN_COLORS: Record<string, string> = {
  Musculoskeletal: "var(--color-accent)",
  Neuromuscular: "var(--color-vitals-mindfulness)",
  Cardiopulmonary: "var(--color-danger)",
  Integumentary: "var(--color-success)",
  "Nonsystem / Safety": "var(--color-warn)",
};

export default async function StudentAtriumPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Limbic Student is gated purely on a .edu email — not studentTier, which only affects
  // what's purchasable inside Boards, not who can reach the Atrium (see lib/session.ts).
  // A site admin gets through too (see hasStudentAccess). A non-qualifying account sees an
  // overview instead of the real personalized dashboard below — every card still links out
  // (the five sub-pages, plus /boards/sharpening) since each of those independently shows
  // the same gate rather than bouncing to /home, so nothing here is a dead click.
  if (!hasStudentAccess(user)) {
    return (
      <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
        <h1 className="atrium-greeting">Limbic Student</h1>
        <p className="atrium-header-meta" style={{ marginBottom: 16 }}>
          A daily study hub built for DPT students — Boards sharpening, slide breakdowns,
          SOAP note practice, a study-buddy match, and mental wellness support, all in one
          place.
        </p>

        <StudentGate toolName="The Atrium" />

        <div className="atrium-section-label" style={{ marginTop: 20 }}>
          What&rsquo;s inside
        </div>
        <div className="atrium-paths-grid">
          {PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <Link key={path.href} href={path.href} className={`atrium-path-card atrium-path-card--${path.accent}`}>
                <span className="atrium-path-icon">
                  <Icon size={20} />
                </span>
                <span className="atrium-path-body">
                  <span className="atrium-path-title" style={{ display: "block" }}>
                    {path.title}
                  </span>
                  <span className="atrium-path-desc">{path.description}</span>
                </span>
                <ChevronRightIcon size={18} className="atrium-path-arrow" />
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  const now = new Date();
  const greeting = `${timeOfDayGreeting(now.getHours())}, ${firstName(user.name)}`;

  // No per-user academic-calendar field exists yet — a fixed 6-week-in offset from "now" is
  // a placeholder that always reads as a plausible mid-term week, pending a real start-date
  // field (see prisma/schema.prisma User's studentTier-only date fields for what does exist).
  const placeholderTermStart = new Date(now);
  placeholderTermStart.setDate(placeholderTermStart.getDate() - 7 * 6);
  const weekNumber = Math.floor((now.getTime() - placeholderTermStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  const npteDays = user.npteExamDate
    ? Math.ceil((user.npteExamDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    : null;

  const todayKey = todayDateKey();
  const weekDateKeys = last7DateKeys(todayKey);

  // connectionIds and nextCalendarEvent are still fetched here, unchanged (Study Group and
  // Upcoming were Quick Links entries the dashboard redesign removed — see
  // atrium-supporting-row below — but nothing about the fetch itself changed, this just
  // stops binding results neither the redesigned page nor anything else here reads).
  const [boardsToday, , weekCompletions, boardActivityRows, , allArticles] = await Promise.all([
    prisma.dailyCompletion.findFirst({
      where: { userId: user.id, dateKey: todayKey, kind: { in: ["boardQuestion", "boardTerm"] } },
    }),
    getAcceptedConnectionIds(user.id),
    prisma.dailyCompletion.findMany({
      where: { userId: user.id, kind: "boardQuestion", dateKey: { in: weekDateKeys } },
    }),
    // Any Boards activity (question, term, or case — see lib/board-activity.ts) on each of
    // the last 7 days, for the progress chart's completion ring below. Broader than
    // weekCompletions above (boardQuestion answers only), matching what the streak itself
    // actually counts a day as "done" for.
    prisma.boardActivity.findMany({ where: { userId: user.id, dateKey: { in: weekDateKeys } }, select: { dateKey: true } }),
    prisma.userCalendarEvent.findFirst({
      where: { userId: user.id, date: { gte: now } },
      orderBy: { date: "asc" },
    }),
    // Fetched unconditionally, alongside everything else, so the Weekly Roundup panel's
    // preview (below) doesn't tack an extra sequential round trip onto page load — actually
    // used only for a paid LimbicStudent reader, same gate as the panel itself.
    getArticles(),
  ]);

  const daysCompletedThisWeek = new Set(boardActivityRows.map((r) => r.dateKey)).size;

  // Per-domain accuracy this week — every domain always present (0/0 for one never touched
  // yet) so the chart's legend has a constant shape rather than reflowing as domains get
  // answered. weakestDomain (most wrong answers, not lowest accuracy — same definition the
  // greeting card's focusLine below already used before this chart existed) still drives
  // that one line of copy, just computed from the same pass instead of a separate map.
  const domainStats = new Map<string, { correct: number; total: number }>();
  for (const domain of Object.keys(DOMAIN_COLORS)) domainStats.set(domain, { correct: 0, total: 0 });
  for (const c of weekCompletions) {
    if (c.selectedIndex == null) continue;
    const q = questionForDate(c.dateKey);
    const stat = domainStats.get(q.domain) ?? { correct: 0, total: 0 };
    stat.total += 1;
    if (c.selectedIndex === q.correctIndex) stat.correct += 1;
    domainStats.set(q.domain, stat);
  }
  let weakestDomain: string | null = null;
  let weakestWrongCount = 0;
  for (const [domain, stat] of domainStats) {
    const wrong = stat.total - stat.correct;
    if (wrong > weakestWrongCount) {
      weakestDomain = domain;
      weakestWrongCount = wrong;
    }
  }
  const domainAccuracy: DomainAccuracy[] = Object.keys(DOMAIN_COLORS).map((domain) => ({
    domain,
    correct: domainStats.get(domain)?.correct ?? 0,
    total: domainStats.get(domain)?.total ?? 0,
    color: DOMAIN_COLORS[domain],
  }));

  // A real preview of this week's roundup (see app/(app)/student/roundup/page.tsx, which
  // this mirrors) for the right-rail panel below — only computed for a paid LimbicStudent
  // reader, since anyone else just sees the upgrade prompt and never needs the actual
  // picks. No saved-state needed here (unlike the roundup page itself), so this skips
  // decorateArticle/SavedArticle entirely and just reads the plain Article fields.
  const roundupPreview =
    user.studentTier === "limbicStudent"
      ? pickWeeklyRoundup(
          allArticles.filter((a) => a.type !== "industry" && a.type !== "product"),
          currentWeekKey(),
          3
        )
      : [];

  // Greeting card, line 2 — today's focus. Falls back to a general nudge when there isn't
  // enough of this week's Boards activity yet to point at a specific weak domain.
  const focusLine = weakestDomain
    ? `Today's focus: ${weakestDomain}. A little extra attention here goes a long way.`
    : "Every question you answer today moves you closer to exam-ready.";

  // Greeting card, line 3 — one actionable nudge, never a guilt trip about a missed day.
  const momentumLine = boardsToday
    ? "You are on track today. Keep the momentum."
    : "Your daily sharpening is waiting, 5 minutes keeps your streak alive.";

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 1120 }}>
      <div className="atrium-header">
        <h1 className="atrium-greeting">{greeting}</h1>
        <p className="atrium-header-meta">Week {weekNumber} of your DPT journey</p>

        {npteDays !== null && npteDays >= 0 ? (
          <div className="atrium-countdown">
            <span className="atrium-countdown-number">{npteDays}</span>
            <span className="atrium-countdown-label">day{npteDays === 1 ? "" : "s"} until your NPTE</span>
          </div>
        ) : npteDays !== null ? (
          <p className="atrium-countdown-prompt">
            Your NPTE date has passed, <Link href="/profile/credentials#professional-dates">update it in Profile Settings →</Link>
          </p>
        ) : (
          <p className="atrium-countdown-prompt">
            Add your NPTE date to unlock your countdown <Link href="/profile/credentials#professional-dates">→ Profile Settings</Link>
          </p>
        )}
      </div>

      <div className="atrium-v2-grid">
        <div className="atrium-zone-streak">
          <AtriumProgressChart
            daysCompletedThisWeek={daysCompletedThisWeek}
            currentStreak={user.boardsStreakDays}
            domains={domainAccuracy}
          />
          <p className="atrium-motivation-line">
            {focusLine} {momentumLine}
          </p>
        </div>

        <aside className="atrium-roundup-panel atrium-zone-roundup">
          <div className="atrium-roundup-panel-header">
            <span className="atrium-roundup-panel-icon">
              <FileTextIcon size={16} />
            </span>
            <span className="atrium-roundup-panel-title">Weekly Roundup</span>
            <span className="atrium-roundup-panel-badge">This week</span>
          </div>

          {user.studentTier === "limbicStudent" ? (
            roundupPreview.length > 0 ? (
              <>
                <div className="atrium-roundup-items">
                  {roundupPreview.map((a) => (
                    <Link key={a.id} href={`/article/${a.id}`} className="atrium-roundup-item">
                      <p className="atrium-roundup-item-title">{a.title}</p>
                      <p className="atrium-roundup-item-meta">{a.source}</p>
                    </Link>
                  ))}
                </div>
                <Link href="/student/roundup" className="atrium-dashboard-link atrium-dashboard-link--amber atrium-roundup-panel-cta">
                  See all 5 for this week →
                </Link>
              </>
            ) : (
              <p className="atrium-dashboard-empty">Nothing to round up right now, check back soon.</p>
            )
          ) : (
            <>
              <p className="atrium-dashboard-body">
                Five real research, guideline, and CE items curated for coursework, refreshed every week — included with
                LimbicStudent.
              </p>
              <span className="atrium-dashboard-locked">
                <LockIcon size={11} />
                <Link href="/profile/membership" className="atrium-dashboard-link atrium-dashboard-link--amber" style={{ margin: 0 }}>
                  Upgrade →
                </Link>
              </span>
            </>
          )}
        </aside>

        <div className="atrium-zone-primary">
          {/* No "completed today" signal is fetched for /student/clinical-sharpening
              anywhere on this page (unlike boardsToday, which tracks Boards' separate
              daily Q&A/term flow) — this always renders the start state rather than
              guessing completion from an unrelated feature's data. */}
          <Link href="/student/clinical-sharpening" className="atrium-primary-card">
            <p className="atrium-primary-title">Daily Clinical Sharpening</p>
            <p className="atrium-primary-subtitle">
              One question. One term. One case. Five minutes keeps your streak alive.
            </p>
            <span className="btn btn-primary atrium-primary-cta">Start Today&rsquo;s Sharpening</span>
          </Link>
        </div>

        <div className="atrium-zone-cards">
          {/* Every route here is a real, existing page — "Boards" links straight to /boards
              (not the old /boards/sharpening redirect the previous three-card row used,
              since that route's only job is forwarding here anyway) and "Clinical
              Reference"/"NPTE Resources" reuse the exact hrefs the sidebar's own Limbic
              Student section links to (see AppShell.tsx), so this grid and the sidebar
              never point at two different pages for the same label. */}
          <div className="atrium-resource-grid">
            <Link href="/student/clinical-sharpening" className="atrium-resource-card atrium-resource-card--primary">
              <p className="atrium-resource-title">Daily Sharpening</p>
              <p className="atrium-resource-desc">One question, one term, one case. Five minutes keeps your streak alive.</p>
            </Link>
            <Link href="/boards" className="atrium-resource-card">
              <p className="atrium-resource-title">Boards</p>
              <p className="atrium-resource-desc">NPTE prep built into your daily routine. Questions, terms, and cases by system.</p>
            </Link>
            <Link href="/student/specialties" className="atrium-resource-card">
              <p className="atrium-resource-title">Specialty Tracks</p>
              <p className="atrium-resource-desc">Key conditions, special tests, and clinical tools organized by practice area.</p>
            </Link>
            <Link href="/student/slides" className="atrium-resource-card">
              <p className="atrium-resource-title">Break Down Slides</p>
              <p className="atrium-resource-desc">Upload your lecture slides and get summaries and practice questions.</p>
            </Link>
            <Link href="/student/soap" className="atrium-resource-card">
              <p className="atrium-resource-title">Practice a SOAP Note</p>
              <p className="atrium-resource-desc">Structured documentation templates with clinical feedback.</p>
            </Link>
            <Link href="/pro/lab-values" className="atrium-resource-card">
              <p className="atrium-resource-title">Clinical Reference</p>
              <p className="atrium-resource-desc">Lab values, medications, special tests, and clinical decision rules at your fingertips.</p>
            </Link>
            <Link href="/student/resources" className="atrium-resource-card">
              <p className="atrium-resource-title">NPTE Resources</p>
              <p className="atrium-resource-desc">Everything you need for boards — content breakdown, study schedule, and exam strategy.</p>
            </Link>
            <Link href="/student/wellness" className="atrium-resource-card">
              <p className="atrium-resource-title">Mental Wellness</p>
              <p className="atrium-resource-desc">Resources and support for the mental demands of the DPT journey.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
