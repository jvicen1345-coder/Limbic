import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPatientProgress,
  compareSessionExercises,
  describeOutcomeChange,
  formatDosage,
  lookupMeasureBenchmark,
  measureDisplayName,
  type MeasureBenchmarkTable,
  type PatientProgressInput,
} from "./patient-progress";

const BENCHMARKS: MeasureBenchmarkTable = {
  NPRS: { default: { mcid: 2, higherIsBetter: false } },
  LEFS: { default: { mcid: 9, higherIsBetter: true } },
  DASH: { default: { mcid: 10.2, higherIsBetter: false } },
  Oswestry: { default: { mcid: 6, higherIsBetter: false } },
};

const BASE: PatientProgressInput = {
  visitCount: 1,
  totalVisits: 12,
  startDate: new Date("2026-08-01T12:00:00Z"),
  lastSeen: new Date("2026-08-01T12:00:00Z"),
  nextVisit: new Date("2026-08-08T12:00:00Z"),
  outcomes: [],
  forceLabSessions: [],
  threeRepMaxTests: [],
  sessionExerciseLogs: [],
  goals: [],
  visitLogs: [],
  intakeAnswers: null,
};

describe("describeOutcomeChange", () => {
  it("treats an NPRS drop as improvement, and as meaningful at the MCID", () => {
    const sub = describeOutcomeChange(6, 5, { higherIsBetter: false, mcid: 2 });
    assert.equal(sub.kind, "improved");
    assert.equal(sub.meaningful, false);

    const atMcid = describeOutcomeChange(6, 4, { higherIsBetter: false, mcid: 2 });
    assert.equal(atMcid.kind, "improved");
    assert.equal(atMcid.meaningful, true);
  });

  it("does not treat an LEFS drop as improvement", () => {
    const drop = describeOutcomeChange(50, 40, { higherIsBetter: true, mcid: 9 });
    assert.equal(drop.kind, "declined");
    assert.equal(drop.meaningful, false);

    const riseBelowMcid = describeOutcomeChange(50, 55, { higherIsBetter: true, mcid: 9 });
    assert.equal(riseBelowMcid.kind, "improved");
    assert.equal(riseBelowMcid.meaningful, false);

    const riseAtMcid = describeOutcomeChange(50, 59, { higherIsBetter: true, mcid: 9 });
    assert.equal(riseAtMcid.kind, "improved");
    assert.equal(riseAtMcid.meaningful, true);
  });

  it("never calls a change meaningful without a published direction", () => {
    const unknown = describeOutcomeChange(10, 4, { higherIsBetter: null, mcid: 2 });
    assert.equal(unknown.kind, null);
    assert.equal(unknown.meaningful, false);
  });
});

describe("lookupMeasureBenchmark / display names", () => {
  it("resolves ODI and Berg aliases onto mcidValues keys", () => {
    assert.equal(lookupMeasureBenchmark(BENCHMARKS, "ODI")?.higherIsBetter, false);
    assert.equal(measureDisplayName("NPRS"), "Numeric Pain Rating Scale");
    assert.equal(measureDisplayName("LEFS"), "Lower Extremity Functional Scale");
  });
});

