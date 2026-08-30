import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { getCurrentUser, hasStudentAccess, hasLicenseAccess } from "@/lib/session";
import { prisma } from "@/lib/db";
import { GraduationCapIcon, ZapIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Boards",
};
import { BoardQuestionCard } from "@/components/BoardQuestionCard";
import { BoardsTabs } from "@/components/BoardsTabs";
import { DailyGamesSection } from "@/components/DailyGamesSection";
import { LimbicStudentGate } from "@/components/student/LimbicStudentGate";
import { todayDateKey, NPTE_THREE_QUESTION_BENCHMARK_SECONDS } from "@/lib/board-content";
import { getBoardsDailyContent, getBoardsProgress } from "@/lib/boards-progress";
import { dayIndexForDateKey, caseForDayIndex } from "@/lib/cases-static";
import { computeBestStreak, last7DateKeys } from "@/lib/games";
import type { SavedSharpeningProgress } from "@/components/DailySharpeningSession";

/** The header every branch of this page shares — title, optional streak badge and exam
 *  countdown, then the daily games. Extracted because the four access branches below
 *  (no access / clinician / student on the free tier / paid LimbicStudent) differ only in
 *  what they render *under* it, and each used to carry its own copy of this markup, which
 *  is how the clinician branch quietly ended up without the section's icon. */
function BoardsFrame({ title, badges, children }: { title: string; badges?: ReactNode; children: ReactNode }) {
  return (
    <div className="screen-pad boards-question-pad page-enter" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="boards-page-header">
        <div className="boards-page-title">
          <GraduationCapIcon size={22} style={{ color: "var(--color-accent)" }} />
          <h1>{title}</h1>
        </div>
        {badges}
      </div>
      <h2 style={{ fontSize: 19, margin: "16px 0 12px" }}>Daily Games</h2>
      <DailyGamesSection />
      {children}
    </div>
  );
}

/** Whole days from now until the reader's NPTE date, or null if they haven't set one (see
 *  User.npteExamDate, set from Profile → Credentials). Negative once the date has passed.
 *  Counted off UTC midnights on both ends so the number only changes at a day boundary,
 *  never mid-render. */
function daysUntil(examDate: Date | null): number | null {
  if (!examDate) return null;
  const startOfDay = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((startOfDay(examDate) - startOfDay(new Date())) / 86400000);
}

/** Limbic Boards — the hub and the daily practice combined onto one page (previously split
 *  across this page, which only linked out, and /boards/sharpening, which held the actual
 *  question/term/case; that old URL now redirects here, see app/(app)/boards/sharpening/
 *  page.tsx). The header (title, streak badge, NPTE countdown) renders here and stays fixed
 *  above four tab panels — Daily Sharpening, NPTE Breakdown, Research & Stats, Resources —
 *  all owned by components/BoardsTabs.tsx, so the header never remounts as the reader
 *  switches tabs. A licensed PT/clinician account only ever gets today's question — not the
 *  rest of Limbic Boards, which stays a student-only product, gated below on the paid
 *  LimbicStudent tier (see components/student/LimbicStudentGate.tsx) rather than just a
 *  .edu sign-in — same "purchasable inside Boards" line drawn in app/(app)/student/page.tsx's
 *  own comment. Every branch below also renders DailyGamesSection — the three
 *  clinical-knowledge daily games that used to live on /games — since those were never
 *  gated by tier and moved here unchanged in that respect; only the NPTE prep tools stay
 *  behind the tier gate. */
