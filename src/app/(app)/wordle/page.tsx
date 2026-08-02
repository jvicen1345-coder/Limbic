import { redirect } from "next/navigation";
import { getCurrentUser, isStudentEmail } from "@/lib/session";
import { prisma } from "@/lib/db";
import { todayDateKey } from "@/lib/wordle-words";
import { WordleGame, type WordleInitialState } from "@/components/WordleGame";

export default async function WordlePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Hard redirect rather than an inline upsell — same reasoning as /agent's isPro gate:
  // a non-student landing on a dead-end page under /wordle is worse than sending them
  // straight to the Pro page, where the Student PRO tiers explain what unlocks this.
  if (!isStudentEmail(user.email)) redirect("/pro");

  const dateKey = todayDateKey();
  const row = await prisma.dailyCompletion.findUnique({
    where: { userId_kind_dateKey: { userId: user.id, kind: "wordle", dateKey } },
  });
  const initial: WordleInitialState | null = row
    ? { guesses: (row.guesses as string[]) ?? [], status: (row.status as WordleInitialState["status"]) ?? "playing", elapsedSeconds: row.elapsedSeconds }
    : null;

  return <WordleGame dateKey={dateKey} initial={initial} nexusOptIn={user.nexusOptIn} />;
}
