import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Atrium",
};
import { firstName, timeOfDayGreeting } from "@/lib/meta";
import { npteDomainOf, todayDateKey } from "@/lib/board-content";
import { boardQuestionForCompletion } from "@/lib/boards-progress";
import { getAcceptedConnectionIds } from "@/lib/nexus";
import { last7DateKeys } from "@/lib/games";
import { AtriumProgressChart, type DomainAccuracy } from "@/components/AtriumProgressChart";
import { AtriumThisWeekCard } from "@/components/AtriumThisWeekCard";
import { AtriumCalendar } from "@/components/AtriumCalendar";
import { StudentGate } from "@/components/student/StudentGate";
import {
  FileTextIcon,
  UsersIcon,
  PencilIcon,
  GraduationCapIcon,
  HeartIcon,
  ChevronRightIcon,
  ZapIcon,
  NetworkIcon,
  ActivityIcon,
  ShieldIcon,
  ListIcon,
} from "@/components/icons";
import { getCurrentProgramPhase, getGenericProgramPhase, getProgramPhaseLabel, type ProgramPhase } from "@/lib/dpt-program";
import { getThisWeekAssignments, getMonthAssignments } from "@/app/actions/syllabus";
import { getWeekRecommendations, getThisWeekDateRange } from "@/lib/atrium-recommendations";
import { getUserProgram } from "@/app/actions/dpt-programs";

