import { redirect } from "next/navigation";
import { getCurrentUser, isStudentEmail } from "@/lib/session";
import { prisma } from "@/lib/db";
import { GraduationCapIcon } from "@/components/icons";
import { BoardQuestionCard } from "@/components/BoardQuestionCard";
import { BoardTermCard } from "@/components/BoardTermCard";
import { BoardsStreakCard } from "@/components/BoardsStreakCard";
import { questionForDate, termForDate, todayDateKey } from "@/lib/board-content";
import { buildReadingCalendarWeeks } from "@/lib/reading-calendar";

const CALENDAR_WINDOW_DAYS = 365;

export default async function BoardsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Same hard-redirect pattern as /agent's isPro gate — Limbic Boards is a student-only
  // product, so a non-.edu account is sent to the Pro page rather than a dead-end here.
  if (!isStudentEmail(user.email)) redirect("/pro");

  const dateKey = todayDateKey();
  const question = questionForDate(dateKey);
  const term = termForDate(dateKey);

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - (CALENDAR_WINDOW_DAYS - 1));
  const [activityRows, completionRows] = await Promise.all([
    prisma.boardActivity.findMany({
      where: { userId: user.id, createdAt: { gte: windowStart } },
      select: { createdAt: true },
    }),
    prisma.dailyCompletion.findMany({
      where: { userId: user.id, dateKey, kind: { in: ["boardQuestion", "boardTerm"] } },
    }),
  ]);
  const weeks = buildReadingCalendarWeeks(activityRows.map((r) => r.createdAt));
  const questionCompletion = completionRows.find((r) => r.kind === "boardQuestion");
  const termCompletion = completionRows.find((r) => r.kind === "boardTerm");

  return (
    <div className="screen-pad" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <GraduationCapIcon size={22} style={{ color: "var(--color-accent)" }} />
        <h1 style={{ fontSize: 24, margin: 0 }}>Limbic Boards</h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Two minutes a day — a board-style question and a term to lock in before your NPTE.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <BoardQuestionCard
          dateKey={dateKey}
          question={question}
          initialSelectedIndex={questionCompletion?.selectedIndex ?? null}
          initialElapsedSeconds={questionCompletion?.elapsedSeconds ?? null}
          nexusOptIn={user.nexusOptIn}
        />
        <BoardTermCard
          dateKey={dateKey}
          term={term}
          initialRevealed={termCompletion != null}
          initialElapsedSeconds={termCompletion?.elapsedSeconds ?? null}
          nexusOptIn={user.nexusOptIn}
        />
        <BoardsStreakCard streakDays={user.boardsStreakDays} weeks={weeks} />
      </div>
    </div>
  );
}
