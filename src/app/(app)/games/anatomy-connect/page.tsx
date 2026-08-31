import { getCurrentUser } from "@/lib/session";
import { getTodaysPuzzle, regionsAreUniform, buildMuscleQuestions, type AnatomyConnectField } from "@/lib/anatomy-connect-logic";
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
  // The mobile flow's multiple-choice options are built here for the same reason: assembling
  // them needs the answer key (each question has to *contain* its correct answer), so it
  // happens on the server and only the shuffled, unmarked option lists cross over.
  const puzzle = getTodaysPuzzle(await getTimeZone(user));
  const [initialResult, stats] = await Promise.all([getTodaysAnatomyConnectResult(), getAnatomyConnectStats()]);

  // Five of the thirty puzzles group their muscles *by* region, so every row shares one
  // region and the Region column is four identical cards that can't be got wrong. Those
  // days drop the Region step entirely rather than pad the puzzle with a free column.
  const showRegion = !regionsAreUniform(puzzle);
  const fields: AnatomyConnectField[] = showRegion ? ["nerve", "action", "region"] : ["nerve", "action"];

  return (
    <AnatomyConnectGame
      title={puzzle.title}
      muscles={shuffle(puzzle.items.map((i) => i.muscle))}
      nerves={shuffle(puzzle.items.map((i) => i.nerve))}
      actions={shuffle(puzzle.items.map((i) => i.action))}
      regions={shuffle(puzzle.items.map((i) => i.region))}
      showRegion={showRegion}
      uniformRegion={showRegion ? null : puzzle.items[0].region}
      muscleQuestions={shuffle(buildMuscleQuestions(puzzle, fields))}
      initialResult={initialResult}
      stats={stats}
    />
  );
}
