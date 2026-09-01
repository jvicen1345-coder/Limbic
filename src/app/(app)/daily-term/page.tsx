import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { todayDateKey } from "@/lib/wordle-words";
import { WordleGame, type WordleInitialState } from "@/components/WordleGame";
import { getTimeZone } from "@/lib/user-time-zone";

export default async function WordlePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dateKey = todayDateKey(await getTimeZone(user));
  const row = await prisma.dailyCompletion.findUnique({
    where: { userId_kind_dateKey: { userId: user.id, kind: "wordle", dateKey } },
  });
  const initial: WordleInitialState | null = row
    ? { guesses: (row.guesses as string[]) ?? [], status: (row.status as WordleInitialState["status"]) ?? "playing", elapsedSeconds: row.elapsedSeconds }
    : null;

  return <WordleGame dateKey={dateKey} initial={initial} nexusOptIn={user.nexusOptIn} />;
}
