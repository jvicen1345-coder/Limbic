import type { Metadata } from "next";
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
import { questionForDate, termForDate, todayDateKey, NPTE_THREE_QUESTION_BENCHMARK_SECONDS } from "@/lib/board-content";
import { dayIndexForDateKey, caseForDayIndex } from "@/lib/cases-static";
import { computeBestStreak, last7DateKeys } from "@/lib/games";

/** Limbic Boards — the hub and the daily practice combined onto one page (previously split
 *  across this page, which only linked out, and /boards/sharpening, which held the actual
 *  question/term/case; that old URL now redirects here, see app/(app)/boards/sharpening/
 *  page.tsx). The header (title + streak badge) renders here and stays fixed above three
 *  tab panels — Daily Sharpening, NPTE Breakdown, Resources — all owned by
 *  components/BoardsTabs.tsx, so the header never remounts as the reader switches tabs.
 *  The NPTE Exam Breakdown content (NPTE_SYSTEMS/NPTE_DEEP_DIVES) now lives inside that
 *  component, unchanged from when it rendered directly on this page. A licensed PT/
 *  clinician account only ever gets today's question — not the rest of Limbic Boards,
 *  which stays a student-only product, gated below on the paid LimbicStudent tier (see
 *  components/student/LimbicStudentGate.tsx) rather than just a .edu sign-in — same
 *  "purchasable inside Boards" line drawn in app/(app)/student/page.tsx's own comment.
 *  Every branch below also renders DailyGamesSection — the three clinical-knowledge daily
 *  games that used to live on /games — since those were never gated by tier and moved
 *  here unchanged in that respect; only the NPTE prep tools stay behind the tier gate. */
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
      <div className="screen-pad boards-question-pad page-enter" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <GraduationCapIcon size={22} style={{ color: "var(--color-accent)" }} />
          <h1 style={{ fontSize: 24, margin: 0 }}>Limbic Boards</h1>
        </div>
        <h2 style={{ fontSize: 19, margin: "16px 0 12px" }}>Daily Games</h2>
        <div className="boards-daily-games">
          <DailyGamesSection />
        </div>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "20px 0 0" }}>
          Limbic Boards&rsquo; NPTE prep tools are available to PT students and licensed clinicians.
        </p>
      </div>
    );
  }

  const dateKey = todayDateKey();
  const question = questionForDate(dateKey);
  const questionCompletion = await prisma.dailyCompletion.findUnique({
    where: { userId_kind_dateKey: { userId: user.id, kind: "boardQuestion", dateKey } },
  });

  if (!isStudent) {
    return (
      <div className="screen-pad boards-question-pad page-enter" style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Question of the Day</h1>
        <h2 style={{ fontSize: 19, margin: "16px 0 12px" }}>Daily Games</h2>
        <div className="boards-daily-games">
          <DailyGamesSection />
        </div>
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
      </div>
    );
  }

  if (user.studentTier !== "limbicStudent") {
    return (
      <div className="screen-pad boards-question-pad page-enter" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <GraduationCapIcon size={22} style={{ color: "var(--color-accent)" }} />
          <h1 style={{ fontSize: 24, margin: 0 }}>Limbic Boards</h1>
        </div>
        <h2 style={{ fontSize: 19, margin: "16px 0 12px" }}>Daily Games</h2>
        <div className="boards-daily-games">
          <DailyGamesSection />
        </div>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "24px 0 16px" }}>
          Your NPTE prep hub, a board-style question and a term to lock in every day, building toward exam day.
        </p>
        <LimbicStudentGate toolName="Limbic Boards" />
      </div>
    );
  }

  const term = termForDate(dateKey);
  const dayCase = caseForDayIndex(dayIndexForDateKey(dateKey));

  const [termCompletion, caseCompletion, boardActivityRows] = await Promise.all([
    prisma.dailyCompletion.findUnique({ where: { userId_kind_dateKey: { userId: user.id, kind: "boardTerm", dateKey } } }),
    prisma.dailyCompletion.findUnique({ where: { userId_kind_dateKey: { userId: user.id, kind: "caseOfDay", dateKey } } }),
    // Every day the reader finished at least one Daily Sharpening step (see
    // lib/board-activity.ts recordBoardActivity) — the same source user.boardsStreakDays
    // (the current streak, shown in the header badge above) is derived from, so the
    // Daily Sharpening tab's longest-streak and weekly-dots figures below never disagree
    // with it.
    prisma.boardActivity.findMany({ where: { userId: user.id }, select: { dateKey: true } }),
  ]);

  const activityDateKeys = boardActivityRows.map((r) => r.dateKey);
  const longestStreak = computeBestStreak(activityDateKeys);
  const activitySet = new Set(activityDateKeys);
  const weekDays = last7DateKeys(dateKey)
    .slice()
    .reverse()
    .map((k) => ({ dateKey: k, completed: activitySet.has(k) }));

  return (
    <div className="screen-pad boards-question-pad page-enter" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GraduationCapIcon size={22} style={{ color: "var(--color-accent)" }} />
          <h1 style={{ fontSize: 24, margin: 0 }}>Limbic Boards</h1>
        </div>
        <div className="boards-header-streak">
          <ZapIcon size={14} />
          {user.boardsStreakDays > 0 ? `${user.boardsStreakDays} day${user.boardsStreakDays === 1 ? "" : "s"} streak` : "No streak yet"}
        </div>
      </div>
      <h2 style={{ fontSize: 19, margin: "16px 0 12px" }}>Daily Games</h2>
      <div className="boards-daily-games">
        <DailyGamesSection />
      </div>

      <div style={{ marginTop: 24 }}>
        <BoardsTabs
          dateKey={dateKey}
          question={question}
          term={term}
          dayCase={dayCase}
          alreadyComplete={questionCompletion?.selectedIndex != null && termCompletion != null && caseCompletion?.selectedIndex != null}
          targetSeconds={user.boardsSharpeningTargetSeconds ?? NPTE_THREE_QUESTION_BENCHMARK_SECONDS}
          nexusOptIn={user.nexusOptIn}
          currentStreak={user.boardsStreakDays}
          longestStreak={longestStreak}
          weekDays={weekDays}
        />
      </div>
    </div>
  );
}
