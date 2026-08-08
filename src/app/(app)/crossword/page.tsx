import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { todayDateKey } from "@/lib/wordle-words";
import { puzzleForDate } from "@/lib/crossword-puzzles";
import { CrosswordGame, type CrosswordInitialState } from "@/components/CrosswordGame";

export default async function CrosswordPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dateKey = todayDateKey();
  const puzzle = puzzleForDate(dateKey);
  const row = await prisma.dailyCompletion.findUnique({
    where: { userId_kind_dateKey: { userId: user.id, kind: "crossword", dateKey } },
  });
  const initial: CrosswordInitialState = {
    cells: row ? ((row.crosswordCells as unknown as string[][]) ?? null) : null,
    status: (row?.status as CrosswordInitialState["status"]) ?? "playing",
    elapsedSeconds: row?.elapsedSeconds ?? null,
  };

  return <CrosswordGame dateKey={dateKey} puzzle={puzzle} initial={initial} />;
}
