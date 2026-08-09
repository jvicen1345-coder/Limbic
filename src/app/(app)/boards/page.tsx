import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess, hasLicenseAccess } from "@/lib/session";
import { prisma } from "@/lib/db";
import { GraduationCapIcon } from "@/components/icons";
import { BoardQuestionCard } from "@/components/BoardQuestionCard";
import { BoardTermCard } from "@/components/BoardTermCard";
import { CaseOfDayCard } from "@/components/CaseOfDayCard";
import { BoardsStreakCard } from "@/components/BoardsStreakCard";
import { questionForDate, termForDate, todayDateKey } from "@/lib/board-content";
import { dayIndexForDateKey, caseForDayIndex } from "@/lib/cases-static";

/** Limbic Boards — the hub and the daily practice combined onto one page (previously split
 *  across this page, which only linked out, and /boards/sharpening, which held the actual
 *  question/term/case; that old URL now redirects here, see app/(app)/boards/sharpening/
 *  page.tsx). A licensed PT/clinician account only ever gets today's question — not the
 *  rest of Limbic Boards, which stays a student-only product. */
export default async function BoardsHubPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isStudent = hasStudentAccess(user);
  const isClinician = hasLicenseAccess(user);
  if (!isStudent && !isClinician) redirect("/pro");

  const dateKey = todayDateKey();
  const question = questionForDate(dateKey);
  const questionCompletion = await prisma.dailyCompletion.findUnique({
    where: { userId_kind_dateKey: { userId: user.id, kind: "boardQuestion", dateKey } },
  });

  if (!isStudent) {
    return (
      <div className="screen-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
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

  const [termCompletion, caseCompletion] = await Promise.all([
    prisma.dailyCompletion.findUnique({ where: { userId_kind_dateKey: { userId: user.id, kind: "boardTerm", dateKey } } }),
    prisma.dailyCompletion.findUnique({ where: { userId_kind_dateKey: { userId: user.id, kind: "caseOfDay", dateKey } } }),
  ]);

  return (
    <div className="screen-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <GraduationCapIcon size={22} style={{ color: "var(--color-accent)" }} />
        <h1 style={{ fontSize: 24, margin: 0 }}>Limbic Boards</h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Your NPTE prep hub — a board-style question and a term to lock in every day, building toward exam day.
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
        <BoardsStreakCard streakDays={user.boardsStreakDays} />
      </div>
    </div>
  );
}
