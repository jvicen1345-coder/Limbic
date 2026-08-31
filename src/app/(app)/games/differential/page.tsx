import { getCurrentUser } from "@/lib/session";
import { getTodaysCase, getDateKey } from "@/lib/differential-cases";
import { getTodaysDifferentialResult, getDifferentialStats } from "@/app/actions/differential";
import { DifferentialGame } from "@/components/DifferentialGame";
import { getTimeZone } from "@/lib/user-time-zone";

export default async function DifferentialPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Only the case's clues/category/difficulty go to the client — never `condition` itself
  // (see app/actions/differential.ts's DifferentialResultView doc comment) — so an
  // unfinished day never has the answer sitting in the page's own server-rendered payload.
  const timeZone = await getTimeZone(user);
  const todaysCase = getTodaysCase(timeZone);
  const [initialResult, stats] = await Promise.all([getTodaysDifferentialResult(), getDifferentialStats()]);

  return (
    <DifferentialGame
      dateKey={getDateKey(timeZone)}
      category={todaysCase.category}
      difficulty={todaysCase.difficulty}
      clues={todaysCase.clues}
      initialResult={initialResult}
      stats={stats}
    />
  );
}