// A safe all-zero phase for a reader who's picked a real program (see getUserProgram) but
// hasn't set a start date yet — getGenericProgramPhase returns null in that case (it needs
// both dates to compute anything), and falling back to getCurrentProgramPhase's Chapman
// numbers here would misattribute the app's own hardcoded account's progress to a different
// real student. The header hides the progress bar/NPTE-adjacent countdown entirely for this
// phase (see the JSX below) rather than rendering these zeros directly.
const EMPTY_GENERIC_PHASE: ProgramPhase = {
  type: "didactic",
  trimester: null,
  year: 1,
  trimesterNumber: 0,
  weekInTrimester: 0,
  totalWeeksInTrimester: 0,
  daysUntilNextPhase: 0,
  nextPhase: null,
  daysUntilGraduation: 0,
  percentComplete: 0,
};

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

  // Phase-aware header (see lib/dpt-program.ts). Two paths: the app's own account (no
  // dptProgramId ever set — see getUserProgram) keeps reading the fixed Chapman University
  // trimester calendar exactly as before; any other reader who picked a real institution
  // from the national program directory (see app/actions/dpt-programs.ts) gets a generic
  // phase computed from their own start/graduation dates and that program's calendar type,
  // with no fixed per-term calendar to name a specific term or rotation from.
  const userProgram = await getUserProgram();
  const genericPhase = userProgram
    ? getGenericProgramPhase(
        user.dptProgramStart ? new Date(`${user.dptProgramStart}T00:00:00`) : null,
        user.dptGraduation ? new Date(`${user.dptGraduation}T00:00:00`) : null,
        userProgram.calendarType,
        now
      )
    : null;
  const phase = userProgram ? (genericPhase ?? EMPTY_GENERIC_PHASE) : getCurrentProgramPhase(now);
  const phaseLabel = userProgram
    ? (genericPhase ? getProgramPhaseLabel(genericPhase, userProgram.calendarType) : userProgram.institution)
    : getProgramPhaseLabel(phase);

  // Which of the three rotation blocks (see Profile's Program Timeline section) matches the
  // phase engine's current clinical trimester, if any — used by the rotation banner and the
  // break-transition card below to fill in the site details the calendar itself doesn't know.
  const activeRotationNumber = phase.type === "clinical" ? phase.trimester?.clinicalNumber : phase.nextPhase?.clinicalNumber;
  const rotationDetails =
    activeRotationNumber === 1
      ? { site: user.rotation1Site, city: user.rotation1City, setting: user.rotation1Setting }
      : activeRotationNumber === 2
        ? { site: user.rotation2Site, city: user.rotation2City, setting: user.rotation2Setting }
        : activeRotationNumber === 3
          ? { site: user.rotation3Site, city: user.rotation3City, setting: user.rotation3Setting }
          : null;

  const npteDays = user.npteExamDate
    ? Math.ceil((user.npteExamDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    : null;

  // Which resource grid the Atrium's card row shows (see .atrium-zone-cards below) — a
  // break between trimesters shows whichever grid matches what's coming next, since the
  // point of that grid is "what do you need right now," and during a break that's whatever
  // the next phase calls for.
  const cardGridType: "didactic" | "clinical" =
    phase.type === "clinical" || (phase.type === "break" && phase.nextPhase?.type === "clinical") ? "clinical" : "didactic";

  const todayKey = todayDateKey();
  const weekDateKeys = last7DateKeys(todayKey);

  // connectionIds and nextCalendarEvent are still fetched here, unchanged (Study Group and
  // Upcoming were Quick Links entries the dashboard redesign removed — see
  // atrium-supporting-row below — but nothing about the fetch itself changed, this just
  // stops binding results neither the redesigned page nor anything else here reads).
  const [, , weekCompletions, boardActivityRows, , thisWeekAssignments, syllabusCount, monthAssignments] = await Promise.all([
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
    // This Week card (see components/AtriumThisWeekCard.tsx, replacing the old Weekly
    // Roundup panel here) — every syllabus assignment due this calendar week, plus a plain
    // count of uploaded syllabi to tell "no assignments this week" apart from "never
    // uploaded a syllabus" (see that component's hasSyllabi prop).
    getThisWeekAssignments(),
    prisma.syllabus.count({ where: { userId: user.id } }),
    // Academic Calendar (see components/AtriumCalendar.tsx, positioned between the This Week
    // card and the resource card grid below) — every assignment due in the current calendar
    // month, complete or not; the calendar's own month navigation re-fetches via
    // app/api/assignments/route.ts rather than re-running this page.
    getMonthAssignments(user.id, now.getFullYear(), now.getMonth() + 1),
  ]);

  const daysCompletedThisWeek = new Set(boardActivityRows.map((r) => r.dateKey)).size;

  // Per-domain accuracy this week — every domain always present (0/0 for one never touched
  // yet) so the chart's legend has a constant shape rather than reflowing as domains get
  // answered.
  const domainStats = new Map<string, { correct: number; total: number }>();
  for (const domain of Object.keys(DOMAIN_COLORS)) domainStats.set(domain, { correct: 0, total: 0 });
  for (const c of weekCompletions) {
    if (c.selectedIndex == null) continue;
    // Which question a row was answering is read off the row itself now, not re-derived
    // from its date: the daily pick is per-reader (see lib/board-content.ts
    // pickDailyQuestion), so questionForDate() would name the wrong question for anyone
    // whose pick differed from the global rotation. boardQuestionForCompletion still falls
    // back to that rotation for rows written before the id was stored.
    const q = boardQuestionForCompletion(c);
    if (!q) continue;
    const domain = npteDomainOf(q);
    const stat = domainStats.get(domain) ?? { correct: 0, total: 0 };
    stat.total += 1;
    if (c.selectedIndex === q.correctIndex) stat.correct += 1;
    domainStats.set(domain, stat);
  }
  const domainAccuracy: DomainAccuracy[] = Object.keys(DOMAIN_COLORS).map((domain) => ({
    domain,
    correct: domainStats.get(domain)?.correct ?? 0,
    total: domainStats.get(domain)?.total ?? 0,
    color: DOMAIN_COLORS[domain],
  }));

  // This Week card data (see components/AtriumThisWeekCard.tsx) — the week label matches
  // getThisWeekAssignments' own Monday-Sunday window, and recommendations are keyed by the
  // same trimesterNumber the phase header above already reads. No NPTE countdown here —
  // that already renders once, in the header above (see .atrium-countdown below).
  const weekLabel = getThisWeekDateRange().label;
  const recommendations = getWeekRecommendations(phase.trimesterNumber);

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 1120 }}>
      <div className="atrium-header">
        <h1 className="atrium-greeting">{greeting}</h1>
        <p className="atrium-header-meta">{phaseLabel}</p>
        {userProgram && !genericPhase && (
          <p className="atrium-program-start-prompt">
            Add your start date to unlock your full program timeline →{" "}
            <Link href="/profile#program-timeline">Profile Settings</Link>
          </p>
        )}

        {(!userProgram || genericPhase) && (
          <div className="atrium-program-progress">
            <div className="atrium-program-progress-track">
              <div className="atrium-program-progress-fill" style={{ width: `${phase.percentComplete}%` }} />
            </div>
            <span className="atrium-program-progress-label">
              {phase.percentComplete}% complete · {phase.daysUntilGraduation} days to graduation
            </span>
          </div>
        )}

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

      {phase.type === "clinical" && phase.trimester && (
        <div className="atrium-rotation-banner">
          <div>
            <p className="atrium-rotation-banner-title">Clinical Rotation {phase.trimester.clinicalNumber}</p>
            {rotationDetails?.site ? (
              <>
                <p className="atrium-rotation-banner-site">
                  {rotationDetails.site}
                  {rotationDetails.city ? ` — ${rotationDetails.city}` : ""}
                </p>
                {rotationDetails.setting && <p className="atrium-rotation-banner-setting">{rotationDetails.setting}</p>}
              </>
            ) : (
              <Link href="/profile#program-timeline" className="atrium-rotation-banner-link">
                Add rotation details in Profile Settings →
              </Link>
            )}
          </div>
          <div className="atrium-rotation-banner-progress">
            <p className="atrium-rotation-banner-week">
              Week {phase.weekInTrimester} of {phase.totalWeeksInTrimester}
            </p>
            <p className="atrium-rotation-banner-remaining">{phase.daysUntilNextPhase} days remaining</p>
            <div className="atrium-rotation-banner-bar-track">
              <div
                className="atrium-rotation-banner-bar-fill"
                style={{ width: `${Math.min(100, Math.round((phase.weekInTrimester / phase.totalWeeksInTrimester) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="atrium-v2-grid">
        <div className="atrium-zone-streak">
          <AtriumProgressChart
            daysCompletedThisWeek={daysCompletedThisWeek}
            currentStreak={user.boardsStreakDays}
            domains={domainAccuracy}
          />
          <p className="atrium-motivation-line">Your daily sharpening is waiting — 5 minutes keeps your streak alive.</p>
        </div>

        <AtriumThisWeekCard
          weekLabel={weekLabel}
          assignments={thisWeekAssignments.map((a) => ({
            id: a.id,
            title: a.title,
            dueDate: a.dueDate,
            category: a.category,
            courseCode: a.courseCode,
            completed: a.completed,
          }))}
          hasSyllabi={syllabusCount > 0}
          recommendations={recommendations}
        />

        <div className="atrium-zone-cards">
          {phase.type === "break" && phase.nextPhase && (
            <div className="atrium-break-card">
              <p className="atrium-break-card-title">
                {phase.nextPhase.type === "clinical"
                  ? `Rotation ${phase.nextPhase.clinicalNumber} starts in ${phase.daysUntilNextPhase} days — ${rotationDetails?.site || "Site TBD"}`
                  : `${phase.nextPhase.name} starts in ${phase.daysUntilNextPhase} days`}
              </p>
              <p className="atrium-break-card-subtitle">
                Starts{" "}
                {new Date(`${phase.nextPhase.start}T00:00:00`).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )}

          <section style={{ marginTop: "24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700 }}>Academic Calendar</h2>
              <Link href="/student/syllabi" style={{ fontSize: "12px", color: "var(--color-neutral-700)", textDecoration: "none" }}>
                Manage syllabi →
              </Link>
            </div>

            {monthAssignments.length === 0 && syllabusCount === 0 ? (
              <div
                style={{
                  background: "var(--color-card-surface)",
                  border: "1px solid var(--color-divider)",
                  borderRadius: "10px",
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <p style={{ color: "var(--color-neutral-700)", fontSize: "14px", marginBottom: "12px" }}>
                  Upload your syllabi to see your academic calendar here.
                </p>
                <Link
                  href="/student/syllabi"
                  style={{
                    display: "inline-block",
                    padding: "8px 20px",
                    background: "var(--color-accent)",
                    color: "#fff",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Add Syllabus
                </Link>
              </div>
            ) : (
              <AtriumCalendar
                initialAssignments={monthAssignments.map((a) => ({
                  id: a.id,
                  title: a.title,
                  dueDate: a.dueDate,
                  category: a.category,
                  courseCode: a.courseCode,
                  completed: a.completed,
                }))}
                userId={user.id}
              />
            )}
          </section>

          {cardGridType === "didactic" ? (
            /* Boards, Clinical Reference, NPTE Resources, and Limbic Atlas are dropped from
               this grid — they're unconditionally in the sidebar's Limbic Student section for
               every reader who reaches this grid (see AppShell.tsx), so repeating them here was
               pure duplication. The 4 tools left are ones the sidebar doesn't surface at all. */
            <div className="atrium-resource-grid">
              <Link href="/student/specialties" className="atrium-resource-card">
                <span className="atrium-resource-icon"><GraduationCapIcon size={18} /></span>
                <p className="atrium-resource-title">Specialty Tracks</p>
                <p className="atrium-resource-desc">Key conditions, special tests, and clinical tools organized by practice area.</p>
              </Link>
              <Link href="/student/slides" className="atrium-resource-card">
                <span className="atrium-resource-icon"><FileTextIcon size={18} /></span>
                <p className="atrium-resource-title">Break Down Slides</p>
                <p className="atrium-resource-desc">Upload your lecture slides and get summaries and practice questions.</p>
              </Link>
              <Link href="/student/soap" className="atrium-resource-card">
                <span className="atrium-resource-icon"><PencilIcon size={18} /></span>
                <p className="atrium-resource-title">Practice a SOAP Note</p>
                <p className="atrium-resource-desc">Structured documentation templates with clinical feedback.</p>
              </Link>
              <Link href="/student/wellness" className="atrium-resource-card">
                <span className="atrium-resource-icon"><HeartIcon size={18} /></span>
                <p className="atrium-resource-title">Mental Wellness</p>
                <p className="atrium-resource-desc">Resources and support for the mental demands of the DPT journey.</p>
              </Link>
            </div>
          ) : (
            /* Rotation-focused grid — swapped in for a clinical trimester (or a break that
               leads into one), since the didactic grid's coursework tools (Break Down
               Slides, Boards) aren't what a reader on rotation needs day to day. /agent is
               the real route for Limbic Agent (there's no /pro/agent — see AppShell.tsx's
               own sidebar link). Force Lab, CE Tracker, etc. stay in this grid even though
               they're also in the sidebar's LimbicPRO section, since that section is
               isPro-gated and this grid isn't — dropping them would strand a non-Pro rotation
               reader with no way to reach them at all. Decision Rules and Red Flag Screening
               are combined into one card (matching the sidebar's own merge — see AppShell.tsx
               and components/pro/ScreeningDecisionTabs.tsx) since /pro/red-flags is just a
               redirect to /pro/decision-rules now, so two separate cards pointed at the same
               page. */
            <div className="atrium-resource-grid">
              <Link href="/agent" className="atrium-resource-card atrium-resource-card--primary">
                <span className="atrium-resource-icon"><NetworkIcon size={18} /></span>
                <p className="atrium-resource-title">Limbic Agent</p>
                <p className="atrium-resource-desc">Clinical decision support for your rotation. Ask anything — get evidence-based answers.</p>
              </Link>
              <Link href="/pro/calculators" className="atrium-resource-card">
                <span className="atrium-resource-icon"><ActivityIcon size={18} /></span>
                <p className="atrium-resource-title">Outcome Measures</p>
                <p className="atrium-resource-desc">Quick access to outcome measures, clinical scores, and assessment tools.</p>
              </Link>
              <Link href="/pro/decision-rules" className="atrium-resource-card">
                <span className="atrium-resource-icon"><ShieldIcon size={18} /></span>
                <p className="atrium-resource-title">Screening &amp; Decision Support</p>
                <p className="atrium-resource-desc">Ottawa rules, Canadian C-spine, Wells criteria, and red flag checklists by body region.</p>
              </Link>
              <Link href="/pro/special-tests" className="atrium-resource-card">
                <span className="atrium-resource-icon"><ListIcon size={18} /></span>
                <p className="atrium-resource-title">Special Tests Library</p>
                <p className="atrium-resource-desc">Sensitivity, specificity, and how-to for every special test you will use on rotation.</p>
              </Link>
              <Link href="/student/soap" className="atrium-resource-card">
                <span className="atrium-resource-icon"><PencilIcon size={18} /></span>
                <p className="atrium-resource-title">Practice a SOAP Note</p>
                <p className="atrium-resource-desc">Structured documentation practice with clinical feedback.</p>
              </Link>
              <Link href="/student/specialties" className="atrium-resource-card">
                <span className="atrium-resource-icon"><GraduationCapIcon size={18} /></span>
                <p className="atrium-resource-title">Specialty Tracks</p>
                <p className="atrium-resource-desc">Review key conditions and clinical tools for your rotation setting.</p>
              </Link>
              <Link href="/pro/force-lab" className="atrium-resource-card">
                <span className="atrium-resource-icon"><ZapIcon size={18} /></span>
                <p className="atrium-resource-title">Force Lab</p>
                <p className="atrium-resource-desc">Record and track dynamometer strength measurements from your rotation patients.</p>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
