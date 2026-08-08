import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { todayDateKey, triviaQuestionsForDate } from "@/lib/trivia-static";
import { HealthTriviaGame } from "@/components/HealthTriviaGame";

export default async function HealthTriviaPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dateKey = todayDateKey();
  const questions = triviaQuestionsForDate(dateKey);

  const row = await prisma.dailyCompletion.findUnique({
    where: { userId_kind_dateKey: { userId: user.id, kind: "healthTrivia", dateKey } },
  });
  const initialAnswers = ((row?.guesses as string[] | null) ?? []).map(Number);

  return <HealthTriviaGame dateKey={dateKey} questions={questions} initialAnswers={initialAnswers} />;
}