export default async function BoardsHubPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isStudent = hasStudentAccess(user);
  const isClinician = hasLicenseAccess(user);

  // Limbic Boards' own NPTE prep tools (Daily Sharpening, breakdown, etc.) are a student/
  // clinician product, gated below — but the daily games that moved here from /games (see
  // DailyGamesSection's own comment) were never gated by tier and stay that way, so a
  // visitor with neither access gets a real page instead of the redirect this branch used
  // to send everyone else here to /pro.
  if (!isStudent && !isClinician) {
    return (
      <BoardsFrame title="Limbic Boards">
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "20px 0 0" }}>
          Limbic Boards&rsquo; NPTE prep tools are available to PT students and licensed clinicians.
        </p>
      </BoardsFrame>
    );
  }

  const dateKey = todayDateKey();
  // Today's question and term are picked for this reader specifically — weighted toward the
  // NPTE's own domain mix and skipping what they've seen recently — rather than by a hash
  // of the date alone, which handed a 28-question bank back to the same student twice a
  // fortnight. See lib/boards-progress.ts and lib/board-content.ts pickDailyQuestion.
  const { question, term } = await getBoardsDailyContent(user.id, dateKey);
  const questionCompletion = await prisma.dailyCompletion.findUnique({
    where: { userId_kind_dateKey: { userId: user.id, kind: "boardQuestion", dateKey } },
  });

  if (!isStudent) {
    return (
      <BoardsFrame title="Question of the Day">
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "24px 0 16px" }}>
          A board-style question for clinicians to keep sharp on, the rest of Limbic Boards is a student product.
        </p>
        <BoardQuestionCard
          dateKey={dateKey}
          question={question}
          initialSelectedIndex={questionCompletion?.selectedIndex ?? null}
          initialElapsedSeconds={questionCompletion?.elapsedSeconds ?? null}
          nexusOptIn={user.nexusOptIn}
        />
      </BoardsFrame>
    );
  }

  if (user.studentTier !== "limbicStudent") {
    return (
      <BoardsFrame title="Limbic Boards">
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "24px 0 16px" }}>
          Your NPTE prep hub, a board-style question and a term to lock in every day, building toward exam day.
        </p>
        <LimbicStudentGate toolName="Limbic Boards" />
      </BoardsFrame>
    );
  }

  const dayCase = caseForDayIndex(dayIndexForDateKey(dateKey));

  const [termCompletion, caseCompletion, boardActivityRows, progress] = await Promise.all([
    prisma.dailyCompletion.findUnique({ where: { userId_kind_dateKey: { userId: user.id, kind: "boardTerm", dateKey } } }),
    prisma.dailyCompletion.findUnique({ where: { userId_kind_dateKey: { userId: user.id, kind: "caseOfDay", dateKey } } }),
    // Every day the reader finished at least one Daily Sharpening step (see
    // lib/board-activity.ts recordBoardActivity) — the same source user.boardsStreakDays
    // (the current streak, shown in the header badge above) is derived from, so the
    // Daily Sharpening tab's longest-streak and weekly-dots figures below never disagree
    // with it.
    prisma.boardActivity.findMany({ where: { userId: user.id }, select: { dateKey: true } }),
    // All-time per-domain accuracy and the missed-question review list — the data Boards
    // was collecting on every answer and then showing nowhere, while the Resources tab
    // told readers to "review any missed questions before starting the next day".
    getBoardsProgress(user.id),
  ]);

  const activityDateKeys = boardActivityRows.map((r) => r.dateKey);
  const longestStreak = computeBestStreak(activityDateKeys);
  const activitySet = new Set(activityDateKeys);
  const weekDays = last7DateKeys(dateKey)
    .slice()
    .reverse()
    .map((k) => ({ dateKey: k, completed: activitySet.has(k) }));

  // Each step is persisted as it's answered, so any subset of these three can exist for
  // today — that's a session someone walked away from, and what the sharpening component
  // resumes from rather than restarting (see SavedSharpeningProgress).
  const saved: SavedSharpeningProgress = {
    question: questionCompletion?.selectedIndex != null
      ? { selectedIndex: questionCompletion.selectedIndex, elapsedSeconds: questionCompletion.elapsedSeconds ?? 0 }
      : null,
    term: termCompletion ? { elapsedSeconds: termCompletion.elapsedSeconds ?? 0 } : null,
    dayCase: caseCompletion?.selectedIndex != null
      ? { selectedIndex: caseCompletion.selectedIndex, elapsedSeconds: caseCompletion.elapsedSeconds ?? 0 }
      : null,
  };

  const examDays = daysUntil(user.npteExamDate);

  return (
    <BoardsFrame
      title="Limbic Boards"
      badges={
        <div className="boards-header-badges">
          {examDays !== null && examDays >= 0 && (
            <div className="boards-header-countdown">
              <strong>{examDays}</strong> day{examDays === 1 ? "" : "s"} to your NPTE
            </div>
          )}
          <div className="boards-header-streak">
            <ZapIcon size={14} />
            {user.boardsStreakDays > 0 ? `${user.boardsStreakDays} day${user.boardsStreakDays === 1 ? "" : "s"} streak` : "No streak yet"}
          </div>
        </div>
      }
    >
      <div style={{ marginTop: 24 }}>
        {/* BoardsTabs reads ?tab= to deep-link straight into a panel, so it needs a
            Suspense boundary of its own — useSearchParams opts everything above it out of
            prerendering otherwise. */}
        <Suspense fallback={<div className="card skeleton-card" style={{ height: 280 }} />}>
          <BoardsTabs
            dateKey={dateKey}
            question={question}
            term={term}
            dayCase={dayCase}
            alreadyComplete={saved.question != null && saved.term != null && saved.dayCase != null}
            saved={saved}
            targetSeconds={user.boardsSharpeningTargetSeconds ?? NPTE_THREE_QUESTION_BENCHMARK_SECONDS}
            nexusOptIn={user.nexusOptIn}
            currentStreak={user.boardsStreakDays}
            longestStreak={longestStreak}
            weekDays={weekDays}
            progress={progress}
            examDays={examDays}
            hasExamDate={user.npteExamDate != null}
          />
        </Suspense>
      </div>
    </BoardsFrame>
  );
}