describe("buildPatientProgress", () => {
  it("omits empty panels for a brand-new patient with one visit and no measures", () => {
    const progress = buildPatientProgress(BASE, BENCHMARKS);
    assert.equal(progress.clientGoal, null);
    assert.deepEqual(progress.outcomes, []);
    assert.deepEqual(progress.strengthSymmetry, []);
    assert.deepEqual(progress.strengthChange, []);
    assert.deepEqual(progress.lifts, []);
    assert.deepEqual(progress.exercises, []);
    assert.equal(progress.goals, null);
    assert.ok(progress.planOfCare);
    assert.equal(progress.planOfCare?.visitCount, 1);
    assert.equal(progress.planOfCare?.totalVisits, 12);
  });

  it("labels NPRS and LEFS first-vs-latest with the correct direction and MCID wording", () => {
    const progress = buildPatientProgress(
      {
        ...BASE,
        outcomes: [
          { measureName: "NPRS", score: 7, maxScore: 10, recordedAt: new Date("2026-08-31T12:00:00Z") },
          { measureName: "NPRS", score: 4, maxScore: 10, recordedAt: new Date("2026-09-07T12:00:00Z") },
          { measureName: "LEFS", score: 40, maxScore: 80, recordedAt: new Date("2026-08-31T12:00:00Z") },
          { measureName: "LEFS", score: 34, maxScore: 80, recordedAt: new Date("2026-09-07T12:00:00Z") },
          { measureName: "LEFS", score: 34, maxScore: 80, recordedAt: new Date("2026-09-07T12:00:00Z") },
        ],
      },
      BENCHMARKS,
    );
    const nprs = progress.outcomes.find((o) => o.measureName === "NPRS");
    const lefs = progress.outcomes.find((o) => o.measureName === "LEFS");
    assert.ok(nprs && lefs);
    assert.equal(nprs.kind, "improved");
    assert.equal(nprs.meaningful, true);
    assert.match(nprs.plainLabel, /meaningful improvement/);
    assert.equal(lefs.kind, "declined");
    assert.equal(lefs.meaningful, false);
    assert.match(lefs.plainLabel, /declined/);
    assert.doesNotMatch(lefs.plainLabel, /meaningful improvement/);
  });

  it("does not call a sub-MCID NPRS drop a meaningful improvement", () => {
    const progress = buildPatientProgress(
      {
        ...BASE,
        outcomes: [
          { measureName: "NPRS", score: 6, maxScore: 10, recordedAt: new Date("2026-08-01T12:00:00Z") },
          { measureName: "NPRS", score: 5, maxScore: 10, recordedAt: new Date("2026-08-15T12:00:00Z") },
        ],
      },
      BENCHMARKS,
    );
    assert.equal(progress.outcomes[0].kind, "improved");
    assert.equal(progress.outcomes[0].meaningful, false);
    assert.match(progress.outcomes[0].plainLabel, /not yet a meaningful change/);
  });

  it("treats a DASH drop as improvement because higherIsBetter is false", () => {
    const progress = buildPatientProgress(
      {
        ...BASE,
        outcomes: [
          { measureName: "DASH", score: 40, maxScore: 100, recordedAt: new Date("2026-08-01T12:00:00Z") },
          { measureName: "DASH", score: 20, maxScore: 100, recordedAt: new Date("2026-09-01T12:00:00Z") },
        ],
      },
      BENCHMARKS,
    );
    assert.equal(progress.outcomes[0].kind, "improved");
    assert.equal(progress.outcomes[0].meaningful, true);
  });

  it("shows latest left/right strength per muscle group with LSI wording", () => {
    const progress = buildPatientProgress({
      ...BASE,
      forceLabSessions: [
        {
          muscleGroup: "Knee Extension — Seated",
          leftPeak: 40,
          rightPeak: 50,
          lsi: 80,
          unit: "lbs",
          sessionDate: new Date("2026-08-01T12:00:00Z"),
        },
        {
          muscleGroup: "Knee Extension — Seated",
          leftPeak: 48,
          rightPeak: 52,
          lsi: 92,
          unit: "lbs",
          sessionDate: new Date("2026-09-01T12:00:00Z"),
        },
      ],
    });
    assert.equal(progress.strengthSymmetry.length, 1);
    assert.equal(progress.strengthSymmetry[0].displayName, "Knee Straightening");
    assert.equal(progress.strengthSymmetry[0].leftPeak, 48);
    assert.equal(progress.strengthSymmetry[0].lsiLabel, "Good symmetry");
    assert.equal(progress.strengthSymmetry[0].lsiColor, "#16a34a");
    assert.equal(progress.strengthChange.length, 1);
    assert.match(progress.strengthChange[0].plainLabel, /Left 40 → 48 lbs/);
    assert.match(progress.strengthChange[0].plainLabel, /Right 50 → 52 lbs/);
  });

  it("extracts the client's stated goals and never reads a name field", () => {
    const progress = buildPatientProgress({
      ...BASE,
      intakeAnswers: {
        activityLevel: "Moderately active (3-4/wk)",
        activities: ["Running"],
        daysPerWeek: "3",
        goalShort: "Walk the dog without stopping",
        goalLong: "Run a 5k this fall",
        recentInjury: "No",
        cleared: true,
        equipment: [],
        clientName: "should not appear",
      },
      goals: [
        { goalText: "Walk the dog without stopping", category: "General — Function", timeframe: "Short-term", status: "met" },
        { goalText: "Run a 5k this fall", category: "General — Function", timeframe: "Long-term", status: "active" },
      ],
    });
    assert.deepEqual(progress.clientGoal, {
      goalShort: "Walk the dog without stopping",
      goalLong: "Run a 5k this fall",
    });
    assert.equal(progress.goals?.achieved.length, 1);
    assert.equal(progress.goals?.inProgress.length, 1);
    assert.ok(!JSON.stringify(progress).includes("should not appear"));
  });

  it("compares 3RM first vs latest per lift", () => {
    const progress = buildPatientProgress({
      ...BASE,
      threeRepMaxTests: [
        { lift: "squat", weightLbs: 135, testedAt: new Date("2026-08-01T12:00:00Z") },
        { lift: "squat", weightLbs: 155, testedAt: new Date("2026-09-01T12:00:00Z") },
        { lift: "bench", weightLbs: 95, testedAt: new Date("2026-08-01T12:00:00Z") },
      ],
    });
    assert.equal(progress.lifts.length, 1);
    assert.equal(progress.lifts[0].displayName, "Squat");
    assert.equal(progress.lifts[0].kind, "improved");
    assert.match(progress.lifts[0].plainLabel, /heavier than before/);
  });
});

