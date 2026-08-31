import { getCurrentUser } from "@/lib/session";
import { getTodaysPuzzle } from "@/lib/anatomy-connect-logic";
import { getTodaysAnatomyConnectResult, getAnatomyConnectStats } from "@/app/actions/anatomy-connect";
import { AnatomyConnectGame } from "@/components/AnatomyConnectGame";
import { getTimeZone } from "@/lib/user-time-zone";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function AnatomyConnectPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Only the four shuffled label lists go to the client — never puzzle.items itself,
  // which pairs each muscle with its real nerve/action/region (see AnatomyConnectGame's
  // doc comment and app/actions/anatomy-connect.ts, which alone knows the real pairing).
  const puzzle = getTodaysPuzzle(await getTimeZone(user));
  const [initialResult, stats] = await Promise.all([getTodaysAnatomyConnectResult(), getAnatomyConnectStats()]);

  return (
    <AnatomyConnectGame
      title={puzzle.title}
      muscles={shuffle(puzzle.items.map((i) => i.muscle))}
      nerves={shuffle(puzzle.items.map((i) => i.nerve))}
      actions={shuffle(puzzle.items.map((i) => i.action))}
      regions={shuffle(puzzle.items.map((i) => i.region))}
      initialResult={initialResult}
      stats={stats}
    />
  );
}
