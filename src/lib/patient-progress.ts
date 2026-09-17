import { parseHepExercises } from "@/lib/hep-templates";
import type { IntakeAnswers } from "@/lib/intake";
import { OUTCOME_MEASURES } from "@/lib/outcome-measures";
import { plainLSIColor, plainLSILabel, plainMuscleGroupName } from "@/lib/force-lab-plain-language";
import { LIFTS } from "@/lib/three-rep-max-standards";

/** Shape of `mcidValues` from outcome-benchmarks.ts — passed in from the server page so
 *  this module stays free of `server-only` and can be unit-tested with node:test. */
export type MeasureBenchmarkTable = Record<
  string,
  Record<string, { mcid: number; higherIsBetter: boolean }>
>;

export type ChangeKind = "improved" | "declined" | "unchanged";

export interface OutcomePoint {
  score: number;
  maxScore: number;
  recordedAt: Date;
}

export interface OutcomeProgress {
  measureName: string;
  displayName: string;
  first: OutcomePoint;
  latest: OutcomePoint;
  points: OutcomePoint[];
  higherIsBetter: boolean | null;
  mcid: number | null;
  kind: ChangeKind | null;
  meaningful: boolean;
  plainLabel: string;
}

export interface PlanOfCareProgress {
  visitCount: number;
  totalVisits: number;
  percent: number;
  startDate: Date;
  lastSeen: Date | null;
  nextVisit: Date | null;
  visitLogCount: number;
}

export interface StrengthSymmetryRow {
  muscleGroup: string;
  displayName: string;
  leftPeak: number | null;
  rightPeak: number | null;
  unit: string;
  lsi: number | null;
  lsiLabel: string | null;
  lsiColor: string | null;
  sessionDate: Date;
}

export interface StrengthChangeRow {
  muscleGroup: string;
  displayName: string;
  unit: string;
  leftFirst: number | null;
  leftLatest: number | null;
  rightFirst: number | null;
  rightLatest: number | null;
  firstDate: Date;
  latestDate: Date;
  plainLabel: string;
}

export interface LiftProgress {
  lift: string;
  displayName: string;
  first: { weightLbs: number; testedAt: Date };
  latest: { weightLbs: number; testedAt: Date };
  kind: ChangeKind;
  plainLabel: string;
}

export interface ExerciseProgressRow {
  name: string;
  first: { sets: string; reps: string; weight: string; visitNumber: number };
  latest: { sets: string; reps: string; weight: string; visitNumber: number };
  plainLabel: string;
}

export interface GoalItem {
  goalText: string;
  category: string;
  timeframe: string;
  status: string;
}

export interface GoalProgress {
  achieved: GoalItem[];
  inProgress: GoalItem[];
}

export interface ClientGoal {
  goalShort: string;
  goalLong: string;
}

export interface PatientProgress {
  clientGoal: ClientGoal | null;
  outcomes: OutcomeProgress[];
  planOfCare: PlanOfCareProgress | null;
  strengthSymmetry: StrengthSymmetryRow[];
  strengthChange: StrengthChangeRow[];
  lifts: LiftProgress[];
  exercises: ExerciseProgressRow[];
  goals: GoalProgress | null;
}

export interface ForceLabSessionInput {
  muscleGroup: string;
  leftPeak: number | null;
  rightPeak: number | null;
  lsi: number | null;
  unit: string;
  sessionDate: Date;
}

export interface PatientProgressInput {
  condition?: string;
  visitCount: number;
  totalVisits: number;
  startDate: Date;
  lastSeen: Date | null;
  nextVisit: Date | null;
  outcomes: { measureName: string; score: number; maxScore: number; recordedAt: Date }[];
  forceLabSessions: ForceLabSessionInput[];
  threeRepMaxTests: { lift: string; weightLbs: number; testedAt: Date }[];
  sessionExerciseLogs: { visitNumber: number; loggedAt: Date; exercises: unknown }[];
  goals: GoalItem[];
  visitLogs: { loggedAt: Date }[];
  intakeAnswers: unknown | null;
}

/** Calculator results sometimes store a longer display name than the dashboard's short
 *  OUTCOME_MEASURES / mcidValues key (same aliases OutcomeMeasuresSection.tsx already uses). */
const MEASURE_ALIASES: Record<string, string> = {
  "Berg Balance Scale": "Berg",
  "Timed Up and Go": "TUG",
  "Oswestry Disability Index": "Oswestry",
  ODI: "Oswestry",
  BBS: "Berg",
};

