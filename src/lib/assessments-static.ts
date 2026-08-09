/** Static content for /wellness/assess — five self-guided movement screens based on
 *  physical therapy assessment principles. General wellness awareness only, never a
 *  diagnostic tool (see the disclaimer on the page itself). Kept free of server-only
 *  imports so the page and its client log-score buttons can both import from here. */
import type { MetricsLogMetric } from "@/lib/metrics";

export interface AssessmentNormRow {
  ageLabel: string;
  poor: string;
  fair: string;
  good: string;
  excellent: string;
}

export interface AssessmentScoringRow {
  score: string;
  interpretation: string;
}

export interface AssessmentChecklistItem {
  item: string;
  ifItFails: string;
  whatHelps: string;
}

export interface Assessment {
  id: string;
  title: string;
  whatItTests: string;
  steps: string[];
  norms?: AssessmentNormRow[];
  normsNote?: string;
  scoringTable?: AssessmentScoringRow[];
  indicatesIfPoor?: string;
  whenToSeePt?: string;
  interpretationNote?: string;
  checklist?: AssessmentChecklistItem[];
  source: string;
  /** Present only when this assessment has a "Log your score/time" button — the Overhead
   *  Squat Screen is purely observational (a checklist, not a single number), so it has none. */
  metric?: MetricsLogMetric;
  unitLabel?: string;
}

export const ASSESSMENTS: Assessment[] = [
  {
    id: "single-leg-stance",
    title: "Single Leg Stance Test",
    whatItTests: "Balance, proprioception, and lower extremity stability.",
    steps: [
      "Stand near a wall for safety",
      "Lift one foot off the ground",
      "Close your eyes",
      "Time how long you can hold without touching down",
      "Repeat on both sides",
    ],
    norms: [
      { ageLabel: "20-39", poor: "Below 15s", fair: "15-25s", good: "25-35s", excellent: "Above 35s" },
      { ageLabel: "40-49", poor: "Below 12s", fair: "12-20s", good: "20-30s", excellent: "Above 30s" },
      { ageLabel: "50-59", poor: "Below 8s", fair: "8-15s", good: "15-25s", excellent: "Above 25s" },
      { ageLabel: "60+", poor: "Below 4s", fair: "4-10s", good: "10-20s", excellent: "Above 20s" },
    ],
    indicatesIfPoor: "Poor scores might indicate balance deficits and a need for vestibular or proprioceptive training.",
    whenToSeePt: "If you score well below your age norm on both sides, or notice a large difference side to side, a physical therapist can assess your balance system further.",
    source: "Journal of Geriatric Physical Therapy",
    metric: "singleLegStance",
    unitLabel: "seconds",
  },
  {
    id: "sit-and-rise",
    title: "Sit and Rise Test",
    whatItTests: "Functional mobility, flexibility, motor coordination, and a studied predictor of longevity.",
    steps: [
      "Start standing",
      "Lower yourself to sitting on the floor",
      "Rise back to standing",
      "Do not use your hands, knees, or forearms for support",
      "Score out of 10 — start at 10, subtract 1 for each support used, subtract 0.5 for each loss of balance",
    ],
    scoringTable: [
      { score: "8-10", interpretation: "Excellent functional mobility" },
      { score: "6-7.5", interpretation: "Good — room for improvement" },
      { score: "3.5-5.5", interpretation: "Fair — consider mobility training" },
      { score: "Below 3.5", interpretation: "Poor — see a physical therapist" },
    ],
    source: "European Journal of Preventive Cardiology, 2012",
    metric: "sitAndRise",
    unitLabel: "score out of 10",
  },
  {
    id: "wall-sit",
    title: "Wall Sit Test",
    whatItTests: "Quadriceps endurance and lower extremity strength.",
    steps: [
      "Stand with your back flat against a wall",
      "Slide down until your thighs are parallel to the floor",
      "Hold the position — time it",
      "Stop when you can no longer maintain the position",
    ],
    norms: [
      { ageLabel: "20-39 (Men)", poor: "Below 25s", fair: "25-40s", good: "40-60s", excellent: "Above 60s" },
      { ageLabel: "20-39 (Women)", poor: "Below 20s", fair: "20-35s", good: "35-50s", excellent: "Above 50s" },
      { ageLabel: "40-59 (Men)", poor: "Below 20s", fair: "20-30s", good: "30-45s", excellent: "Above 45s" },
      { ageLabel: "40-59 (Women)", poor: "Below 15s", fair: "15-25s", good: "25-40s", excellent: "Above 40s" },
      { ageLabel: "60+ (Men)", poor: "Below 10s", fair: "10-20s", good: "20-30s", excellent: "Above 30s" },
      { ageLabel: "60+ (Women)", poor: "Below 10s", fair: "10-15s", good: "15-25s", excellent: "Above 25s" },
    ],
    normsNote: "General reference ranges, not a single universally-agreed standard — treat these as a rough guide rather than an exact cutoff.",
    source: "ACSM Health Related Physical Fitness Assessment Manual",
    metric: "wallSit",
    unitLabel: "seconds",
  },
  {
    id: "shoulder-scratch",
    title: "Shoulder Mobility Scratch Test",
    whatItTests: "Shoulder range of motion and flexibility.",
    steps: [
      "Reach one arm over your shoulder and down your back",
      "Reach the other arm behind your back and up",
      "Measure the distance between your middle fingers",
      "Positive score — fingers overlap — record as positive centimeters",
      "Negative score — fingers do not reach — record as negative centimeters",
      "Repeat on both sides",
    ],
    interpretationNote: "Symmetry between sides is more important than the absolute score — a large difference side to side is more worth noting than either number alone.",
    source: "FMS — Functional Movement Screen",
    metric: "shoulderScratch",
    unitLabel: "cm (+ overlap / − gap)",
  },
  {
    id: "overhead-squat",
    title: "Overhead Squat Screen",
    whatItTests: "Full body mobility, stability, and movement quality.",
    steps: [
      "Stand with feet shoulder width apart",
      "Raise both arms overhead",
      "Perform a squat as deep as comfortable",
      "Have someone observe or record yourself",
    ],
    checklist: [
      {
        item: "Heels stay flat",
        ifItFails: "If they rise off the floor, this points to an ankle mobility limitation.",
        whatHelps: "A PT can assess ankle dorsiflexion — calf stretching and ankle mobility drills often help.",
      },
      {
        item: "Knees track over toes",
        ifItFails: "If they cave inward, this points to a hip stability issue.",
        whatHelps: "Hip abductor and glute strengthening is commonly used to address this pattern.",
      },
      {
        item: "Arms stay overhead",
        ifItFails: "If they fall forward, this points to a shoulder mobility limitation.",
        whatHelps: "A PT can screen thoracic spine and shoulder mobility — thoracic extension work often helps.",
      },
      {
        item: "Torso stays upright",
        ifItFails: "If it leans forward, this points to a hip flexor or ankle mobility limitation.",
        whatHelps: "Hip flexor stretching and the ankle mobility work above are common starting points.",
      },
    ],
    source: "NASM — National Academy of Sports Medicine",
  },
];
