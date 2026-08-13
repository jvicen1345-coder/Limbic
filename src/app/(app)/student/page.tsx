import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { prisma } from "@/lib/db";
import { firstName, timeOfDayGreeting } from "@/lib/meta";
import { questionForDate, todayDateKey } from "@/lib/board-content";
import { getAcceptedConnectionIds } from "@/lib/nexus";
import { last7DateKeys } from "@/lib/games";
import { AtriumProgressChart, type DomainAccuracy } from "@/components/AtriumProgressChart";
import {
  FileTextIcon,
  UsersIcon,
  PencilIcon,
  GraduationCapIcon,
  HeartIcon,
  ChevronRightIcon,
  LockIcon,
  NetworkIcon,
  CalendarIcon,
} from "@/components/icons";

const PATHS = [
  {
    title: "Break Down Slides",
    description: "Upload your lecture slides and get plain language summaries, key concepts, and practice questions.",
    href: "/student/slides",
    icon: FileTextIcon,
    accent: "amber",
  },
  {
    title: "Find a Study Buddy",
    description: "Connect anonymously with classmates who match your schedule and study style.",
    href: "/student/study",
    icon: UsersIcon,
    accent: "green",
  },
  {
    title: "Practice a SOAP Note",
    description: "Build SOAP notes with structured templates and get feedback on your clinical documentation.",
    href: "/student/soap",
    icon: PencilIcon,
    accent: "blue",
  },
  {
    title: "Review Boards Content",
    description: "Go to your daily sharpening — one question, one term, one case. Five minutes a day builds board readiness.",
    href: "/boards/sharpening",
    icon: GraduationCapIcon,
    accent: "purple",
  },
  {
    title: "Talk to Someone",
    description: "PT school is demanding. This is a safe, private space with mental wellness resources and support.",
    href: "/student/wellness",
    icon: HeartIcon,
    accent: "rose",
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

// Where a reader is in the term shapes the tone of the encouragement more than any single
// day's activity does — early weeks need a "you're building something" framing, later ones
// need a "the end is close" one. Same four-band shape the spec called for, kept as a plain
// function since it's pure text selection with no page-only state.
function weekEncouragement(week: number): string {
  if (week <= 4) return "The foundation is everything. You are building it.";
  if (week <= 8) return "You are finding your rhythm. Keep going.";
  if (week <= 12) return "You are past the halfway point. The hard part is behind you.";
  return "The finish line is closer than it feels.";
}

export default async function StudentAtriumPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Limbic Student is gated purely on a .edu email — not studentTier, which only affects
  // what's purchasable inside Boards, not who can reach the Atrium (see lib/session.ts).
  // A site admin gets through too (see hasStudentAccess).
  if (!hasStudentAccess(user)) redirect("/home");

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

  const [boardsToday, connectionIds, weekCompletions, boardActivityRows, nextCalendarEvent] = await Promise.all([
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

  // Next rotation date or exam, whichever comes first — professional dates and Limbic
  // Calendar events compete on equal footing here, sorted together by date.
  const upcomingCandidates: { label: string; date: Date }[] = [];
  if (user.npteExamDate && user.npteExamDate > now) upcomingCandidates.push({ label: "NPTE Exam", date: user.npteExamDate });
  if (user.rotationStartDate && user.rotationStartDate > now)
    upcomingCandidates.push({ label: "Rotation Start", date: user.rotationStartDate });
  if (user.rotationEndDate && user.rotationEndDate > now)
    upcomingCandidates.push({ label: "Rotation End", date: user.rotationEndDate });
  if (user.graduationDate && user.graduationDate > now) upcomingCandidates.push({ label: "Graduation", date: user.graduationDate });
  if (nextCalendarEvent) upcomingCandidates.push({ label: nextCalendarEvent.title, date: nextCalendarEvent.date });
  upcomingCandidates.sort((a, b) => a.date.getTime() - b.date.getTime());
  const upcoming = upcomingCandidates[0] ?? null;

  const limbicAgentEligible = user.isPro || user.studentTier === "limbicStudent";

  // Greeting card, line 2 — today's focus. Falls back to a general nudge when there isn't
  // enough of this week's Boards activity yet to point at a specific weak domain.
  const focusLine = weakestDomain
    ? `Today's focus: ${weakestDomain}. A little extra attention here goes a long way.`
    : "Every question you answer today moves you closer to exam-ready.";

  // Greeting card, line 3 — one actionable nudge, never a guilt trip about a missed day.
  const momentumLine = boardsToday
    ? "You are on track today. Keep the momentum."
    : "Your daily sharpening is waiting — 5 minutes keeps your streak alive.";

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
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
            Your NPTE date has passed — <Link href="/profile#professional-dates">update it in Profile Settings →</Link>
          </p>
        ) : (
          <p className="atrium-countdown-prompt">
            Add your NPTE date to unlock your countdown <Link href="/profile#professional-dates">→ Profile Settings</Link>
          </p>
        )}
      </div>

      <AtriumProgressChart
        daysCompletedThisWeek={daysCompletedThisWeek}
        currentStreak={user.boardsStreakDays}
        domains={domainAccuracy}
      />

      <div className="atrium-greeting-card">
        <p>{weekEncouragement(weekNumber)}</p>
        <p>{focusLine}</p>
        <p>{momentumLine}</p>
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

      <div className="atrium-section-label">Quick Links</div>
      <div className="atrium-dashboard-grid">
        <div className="atrium-dashboard-card">
          <div className="atrium-dashboard-title">
            <UsersIcon size={15} />
            Study Group
          </div>
          {connectionIds.length === 0 ? (
            <p className="atrium-dashboard-empty">
              Your cohort is here. Find a study partner who matches your schedule and study style.
            </p>
          ) : (
            <p className="atrium-dashboard-body">
              {connectionIds.length} study partner{connectionIds.length === 1 ? "" : "s"} connected
            </p>
          )}
          <Link href={connectionIds.length === 0 ? "/nexus/directory" : "/nexus/messages"} className="atrium-dashboard-link">
            {connectionIds.length === 0 ? "Find classmates →" : "View your group →"}
          </Link>
        </div>

        <div className="atrium-dashboard-card">
          <div className="atrium-dashboard-title">
            <NetworkIcon size={15} />
            Limbic Agent
          </div>
          {limbicAgentEligible ? (
            <>
              <p className="atrium-dashboard-body">Ask Limbic Agent about anything from your coursework or Boards prep.</p>
              <Link href="/agent" className="atrium-dashboard-link atrium-dashboard-link--amber">
                Open Limbic Agent →
              </Link>
            </>
          ) : (
            <>
              <p className="atrium-dashboard-body">Quick access to Limbic Agent is included with PRO or Boards+.</p>
              <span className="atrium-dashboard-locked">
                <LockIcon size={11} />
                <Link href="/pro" className="atrium-dashboard-link atrium-dashboard-link--amber" style={{ margin: 0 }}>
                  Upgrade →
                </Link>
              </span>
            </>
          )}
        </div>

        <div className="atrium-dashboard-card">
          <div className="atrium-dashboard-title">
            <CalendarIcon size={15} />
            Upcoming
          </div>
          {upcoming ? (
            <p className="atrium-dashboard-body">
              <strong>{upcoming.label}</strong>
              {" — "}
              {upcoming.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          ) : (
            <p className="atrium-dashboard-empty">
              Add your rotation dates and NPTE exam date to see your timeline here.
            </p>
          )}
          <Link href="/calendar" className="atrium-dashboard-link">
            Limbic Calendar →
          </Link>
        </div>
      </div>
    </div>
  );
}