function benchmarkKey(measureName: string): string {
  return MEASURE_ALIASES[measureName] ?? measureName;
}

export function lookupMeasureBenchmark(
  table: MeasureBenchmarkTable,
  measureName: string,
  condition = "default",
): { mcid: number; higherIsBetter: boolean } | null {
  const key = benchmarkKey(measureName);
  const entry = table[key] ?? table[measureName];
  if (!entry) return null;
  return entry[condition] ?? entry.default ?? null;
}

export function measureDisplayName(measureName: string): string {
  const key = benchmarkKey(measureName);
  const found = OUTCOME_MEASURES.find(
    (m) =>
      m.abbreviation.toLowerCase() === key.toLowerCase() ||
      m.abbreviation.toLowerCase() === measureName.toLowerCase() ||
      m.name.toLowerCase() === measureName.toLowerCase() ||
      m.id.toLowerCase() === measureName.toLowerCase(),
  );
  return found?.name ?? measureName;
}

export function formatBriefDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
}

export function formatScore(score: number, maxScore: number): string {
  const s = formatNumber(score);
  const m = formatNumber(maxScore);
  return `${s}/${m}`;
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 10) / 10);
}

function formatSigned(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  const body = Number.isInteger(rounded) ? String(rounded) : String(rounded);
  return rounded > 0 ? `+${body}` : body;
}

/** Direction + MCID gate used by the outcome panel. `meaningful` is true only when the
 *  score moved the right way *and* the absolute improvement meets that measure's MCID.
 *  Unknown direction (no benchmark) never claims improvement or meaning. */
export function describeOutcomeChange(
  firstScore: number,
  latestScore: number,
  opts: { higherIsBetter: boolean | null; mcid: number | null },
): { kind: ChangeKind | null; meaningful: boolean } {
  const raw = latestScore - firstScore;
  if (raw === 0) return { kind: "unchanged", meaningful: false };
  // No published direction for this measure — numbers only, never "improved".
  if (opts.higherIsBetter == null) return { kind: null, meaningful: false };
  const improvement = opts.higherIsBetter ? raw : -raw;
  if (improvement > 0) {
    const meaningful = opts.mcid != null && improvement >= opts.mcid;
    return { kind: "improved", meaningful };
  }
  return { kind: "declined", meaningful: false };
}

function outcomePlainLabel(
  first: OutcomePoint,
  latest: OutcomePoint,
  kind: ChangeKind | null,
  meaningful: boolean,
  hasBenchmark: boolean,
): string {
  const firstBit = `${formatScore(first.score, first.maxScore)} on ${formatBriefDate(first.recordedAt)}`;
  if (kind == null) return `${firstBit} — first recorded score`;
  const latestBit = `${formatScore(latest.score, latest.maxScore)} on ${formatBriefDate(latest.recordedAt)}`;
  const pair = `${firstBit}, ${latestBit}`;
  if (!hasBenchmark) return pair;
  if (kind === "unchanged") return `${pair} — no change yet`;
  if (kind === "declined") return `${pair} — this score has declined`;
  if (meaningful) return `${pair} — a meaningful improvement`;
  return `${pair} — an improvement, but not yet a meaningful change`;
}

function compareOutcomes(
  outcomes: PatientProgressInput["outcomes"],
  table: MeasureBenchmarkTable,
  condition: string,
): OutcomeProgress[] {
  const byMeasure = new Map<string, OutcomePoint[]>();
  const displayNameByKey = new Map<string, string>();
  for (const row of [...outcomes].sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())) {
    const key = row.measureName.trim();
    if (!key) continue;
    displayNameByKey.set(key, row.measureName);
    const points = byMeasure.get(key) ?? [];
    points.push({ score: row.score, maxScore: row.maxScore, recordedAt: row.recordedAt });
    byMeasure.set(key, points);
  }

  const result: OutcomeProgress[] = [];
  for (const [measureName, points] of byMeasure) {
    const first = points[0];
    const latest = points[points.length - 1];
    const benchmark = lookupMeasureBenchmark(table, measureName, condition);
    const higherIsBetter = benchmark?.higherIsBetter ?? null;
    const mcid = benchmark?.mcid ?? null;
    const compared = points.length >= 2 ? describeOutcomeChange(first.score, latest.score, { higherIsBetter, mcid }) : null;
    result.push({
      measureName,
      displayName: measureDisplayName(displayNameByKey.get(measureName) ?? measureName),
      first,
      latest,
      points,
      higherIsBetter,
      mcid,
      kind: compared?.kind ?? null,
      meaningful: compared?.meaningful ?? false,
      plainLabel: outcomePlainLabel(first, latest, compared?.kind ?? null, compared?.meaningful ?? false, benchmark != null),
    });
  }
  return result;
}

