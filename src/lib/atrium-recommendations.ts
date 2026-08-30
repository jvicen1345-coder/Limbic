export interface PlatformRecommendation {
  title: string;
  description: string;
  route: string;
  priority: "high" | "medium" | "low";
}

// Keyed by DPTTrimester.number (see lib/dpt-program.ts, 1-9 across the Chapman calendar).
// Routes below are the app's real routes, not the ones a first draft of this spec assumed —
// "/student/boards" doesn't exist (Boards lives at /boards), Limbic Agent is at /agent (no
// /pro/agent — see AppShell.tsx's own sidebar link), "Practice a SOAP Note" is /student/soap,
// and NPTE Breakdown is a tab on the Boards page itself (?tab=breakdown — see
// components/BoardsTabs.tsx), not a standalone route.
const TRIMESTER_RECOMMENDATIONS: Record<number, PlatformRecommendation[]> = {
  1: [
    { title: "Limbic Atlas", description: "Anatomy regions for current coursework", route: "/atlas", priority: "high" },
    { title: "Musculoskeletal Track", description: "Movement assessment foundations", route: "/student/specialties/musculoskeletal", priority: "high" },
    { title: "Daily Boards Sharpening", description: "Build your streak early", route: "/boards", priority: "high" },
    { title: "Clinical Pathology Reference", description: "General medicine conditions", route: "/student/specialties", priority: "medium" },
    { title: "Lab Values Reference", description: "Essential for clinical pathology", route: "/pro/lab-values", priority: "medium" },
  ],
  2: [
    { title: "MSK Specialty Track", description: "Orthopedic conditions and special tests", route: "/student/specialties/musculoskeletal", priority: "high" },
    { title: "Special Tests Library", description: "Sensitivity and specificity values", route: "/pro/special-tests", priority: "high" },
    { title: "Daily Boards Sharpening", description: "Orthopedic content is heavily tested", route: "/boards", priority: "high" },
    { title: "Clinical Calculators", description: "Outcome measures for examination", route: "/pro/calculators", priority: "medium" },
    { title: "Limbic Atlas", description: "Neurological anatomy foundations", route: "/atlas", priority: "medium" },
  ],
  3: [
    { title: "Neurological Specialty Track", description: "Stroke, TBI, SCI, Parkinson's", route: "/student/specialties/neurological", priority: "high" },
    { title: "MSK Specialty Track", description: "Lower quarter continues", route: "/student/specialties/musculoskeletal", priority: "high" },
    { title: "Daily Boards Sharpening", description: "Neuromuscular content — high NPTE weight", route: "/boards", priority: "high" },
    { title: "Limbic Atlas — Neurological", description: "Dermatomes and nerve supply", route: "/atlas", priority: "medium" },
    { title: "Red Flag Screening", description: "Clinical reasoning fundamentals", route: "/pro/red-flags", priority: "medium" },
  ],
  4: [
    { title: "MSK Specialty Track", description: "Upper quarter — shoulder, elbow, wrist", route: "/student/specialties/musculoskeletal", priority: "high" },
    { title: "Neurological Specialty Track", description: "Neurological practice management", route: "/student/specialties/neurological", priority: "high" },
    { title: "Daily Boards Sharpening", description: "Year 2 — boards prep becomes critical", route: "/boards", priority: "high" },
    { title: "Decision Rules", description: "Ottawa rules, Canadian C-spine, Wells", route: "/pro/decision-rules", priority: "medium" },
    { title: "Special Tests Library", description: "Upper quarter special tests", route: "/pro/special-tests", priority: "medium" },
  ],
  5: [
    { title: "Limbic Agent", description: "Clinical decision support for rotation", route: "/agent", priority: "high" },
    { title: "Clinical Calculators", description: "Outcome measures for your patients", route: "/pro/calculators", priority: "high" },
    { title: "SOAP Note Practice", description: "Documentation skills for rotation", route: "/student/soap", priority: "high" },
    { title: "Red Flag Screening", description: "Essential for clinical reasoning", route: "/pro/red-flags", priority: "high" },
    { title: "Force Lab", description: "Track patient strength data", route: "/pro/force-lab", priority: "medium" },
  ],
  6: [
    { title: "Cardiopulmonary Specialty Track", description: "Current trimester focus", route: "/student/specialties/cardiopulmonary", priority: "high" },
    { title: "Pediatrics Specialty Track", description: "Developmental milestones and conditions", route: "/student/specialties/pediatrics", priority: "high" },
    { title: "Daily Boards Sharpening", description: "Cardiopulmonary and pediatric content", route: "/boards", priority: "high" },
    { title: "Medications Reference", description: "Pharmacology for current coursework", route: "/pro/medications", priority: "medium" },
    { title: "Lab Values Reference", description: "Cardiopulmonary lab interpretation", route: "/pro/lab-values", priority: "medium" },
  ],
  7: [
    { title: "Limbic Agent", description: "Clinical decision support for rotation 2", route: "/agent", priority: "high" },
    { title: "Clinical Calculators", description: "Outcome measures for your patients", route: "/pro/calculators", priority: "high" },
    { title: "Force Lab", description: "Dynamometer data for your caseload", route: "/pro/force-lab", priority: "high" },
    { title: "Decision Rules", description: "Clinical decision support", route: "/pro/decision-rules", priority: "medium" },
    { title: "SOAP Note Practice", description: "Refine documentation on rotation", route: "/student/soap", priority: "medium" },
  ],
  8: [
    { title: "Geriatrics Specialty Track", description: "Falls, balance, aging-in-place", route: "/student/specialties/geriatrics", priority: "high" },
    { title: "Daily Boards Sharpening", description: "Final didactic trimester — push hard", route: "/boards", priority: "high" },
    { title: "NPTE Breakdown", description: "Content areas and exam strategy", route: "/boards?tab=breakdown", priority: "high" },
    { title: "CE Tracker", description: "Start tracking continuing education", route: "/pro/ce-tracker", priority: "medium" },
    { title: "Limbic Atlas", description: "Geriatric anatomy and conditions", route: "/atlas", priority: "medium" },
  ],
  9: [
    { title: "Limbic Agent", description: "Clinical decision support for final rotation", route: "/agent", priority: "high" },
    { title: "Force Lab", description: "Advanced patient tracking for final rotation", route: "/pro/force-lab", priority: "high" },
    { title: "Patient Brief", description: "Professional patient documentation", route: "/pro/dashboard", priority: "high" },
    { title: "NPTE Breakdown", description: "Boards are coming — know the content areas", route: "/boards?tab=breakdown", priority: "high" },
    { title: "CE Tracker", description: "Track hours for licensure", route: "/pro/ce-tracker", priority: "medium" },
  ],
};

export function getWeekRecommendations(trimesterNumber: number): PlatformRecommendation[] {
  return TRIMESTER_RECOMMENDATIONS[trimesterNumber] ?? TRIMESTER_RECOMMENDATIONS[1];
}

export function getThisWeekDateRange(): { start: string; end: string; label: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
    label: `Week of ${format(monday)}`,
  };
}