describe("compareSessionExercises", () => {
  const squat = { name: "Goblet squat", sets: "3", reps: "8", weight: "20", frequency: "", hold: "", equipment: "", notes: "", imageUrl: "", videoUrl: "" };
  const hinge = { name: "Hip hinge", sets: "3", reps: "10", weight: "bodyweight", frequency: "", hold: "", equipment: "", notes: "", imageUrl: "", videoUrl: "" };
  const laterSquat = { ...squat, weight: "30", reps: "10" };

  it("only compares exercises present in both the first and latest session log", () => {
    const rows = compareSessionExercises([
      { visitNumber: 1, loggedAt: new Date("2026-08-01T12:00:00Z"), exercises: [squat, hinge] },
      { visitNumber: 2, loggedAt: new Date("2026-08-15T12:00:00Z"), exercises: [squat, { ...hinge, name: "Side plank" }] },
      { visitNumber: 3, loggedAt: new Date("2026-09-01T12:00:00Z"), exercises: [laterSquat, { ...hinge, name: "Side plank" }] },
    ]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].name, "Goblet squat");
    assert.equal(formatDosage(rows[0].first.sets, rows[0].first.reps, rows[0].first.weight), "3 × 8 × 20");
    assert.equal(formatDosage(rows[0].latest.sets, rows[0].latest.reps, rows[0].latest.weight), "3 × 10 × 30");
  });

  it("does not fabricate a baseline for an exercise added after the first session", () => {
    const rows = compareSessionExercises([
      { visitNumber: 1, loggedAt: new Date("2026-08-01T12:00:00Z"), exercises: [squat] },
      { visitNumber: 2, loggedAt: new Date("2026-09-01T12:00:00Z"), exercises: [squat, hinge] },
    ]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].name, "Goblet squat");
  });

  it("returns nothing when there is only one session log", () => {
    assert.deepEqual(
      compareSessionExercises([{ visitNumber: 1, loggedAt: new Date("2026-08-01T12:00:00Z"), exercises: [squat] }]),
      [],
    );
  });
});
