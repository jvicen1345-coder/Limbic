import { redirect } from "next/navigation";
import { getCurrentUser, isStudentEmail } from "@/lib/session";
import { prisma } from "@/lib/db";
import { GraduationCapIcon } from "@/components/icons";
import { BoardQuestionCard } from "@/components/BoardQuestionCard";
import { BoardTermCard } from "@/components/BoardTermCard";
import { CaseOfDayCard } from "@/components/CaseOfDayCard";
import { BoardsStreakCard } from "@/components/BoardsStreakCard";
import { questionForDate, termForDate, todayDateKey } from "@/lib/board-content";
import { dayIndexForDateKey, caseForDayIndex } from "@/lib/cases-static";
import { buildReadingCalendarWeeks } from "@/lib/reading-calendar";

const CALENDAR_WINDOW_DAYS = 365;

export default async function SharpeningPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isStudent = isStudentEmail(user.email);
  // A licensed PT/clinician account (see lib/session.ts signInWithLicense) gets access to
  // just today's question — not the rest of Limbic Boards, which stays a student-only
  // product (see the conditional render below). Anyone who's neither is sent to the Pro
  // page rather than a dead-end here, same hard-redirect pattern as /agent's isPro gate.
  const isClinician = user.licenseNumber != null;
  if (!isStudent && !isClinician) redirect("/pro");

  const dateKey = todayDateKey();
  const question = questionForDate(dateKey);

  const questionCompletion = await prisma.dailyCompletion.findUnique({
    where: { userId_kind_dateKey: { userId: user.id, kind: "boardQuestion", dateKey } },
  });

  if (!isStudent) {
    return (
      <div className="screen-pad" style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Question of the Day</h1>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
          A board-style question for clinicians to keep sharp on — the rest of Limbic Boards is a student product.
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

  const term = termForDate(dateKey);
  const dayCase = caseForDayIndex(dayIndexForDateKey(dateKey));

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - (CALENDAR_WINDOW_DAYS - 1));
  const [activityRows, termCompletion, caseCompletion] = await Promise.all([
    prisma.boardActivity.findMany({
      where: { userId: user.id, createdAt: { gte: windowStart } },
      select: { createdAt: true },
    }),
    prisma.dailyCompletion.findUnique({
      where: { userId_kind_dateKey: { userId: user.id, kind: "boardTerm", dateKey } },
    }),
    prisma.dailyCompletion.findUnique({
      where: { userId_kind_dateKey: { userId: user.id, kind: "caseOfDay", dateKey } },
    }),
  ]);
  const weeks = buildReadingCalendarWeeks(activityRows.map((r) => r.createdAt));

  return (
    <div className="screen-pad" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <GraduationCapIcon size={22} style={{ color: "var(--color-accent)" }} />
        <h1 style={{ fontSize: 24, margin: 0 }}>Daily Sharpening</h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        A few minutes a day — a board-style question, a term, and a case to lock in before your NPTE.
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
        <CaseOfDayCard
          dateKey={dateKey}
          dayCase={dayCase}
          initial={{
            selectedIndex: caseCompletion?.selectedIndex ?? null,
            elapsedSeconds: caseCompletion?.elapsedSeconds ?? null,
          }}
          nexusOptIn={user.nexusOptIn}
        />
        <BoardsStreakCard streakDays={user.boardsStreakDays} weeks={weeks} />
      </div>
    </div>
  );
}
