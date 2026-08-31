import { getCurrentUser } from "@/lib/session";
import { getTodaysRehabCase } from "@/lib/rehab-sequence-logic";
import { getTodaysRehabResult, getRehabStats } from "@/app/actions/rehab-sequence";
import { RehabSequenceGame } from "@/components/RehabSequenceGame";
import { getTimeZone } from "@/lib/user-time-zone";

/** Fisher-Yates — a fresh arrangement on every page load, per spec. This runs on the server
 *  so the order is decided once per request and handed to the client component as a prop:
 *  shuffling inside that client component instead meant SSR and hydration each rolled their
 *  own order, which is a hydration mismatch. This page is dynamic (it reads the session and
 *  today's result), so "once per request" is still once per page load. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function RehabSequencePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const todaysCase = getTodaysRehabCase(await getTimeZone(user));
  const [initialResult, stats] = await Promise.all([getTodaysRehabResult(), getRehabStats()]);

  return (
    <RehabSequenceGame
      title={todaysCase.title}
      category={todaysCase.category}
      difficulty={todaysCase.difficulty}
      context={todaysCase.context}
      interventions={todaysCase.interventions}
      initialSequence={shuffle(todaysCase.interventions)}
      rationale={todaysCase.rationale}
      initialResult={initialResult}
      stats={stats}
    />
  );
}
