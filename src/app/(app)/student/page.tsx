import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { prisma } from "@/lib/db";
import { firstName, timeOfDayGreeting } from "@/lib/meta";
import { questionForDate, todayDateKey } from "@/lib/board-content";
import { getAcceptedConnectionIds } from "@/lib/nexus";
import {
  FileTextIcon,
  UsersIcon,
  PencilIcon,
  GraduationCapIcon,
  HeartIcon,
  ChevronRightIcon,
  ZapIcon,
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

// Last 7 calendar days (UTC date keys, same unit board-content.ts rotates its daily
// question/term on) — used to look back over the week's Boards answers below.
function lastSevenDateKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

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
  const weekDateKeys = lastSevenDateKeys();

  const [boardsToday, connectionIds, weekCompletions, nextCalendarEvent] = await Promise.all([
    prisma.dailyCompletion.findFirst({
      where: { userId: user.id, dateKey: todayKey, kind: { in: ["boardQuestion", "boardTerm"] } },
    }),
    getAcceptedConnectionIds(user.id),
    prisma.dailyCompletion.findMany({
      where: { userId: user.id, kind: "boardQuestion", dateKey: { in: weekDateKeys } },
    }),
    prisma.userCalendarEvent.findFirst({
      where: { userId: user.id, date: { gte: now } },
      orderBy: { date: "asc" },
    }),
  ]);

  // Weakest NPTE domain this week — tallies wrong answers per domain from this week's
  // boardQuestion completions (each dateKey deterministically maps back to the question
  // that was shown that day via questionForDate, same as Daily Sharpening itself).
  const wrongByDomain = new Map<string, number>();
  for (const c of weekCompletions) {
    if (c.selectedIndex == null) continue;
    const q = questionForDate(c.dateKey);
    if (c.selectedIndex !== q.correctIndex) {
      wrongByDomain.set(q.domain, (wrongByDomain.get(q.domain) ?? 0) + 1);
    }
  }
  let weakestDomain: string | null = null;
  let weakestCount = 0;
  for (const [domain, count] of wrongByDomain) {
    if (count > weakestCount) {
      weakestDomain = domain;
      weakestCount = count;
    }
  }

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

      <div className="atrium-section-label">Your Progress</div>
      <div className="atrium-dashboard-grid">
        <div className="atrium-dashboard-card">
          <div className="atrium-dashboard-title">
            <ZapIcon size={15} />
            Daily Sharpening
          </div>
          {boardsToday ? (
            <p className="atrium-dashboard-body">
              Done for today. {user.boardsStreakDays} day{user.boardsStreakDays === 1 ? "" : "s"} streak and counting.
            </p>
          ) : (
            <p className="atrium-dashboard-body">Day 1 is always the hardest. Start your streak today.</p>
          )}
          <Link href="/boards/sharpening" className="atrium-dashboard-link">
            {boardsToday ? "View your progress →" : "Go to Daily Sharpening →"}
          </Link>
        </div>

        <div className="atrium-dashboard-card">
          <div className="atrium-dashboard-title">
            <GraduationCapIcon size={15} />
            Boards Progress
          </div>
          {weekCompletions.length === 0 ? (
            <p className="atrium-dashboard-empty">
              Your readiness builds one day at a time. Start your daily sharpening to see your domain strengths and
              weaknesses.
            </p>
          ) : weakestDomain ? (
            <p className="atrium-dashboard-body">
              Focus area this week — <strong>{weakestDomain}</strong>. Keep practicing to improve your readiness score.
            </p>
          ) : (
            <p className="atrium-dashboard-body">Strong across all domains this week. Keep up the great work.</p>
          )}
          <Link href={weekCompletions.length === 0 ? "/boards/sharpening" : "/boards"} className="atrium-dashboard-link">
            {weekCompletions.length === 0 ? "Start today →" : "View full progress →"}
          </Link>
        </div>

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

      <div className="atrium-resources" style={{ marginTop: 36 }}>
        <div className="atrium-resources-heading">Official NPTE Resources</div>
        <p className="atrium-resources-subtitle">
          Free official resources from FSBPT — the national board that runs the NPTE and coordinates PT licensure.
        </p>
        <Link href="/student/resources" className="atrium-dashboard-link" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          View NPTE resources <ChevronRightIcon size={13} />
        </Link>
      </div>
    </div>
  );
}
