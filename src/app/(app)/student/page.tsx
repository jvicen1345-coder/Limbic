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
  ExternalLinkIcon,
} from "@/components/icons";

const PATHS = [
  {
    title: "Break Down Slides",
    description: "Upload lecture slides and get summaries",
    href: "/student/slides",
    icon: FileTextIcon,
  },
  {
    title: "Find a Study Buddy",
    description: "Connect with classmates anonymously",
    href: "/student/study",
    icon: UsersIcon,
  },
  {
    title: "Practice a SOAP Note",
    description: "Build and get feedback on SOAP notes",
    href: "/student/soap",
    icon: PencilIcon,
  },
  {
    title: "Review Boards Content",
    description: "Go to your daily sharpening",
    href: "/boards/sharpening",
    icon: GraduationCapIcon,
  },
  {
    title: "Talk to Someone",
    description: "Mental wellness resources",
    href: "/student/wellness",
    icon: HeartIcon,
  },
];

// Free, official FSBPT resources — linked out to, never copied/republished here (FSBPT's
// own site carries only a blanket "All Rights Reserved" notice, no reuse license), same
// "point to the real source" approach as an article's "Read the full story at [source]"
// link. URLs verified live before shipping — not guessed.
const FSBPT_RESOURCES = [
  {
    title: "NPTE Candidate Handbook",
    description: "Everything about registering for and taking the NPTE, straight from FSBPT.",
    href: "https://www.fsbpt.org/FreeResources/NPTECandidateHandbook.aspx",
  },
  {
    title: "Free NPTE Demo Exam",
    description: "Try real-format sample questions before your actual exam.",
    href: "https://www.fsbpt.org/Secondary-Pages/Exam-Candidates/National-Exam-NPTE/Prepare-for-Exam/NPTE-Demo-Exam",
  },
  {
    title: "State Licensure Requirements",
    description: "Compare licensing requirements across every state and jurisdiction.",
    href: "https://www.fsbpt.org/FreeResources/RegulatoryResources/LicensureReferenceGuide.aspx",
  },
  {
    title: "PT Licensure Compact",
    description: "See which states let you practice across state lines on one license.",
    href: "https://www.fsbpt.org/FreeResources/PhysicalTherapyLicensureCompact.aspx",
  },
];

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

export default async function StudentAtriumPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Limbic Student is gated purely on a .edu email — not studentTier, which only affects
  // what's purchasable inside Boards, not who can reach the Atrium (see lib/session.ts).
  // A site admin gets through too (see hasStudentAccess).
  if (!hasStudentAccess(user)) redirect("/");

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

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 880 }}>
      <div className="atrium-header">
        <h1 className="atrium-greeting">{greeting}</h1>
        <div className="atrium-header-meta">
          <span>
            Week {weekNumber} of Semester
          </span>
          <span className="atrium-header-dot">·</span>
          {npteDays !== null ? (
            <span>
              NPTE in {npteDays} day{npteDays === 1 ? "" : "s"}
            </span>
          ) : (
            <Link href="/profile">Set your NPTE date in Profile Settings</Link>
          )}
        </div>
      </div>

      <div className="atrium-paths-grid">
        {PATHS.map((path) => {
          const Icon = path.icon;
          return (
            <Link key={path.href} href={path.href} className="atrium-path-card">
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
          <p className="atrium-dashboard-body">
            {boardsToday ? "You've completed today's sharpening." : "You haven't done today's sharpening yet."}
            {" "}
            {user.boardsStreakDays > 0
              ? `${user.boardsStreakDays} day streak.`
              : "Start your streak today."}
          </p>
          <Link href="/boards/sharpening" className="atrium-dashboard-link">
            Go to Daily Sharpening →
          </Link>
        </div>

        <div className="atrium-dashboard-card">
          <div className="atrium-dashboard-title">
            <GraduationCapIcon size={15} />
            Boards Progress
          </div>
          {weekCompletions.length === 0 ? (
            <p className="atrium-dashboard-empty">Complete a few days of Daily Sharpening to see your weakest domain here.</p>
          ) : weakestDomain ? (
            <p className="atrium-dashboard-body">
              This week&rsquo;s focus area: <strong>{weakestDomain}</strong>
            </p>
          ) : (
            <p className="atrium-dashboard-body">Strong across all domains this week.</p>
          )}
          <Link href="/boards/sharpening" className="atrium-dashboard-link">
            Keep practicing →
          </Link>
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
            <p className="atrium-dashboard-empty">No upcoming dates yet — add one on your Limbic Calendar.</p>
          )}
          <Link href="/calendar" className="atrium-dashboard-link">
            View Limbic Calendar →
          </Link>
        </div>

        <div className="atrium-dashboard-card">
          <div className="atrium-dashboard-title">
            <UsersIcon size={15} />
            Study Group
          </div>
          {connectionIds.length === 0 ? (
            <p className="atrium-dashboard-empty">You haven&rsquo;t connected with any classmates yet.</p>
          ) : (
            <p className="atrium-dashboard-body">
              You have {connectionIds.length} study connection{connectionIds.length === 1 ? "" : "s"}.
            </p>
          )}
          <Link href={connectionIds.length === 0 ? "/nexus/directory" : "/nexus/messages"} className="atrium-dashboard-link">
            {connectionIds.length === 0 ? "Find classmates →" : "Message your group →"}
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
              <Link href="/agent" className="atrium-dashboard-link">
                Open Limbic Agent →
              </Link>
            </>
          ) : (
            <>
              <p className="atrium-dashboard-body">Quick access to Limbic Agent is included with PRO or Boards+.</p>
              <span className="atrium-dashboard-locked">
                <LockIcon size={11} />
                <Link href="/pro" className="atrium-dashboard-link" style={{ margin: 0 }}>
                  Upgrade →
                </Link>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="atrium-section-label">Licensure &amp; Exam Resources</div>
      <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: "-6px 0 12px" }}>
        Free, official resources from FSBPT — the national board that runs the NPTE and coordinates PT licensure.
      </p>
      <div className="atrium-dashboard-grid">
        {FSBPT_RESOURCES.map((resource) => (
          <div key={resource.href} className="atrium-dashboard-card">
            <div className="atrium-dashboard-title">{resource.title}</div>
            <p className="atrium-dashboard-body">{resource.description}</p>
            <a
              href={resource.href}
              target="_blank"
              rel="noopener noreferrer"
              className="atrium-dashboard-link"
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              fsbpt.org <ExternalLinkIcon size={11} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
