import { parseHepExercises } from "@/lib/hep-templates";

export interface ExerciseProgressionPoint {
  visitNumber: number;
  loggedAt: Date;
  weight: string;
  weightLbs: number | null;
  sets: string;
  reps: string;
}

export type ExerciseProgressionTrend = "up" | "down" | "flat" | "insufficient_data";

export interface ExerciseProgression {
  name: string;
  points: ExerciseProgressionPoint[];
  trend: ExerciseProgressionTrend;
}

/** Best-effort numeric read of a free-text weight field (e.g. "20 lbs", "2x8lb dumbbells",
 *  "bodyweight") — the leading number, if any. Weight stays free text in HepTemplateExercise
 *  (see that interface's own comment) since a hold- or band-based exercise has no plate
 *  number to enter, so a chart needs to tolerate rows with nothing parseable rather than
 *  requiring every entry to be strictly numeric. */
function parseWeightLbs(weight: string): number | null {
  const match = weight.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

/** Turns a patient's logged Session Exercises (see SessionExerciseSection.tsx,
 *  SessionExerciseLog in schema.prisma) into a per-exercise trend the clinician actually
 *  asked to see: "am I progressing this patient on the same exercise across visits, based on
 *  what I've been logging." Grouped by exercise name (case-insensitive, so "Wall slides" and
 *  "wall slides" merge), ascending by session date; an exercise logged only once has no
 *  progression to show and is left out entirely rather than rendered as a single point. */
export function computeExerciseProgression(logs: { visitNumber: number; loggedAt: Date; exercises: unknown }[]): ExerciseProgression[] {
  const sorted = [...logs].sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime());

  const pointsByKey = new Map<string, ExerciseProgressionPoint[]>();
  const displayNameByKey = new Map<string, string>();

  for (const log of sorted) {
    for (const ex of parseHepExercises(log.exercises)) {
      const name = ex.name.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      displayNameByKey.set(key, name);
      const points = pointsByKey.get(key) ?? [];
      points.push({
        visitNumber: log.visitNumber,
        loggedAt: log.loggedAt,
        weight: ex.weight,
        weightLbs: parseWeightLbs(ex.weight),
        sets: ex.sets,
        reps: ex.reps,
      });
      pointsByKey.set(key, points);
    }
  }

  const result: ExerciseProgression[] = [];
  for (const [key, points] of pointsByKey) {
    if (points.length < 2) continue;

    const numericPoints = points.filter((p) => p.weightLbs != null);
    let trend: ExerciseProgressionTrend = "insufficient_data";
    if (numericPoints.length >= 2) {
      const diff = numericPoints[numericPoints.length - 1].weightLbs! - numericPoints[0].weightLbs!;
      trend = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
    }

    result.push({ name: displayNameByKey.get(key) ?? key, points, trend });
  }

  // Most-logged exercise first — that's the one with the most data worth a clinician's
  // glance, not an arbitrary/alphabetical order.
  return result.sort((a, b) => b.points.length - a.points.length);
}