function planOfCare(input: PatientProgressInput): PlanOfCareProgress | null {
  if (input.totalVisits <= 0 && input.visitCount <= 0) return null;
  const percent =
    input.totalVisits > 0 ? Math.max(0, Math.min(100, (input.visitCount / input.totalVisits) * 100)) : 0;
  return {
    visitCount: input.visitCount,
    totalVisits: input.totalVisits,
    percent,
    startDate: input.startDate,
    lastSeen: input.lastSeen,
    nextVisit: input.nextVisit,
    visitLogCount: input.visitLogs.length,
  };
}

function strengthSymmetry(sessions: ForceLabSessionInput[]): StrengthSymmetryRow[] {
  const latestByMuscle = new Map<string, ForceLabSessionInput>();
  const sorted = [...sessions].sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime());
  for (const session of sorted) latestByMuscle.set(session.muscleGroup, session);
  return Array.from(latestByMuscle.values()).map((s) => ({
    muscleGroup: s.muscleGroup,
    displayName: plainMuscleGroupName(s.muscleGroup),
    leftPeak: s.leftPeak,
    rightPeak: s.rightPeak,
    unit: s.unit,
    lsi: s.lsi,
    lsiLabel: s.lsi != null ? plainLSILabel(s.lsi) : null,
    lsiColor: s.lsi != null ? plainLSIColor(s.lsi) : null,
    sessionDate: s.sessionDate,
  }));
}

function sideChangePhrase(side: "Left" | "Right", first: number | null, latest: number | null, unit: string): string | null {
  if (first == null || latest == null) return null;
  const delta = latest - first;
  if (delta === 0) return `${side} unchanged at ${formatNumber(latest)} ${unit}`;
  const direction = delta > 0 ? "stronger" : "less strong";
  return `${side} ${formatNumber(first)} → ${formatNumber(latest)} ${unit} (${formatSigned(delta)}, ${direction})`;
}

function strengthChange(sessions: ForceLabSessionInput[]): StrengthChangeRow[] {
  const byMuscle = new Map<string, ForceLabSessionInput[]>();
  const sorted = [...sessions].sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime());
  for (const session of sorted) {
    const rows = byMuscle.get(session.muscleGroup) ?? [];
    rows.push(session);
    byMuscle.set(session.muscleGroup, rows);
  }
  const result: StrengthChangeRow[] = [];
  for (const [muscleGroup, rows] of byMuscle) {
    if (rows.length < 2) continue;
    const first = rows[0];
    const latest = rows[rows.length - 1];
    const phrases = [
      sideChangePhrase("Left", first.leftPeak, latest.leftPeak, latest.unit),
      sideChangePhrase("Right", first.rightPeak, latest.rightPeak, latest.unit),
    ].filter((p): p is string => p != null);
    if (phrases.length === 0) continue;
    result.push({
      muscleGroup,
      displayName: plainMuscleGroupName(muscleGroup),
      unit: latest.unit,
      leftFirst: first.leftPeak,
      leftLatest: latest.leftPeak,
      rightFirst: first.rightPeak,
      rightLatest: latest.rightPeak,
      firstDate: first.sessionDate,
      latestDate: latest.sessionDate,
      plainLabel: `${phrases.join(". ")}. ${formatBriefDate(first.sessionDate)} to ${formatBriefDate(latest.sessionDate)}.`,
    });
  }
  return result;
}

function liftDisplayName(lift: string): string {
  return LIFTS.find((l) => l.value === lift)?.label ?? lift;
}

function compareLifts(tests: PatientProgressInput["threeRepMaxTests"]): LiftProgress[] {
  const byLift = new Map<string, { weightLbs: number; testedAt: Date }[]>();
  const sorted = [...tests].sort((a, b) => a.testedAt.getTime() - b.testedAt.getTime());
  for (const test of sorted) {
    const rows = byLift.get(test.lift) ?? [];
    rows.push({ weightLbs: test.weightLbs, testedAt: test.testedAt });
    byLift.set(test.lift, rows);
  }
  const result: LiftProgress[] = [];
  for (const [lift, rows] of byLift) {
    if (rows.length < 2) continue;
    const first = rows[0];
    const latest = rows[rows.length - 1];
    const delta = latest.weightLbs - first.weightLbs;
    const kind: ChangeKind = delta > 0 ? "improved" : delta < 0 ? "declined" : "unchanged";
    const name = liftDisplayName(lift);
    const pair = `${formatNumber(first.weightLbs)} lbs on ${formatBriefDate(first.testedAt)}, ${formatNumber(latest.weightLbs)} lbs on ${formatBriefDate(latest.testedAt)}`;
    const verdict =
      kind === "improved" ? "heavier than before" : kind === "declined" ? "lighter than before" : "no change yet";
    result.push({
      lift,
      displayName: name,
      first,
      latest,
      kind,
      plainLabel: `${name}: ${pair} — ${verdict}`,
    });
  }
  return result;
}

