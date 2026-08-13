/** Static content for /wellness/continuum — the five-zone repetition/load continuum, from
 *  NSCA and ACSM guidelines. Kept free of server-only imports so the page's pure-CSS bar
 *  and the goal-based decision guide can both read from here. */
import type { WellnessGoal } from "@/lib/vitals";

export interface RepContinuumZone {
  zone: number;
  name: string;
  repRange: string;
  load: string;
  rest: string;
  sets: string;
  whoItsFor: string;
  whatItDevelops: string;
  exampleExercises: string;
  source: string;
  /** Position (0-100) along the continuum bar this zone's midpoint sits at — power on the
   *  left, endurance on the right, matching the spec's left-to-right ordering. */
  barPosition: number;
}

export const REP_CONTINUUM_ZONES: RepContinuumZone[] = [
  {
    zone: 1,
    name: "Power",
    repRange: "1 to 3 reps",
    load: "85 to 100% of 1 rep max",
    rest: "3 to 5 minutes between sets",
    sets: "3 to 5",
    whoItsFor: "Athletes, advanced lifters, those training for explosive performance",
    // NSCA distinguishes power specifically by bar speed/explosive intent, not just being
    // the heaviest end of the strength continuum — a near-max single lifted slowly is
    // maximal-strength work, not power work. Named clearly here rather than left implicit,
    // since "explosive intent" is the one thing that actually separates this zone's real
    // training effect from Zone 2 (Strength) below it at a similar %1RM.
    whatItDevelops: "Maximal force production and neuromuscular efficiency, achieved through explosive, high-velocity bar speed, not just the heavy load alone",
    exampleExercises: "Olympic lifts, heavy squats, heavy deadlifts",
    source: "NSCA Essentials of Strength Training and Conditioning",
    barPosition: 10,
  },
  {
    zone: 2,
    name: "Strength",
    repRange: "4 to 6 reps",
    load: "75 to 85% of 1 rep max",
    rest: "2 to 3 minutes",
    sets: "3 to 5",
    whoItsFor: "Intermediate to advanced lifters focused on getting stronger",
    whatItDevelops: "Maximal strength, dense muscle tissue",
    exampleExercises: "Bench press, squat, deadlift at heavy loads",
    source: "NSCA",
    barPosition: 30,
  },
  {
    zone: 3,
    name: "Hypertrophy",
    repRange: "8 to 12 reps",
    load: "65 to 75% of 1 rep max",
    rest: "60 to 90 seconds",
    sets: "3 to 4",
    whoItsFor: "Those focused on building muscle size",
    whatItDevelops: "Muscle cross sectional area, metabolic stress adaptations",
    exampleExercises: "Most traditional bodybuilding exercises",
    source: "Journal of Strength and Conditioning Research",
    barPosition: 50,
  },
  {
    zone: 4,
    name: "Maintenance",
    repRange: "12 to 15 reps",
    load: "55 to 65% of 1 rep max",
    rest: "45 to 60 seconds",
    sets: "2 to 3",
    whoItsFor: "General fitness, maintaining muscle, rehabilitation",
    whatItDevelops: "Muscular endurance with some hypertrophy",
    exampleExercises: "Machine exercises, cable work, moderate bodyweight",
    source: "ACSM Guidelines for Exercise Testing and Prescription",
    barPosition: 70,
  },
  {
    zone: 5,
    name: "Endurance",
    repRange: "15 to 25 reps",
    load: "Below 55% of 1 rep max",
    rest: "30 to 45 seconds",
    sets: "2 to 3",
    whoItsFor: "Beginners, rehabilitation, cardiovascular health focus",
    whatItDevelops: "Muscular endurance, capillary density, fatigue resistance",
    exampleExercises: "Light resistance exercises, bodyweight circuits",
    source: "ACSM",
    barPosition: 90,
  },
];

/** "Which zone is right for me?" decision guide — keyed off VitalsProfile's wellnessGoal
 *  (see lib/vitals.ts WELLNESS_GOAL_OPTIONS). Each entry names the recommended zone(s) in
 *  plain language plus which zone numbers that maps to, for a "→ Zone X-Y" style display. */
export const GOAL_ZONE_GUIDANCE: Record<WellnessGoal, { zones: string; note: string }> = {
  "Build Strength": { zones: "Zone 2-3", note: "Strength through Hypertrophy, heavier loads, lower reps." },
  "General Health": { zones: "Zone 3-4", note: "Hypertrophy through Maintenance, a balanced, sustainable range." },
  "Weight Management": { zones: "Zone 3-4", note: "Hypertrophy through Maintenance, paired with cardio." },
  "Improve Flexibility": { zones: "Zone 4-5", note: "Maintenance through Endurance, paired with mobility work." },
  "Stress Reduction": { zones: "Zone 4-5", note: "Maintenance through Endurance, lighter, more sustainable effort." },
};
