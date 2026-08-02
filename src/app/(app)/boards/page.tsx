import { getCurrentUser } from "@/lib/session";
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

  const dateKey = todayDateKey();
  const question = questionForDate(dateKey);
  const term = termForDate(dateKey);

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - (CALENDAR_WINDOW_DAYS - 1));
  const activityRows = await prisma.boardActivity.findMany({
    where: { userId: user.id, createdAt: { gte: windowStart } },
    select: { createdAt: true },
  });
  const weeks = buildReadingCalendarWeeks(activityRows.map((r) => r.createdAt));

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
        <BoardQuestionCard dateKey={dateKey} question={question} />
        <BoardTermCard dateKey={dateKey} term={term} />
        <BoardsStreakCard streakDays={user.boardsStreakDays} weeks={weeks} />
      </div>
    </div>
  );
}