export function formatDosage(sets: string, reps: string, weight: string): string {
  const load = weight.trim() || "—";
  return `${sets.trim() || "—"} × ${reps.trim() || "—"} × ${load}`;
}

/** Only exercises that appear in both the earliest and the most recent session log —
 *  a newly added exercise has no honest baseline, so it is left out rather than compared
 *  against a fabricated first session. */
export function compareSessionExercises(
  logs: PatientProgressInput["sessionExerciseLogs"],
): ExerciseProgressRow[] {
  if (logs.length < 2) return [];
  const sorted = [...logs].sort(
    (a, b) => a.loggedAt.getTime() - b.loggedAt.getTime() || a.visitNumber - b.visitNumber,
  );
  const firstLog = sorted[0];
  const latestLog = sorted[sorted.length - 1];
  const firstByName = new Map<string, { name: string; sets: string; reps: string; weight: string; visitNumber: number }>();
  for (const ex of parseHepExercises(firstLog.exercises)) {
    const name = ex.name.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!firstByName.has(key)) {
      firstByName.set(key, { name, sets: ex.sets, reps: ex.reps, weight: ex.weight, visitNumber: firstLog.visitNumber });
    }
  }
  const result: ExerciseProgressRow[] = [];
  const seen = new Set<string>();
  for (const ex of parseHepExercises(latestLog.exercises)) {
    const name = ex.name.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const first = firstByName.get(key);
    if (!first) continue;
    const latest = { name, sets: ex.sets, reps: ex.reps, weight: ex.weight, visitNumber: latestLog.visitNumber };
    result.push({
      name: first.name,
      first,
      latest,
      plainLabel: `${first.name}: ${formatDosage(first.sets, first.reps, first.weight)} then, ${formatDosage(latest.sets, latest.reps, latest.weight)} now`,
    });
  }
  return result;
}

function compareGoals(goals: GoalItem[]): GoalProgress | null {
  if (goals.length === 0) return null;
  return {
    achieved: goals.filter((g) => g.status === "met"),
    inProgress: goals.filter((g) => g.status !== "met"),
  };
}

function clientGoalFromIntake(raw: unknown | null): ClientGoal | null {
  if (raw == null) return null;
  // Same free-text caps parseIntakeAnswers uses (lib/intake.ts). Runtime import of that
  // module would pull movement-lab into node:test via @/ aliases; the fields themselves
  // are the IntakeAnswers goal strings this panel is specified to read.
  const o = (raw && typeof raw === "object" ? raw : {}) as Partial<IntakeAnswers>;
  const goalShort = typeof o.goalShort === "string" ? o.goalShort.trim().slice(0, 600) : "";
  const goalLong = typeof o.goalLong === "string" ? o.goalLong.trim().slice(0, 600) : "";
  if (!goalShort && !goalLong) return null;
  return { goalShort, goalLong };
}

export function buildPatientProgress(
  input: PatientProgressInput,
  benchmarks: MeasureBenchmarkTable = {},
): PatientProgress {
  return {
    clientGoal: clientGoalFromIntake(input.intakeAnswers),
    outcomes: compareOutcomes(input.outcomes, benchmarks, input.condition ?? "default"),
    planOfCare: planOfCare(input),
    strengthSymmetry: strengthSymmetry(input.forceLabSessions),
    strengthChange: strengthChange(input.forceLabSessions),
    lifts: compareLifts(input.threeRepMaxTests),
    exercises: compareSessionExercises(input.sessionExerciseLogs),
    goals: compareGoals(input.goals),
  };
}

export const EMPTY_PATIENT_PROGRESS_INPUT: PatientProgressInput = {
  visitCount: 0,
  totalVisits: 0,
  startDate: new Date(0),
  lastSeen: null,
  nextVisit: null,
  outcomes: [],
  forceLabSessions: [],
  threeRepMaxTests: [],
  sessionExerciseLogs: [],
  goals: [],
  visitLogs: [],
  intakeAnswers: null,
};
