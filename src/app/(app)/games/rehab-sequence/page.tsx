import { getCurrentUser } from "@/lib/session";
import { getTodaysRehabCase } from "@/lib/rehab-sequence-logic";
import { getTodaysRehabResult, getRehabStats } from "@/app/actions/rehab-sequence";
import { RehabSequenceGame } from "@/components/RehabSequenceGame";
import { getTimeZone } from "@/lib/user-time-zone";

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
      rationale={todaysCase.rationale}
      initialResult={initialResult}
      stats={stats}
    />
  );
}
