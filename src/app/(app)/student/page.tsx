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
import { getCurrentProgramPhase, getProgramPhaseLabel } from "@/lib/dpt-program";

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

  // Phase-aware header (see lib/dpt-program.ts) — reads a fixed Chapman University
  // trimester calendar, not any per-user field, so this is the same for every LimbicStudent
  // reader for now (the Program Timeline section on Profile stores dptProgramStart/
  // dptGraduation for display, but getCurrentProgramPhase doesn't take them as input).
  const phase = getCurrentProgramPhase(now);
  const phaseLabel = getProgramPhaseLabel(phase);

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
        <p className="atrium-header-meta">{phaseLabel}</p>

        <div className="atrium-program-progress">
          <div className="atrium-program-progress-track">
            <div className="atrium-program-progress-fill" style={{ width: `${phase.percentComplete}%` }} />
          </div>
          <span className="atrium-program-progress-label">
            {phase.percentComplete}% complete · {phase.daysUntilGraduation} days to graduation
          </span>
        </div>

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

          <div className="atrium-npte-countdown">
            <p className="atrium-npte-countdown-label">NPTE Countdown</p>
            {npteDays !== null && npteDays >= 0 ? (
              <>
                <p className={`atrium-npte-countdown-number atrium-npte-countdown-number--${npteDays > 180 ? "green" : npteDays >= 60 ? "amber" : "red"}`}>
                  {npteDays}
                </p>
                <p className="atrium-npte-countdown-sub">days until boards</p>
              </>
            ) : (
              <Link href="/profile#program-timeline" className="atrium-npte-countdown-link">
                Set exam date →
              </Link>
            )}
          </div>
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

          {cardGridType === "didactic" ? (
            /* Every route here is a real, existing page — "Boards" links straight to /boards
               (not the old /boards/sharpening redirect the previous three-card row used,
               since that route's only job is forwarding here anyway) and "Clinical
               Reference"/"NPTE Resources" reuse the exact hrefs the sidebar's own Limbic
               Student section links to (see AppShell.tsx), so this grid and the sidebar
               never point at two different pages for the same label. */
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
          ) : (
            /* Rotation-focused grid — swapped in for a clinical trimester (or a break that
               leads into one), since the didactic grid's coursework tools (Break Down
               Slides, Boards) aren't what a reader on rotation needs day to day. /agent is
               the real route for Limbic Agent (there's no /pro/agent — see AppShell.tsx's
               own sidebar link), same "use what actually exists" correction as Boards/
               Clinical Reference/NPTE Resources above. */
            <div className="atrium-resource-grid">
              <Link href="/agent" className="atrium-resource-card atrium-resource-card--primary">
                <p className="atrium-resource-title">Limbic Agent</p>
                <p className="atrium-resource-desc">Clinical decision support for your rotation. Ask anything — get evidence-based answers.</p>
              </Link>
              <Link href="/pro/calculators" className="atrium-resource-card">
                <p className="atrium-resource-title">Clinical Calculators</p>
                <p className="atrium-resource-desc">Quick access to outcome measures, clinical scores, and assessment tools.</p>
              </Link>
              <Link href="/pro/decision-rules" className="atrium-resource-card">
                <p className="atrium-resource-title">Decision Rules</p>
                <p className="atrium-resource-desc">Ottawa rules, Canadian C-spine, Wells criteria, and more — at your fingertips.</p>
              </Link>
              <Link href="/pro/red-flags" className="atrium-resource-card">
                <p className="atrium-resource-title">Red Flag Screening</p>
                <p className="atrium-resource-desc">Systematic red flag checklists for every body region.</p>
              </Link>
              <Link href="/pro/special-tests" className="atrium-resource-card">
                <p className="atrium-resource-title">Special Tests Library</p>
                <p className="atrium-resource-desc">Sensitivity, specificity, and how-to for every special test you will use on rotation.</p>
              </Link>
              <Link href="/student/soap" className="atrium-resource-card">
                <p className="atrium-resource-title">Practice a SOAP Note</p>
                <p className="atrium-resource-desc">Structured documentation practice with clinical feedback.</p>
              </Link>
              <Link href="/student/specialties" className="atrium-resource-card">
                <p className="atrium-resource-title">Specialty Tracks</p>
                <p className="atrium-resource-desc">Review key conditions and clinical tools for your rotation setting.</p>
              </Link>
              <Link href="/pro/force-lab" className="atrium-resource-card">
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
