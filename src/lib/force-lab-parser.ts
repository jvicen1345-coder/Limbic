import { calculateDifference, calculateLSI, calculatePercentDiff } from "@/lib/force-lab-units";

/** Parses a raw ActiveForce app text export (Share/Export from the app, pasted in via the
 *  Paste Assessment tab — see components/pro/force-lab/PasteAssessmentPanel.tsx and
 *  createForceLabAssessment in app/actions/force-lab.ts) into structured per-muscle-group
 *  data. No `server-only` — parseAssessmentText (a server action) is the only caller today,
 *  but this has no server-only dependency itself, same reasoning as force-lab-muscles.ts/
 *  force-lab-units.ts staying importable from the client if a future preview-in-browser
 *  need ever wants it.
 *
 *  The export is a flat, indentation-free text dump: metadata lines at the top, then one
 *  `==== <Muscle Group Header> ====` block per muscle group tested, each containing one or
 *  more labeled sub-sections ("Peak Force", "Time to Peak Force", "Average Force",
 *  "Force-Weight Ratio", and their "Average <X>" siblings, plus per-repetition "Repetition
 *  N" blocks) with "Left:"/"Right:" (or "Left Peak Force:"/"Right Peak Force:") value
 *  lines. This is a line-by-line state machine over that shape — `currentSection` tracks
 *  which sub-section's values the next "Left:"/"Right:" line belongs to. */

export interface ParsedMuscleGroup {
  muscleGroup: string;
  bodyRegion: string;
  side: "bilateral" | "left" | "right";
  peakForceLeft?: number;
  peakForceRight?: number;
  timeToPeakLeft?: number;
  timeToPeakRight?: number;
  averageForceLeft?: number;
  averageForceRight?: number;
  forceWeightRatioLeft?: number;
  forceWeightRatioRight?: number;
  rep1Left?: number;
  rep1Right?: number;
  rep2Left?: number;
  rep2Right?: number;
  rep3Left?: number;
  rep3Right?: number;
  timeToPeakAvgLeft?: number;
  timeToPeakAvgRight?: number;
  difference?: number;
  percentDiff?: number;
  lsi?: number;
  unit: string;
}

export interface ParsedAssessment {
  identifier?: string;
  assessmentDate?: string;
  patientWeight?: number;
  patientWeightUnit?: string;
  patientAge?: number;
  patientSex?: string;
  dominantSide?: string;
  muscleGroups: ParsedMuscleGroup[];
  unit: string;
}

const MUSCLE_GROUP_ALIASES: Record<string, { muscleGroup: string; bodyRegion: string }> = {
  "Hip Flexion Seated": { muscleGroup: "Hip Flexion — Seated", bodyRegion: "Hip" },
  "Hip Extension Prone": { muscleGroup: "Hip Extension — Prone", bodyRegion: "Hip" },
  "Hip Abduction Seated": { muscleGroup: "Hip Abduction — Sidelying", bodyRegion: "Hip" },
  "Hip Abduction": { muscleGroup: "Hip Abduction — Sidelying", bodyRegion: "Hip" },
  "Hip Adduction": { muscleGroup: "Hip Adduction — Sidelying", bodyRegion: "Hip" },
  "Hip Internal Rotation": { muscleGroup: "Hip Internal Rotation", bodyRegion: "Hip" },
  "Hip External Rotation": { muscleGroup: "Hip External Rotation", bodyRegion: "Hip" },
  "Knee Extension Seated": { muscleGroup: "Knee Extension — Seated", bodyRegion: "Knee" },
  "Knee Flexion Prone": { muscleGroup: "Knee Flexion — Prone", bodyRegion: "Knee" },
  "Ankle Plantar Flexion Supine": { muscleGroup: "Ankle Plantarflexion", bodyRegion: "Ankle" },
  "Ankle Dorsiflexion Supine": { muscleGroup: "Ankle Dorsiflexion", bodyRegion: "Ankle" },
  "Ankle Inversion": { muscleGroup: "Ankle Inversion", bodyRegion: "Ankle" },
  "Ankle Eversion": { muscleGroup: "Ankle Eversion", bodyRegion: "Ankle" },
  "Shoulder Flexion Seated": { muscleGroup: "Shoulder Flexion", bodyRegion: "Shoulder" },
  "Shoulder Abduction": { muscleGroup: "Shoulder Abduction", bodyRegion: "Shoulder" },
  "Shoulder External Rotation Seated": { muscleGroup: "Shoulder External Rotation", bodyRegion: "Shoulder" },
  "Shoulder External Rotation": { muscleGroup: "Shoulder External Rotation", bodyRegion: "Shoulder" },
  "Shoulder Internal Rotation": { muscleGroup: "Shoulder Internal Rotation", bodyRegion: "Shoulder" },
  "Elbow Flexion": { muscleGroup: "Elbow Flexion", bodyRegion: "Elbow" },
  "Elbow Extension": { muscleGroup: "Elbow Extension", bodyRegion: "Elbow" },
  "Wrist Flexion": { muscleGroup: "Wrist Flexion", bodyRegion: "Wrist" },
  "Wrist Extension": { muscleGroup: "Wrist Extension", bodyRegion: "Wrist" },
  "Hand Grip Seated": { muscleGroup: "Grip Strength", bodyRegion: "Grip" },
  "Hand Pinch Grip Seated": { muscleGroup: "Grip Strength — Pinch", bodyRegion: "Grip" },
};

function parseSideFromHeader(header: string): "bilateral" | "left" | "right" {
  const lower = header.toLowerCase();
  if (lower.includes("left/right") || lower.includes("right/left")) return "bilateral";
  if (lower.includes("(left)")) return "left";
  if (lower.includes("(right)")) return "right";
  return "bilateral";
}

function parseForceValue(line: string): number | undefined {
  const match = line.match(/[\d]+\.[\d]+/);
  return match ? parseFloat(match[0]) : undefined;
}

function parseMuscleGroupHeader(line: string): string {
  return line
    .replace(/={2,}/g, "")
    .replace(/\(.*?\)/g, "")
    .trim();
}

/** Fills in difference/percentDiff/lsi from whatever peak values were parsed, using the
 *  same min-is-involved/max-is-uninvolved convention createForceLabSession already applies
 *  server-side — kept here too so the paste-preview table (shown before anything is saved)
 *  can display real numbers. createForceLabAssessment recomputes the same way from the
 *  saved peaks when it persists each ForceLabSession row, exactly as createForceLabSession
 *  never trusts a caller-supplied lsi/difference/percentDiff — this is preview-only. */
function finalizeMuscleGroup(muscle: ParsedMuscleGroup, unit: string): ParsedMuscleGroup {
  muscle.unit = unit;
  if (muscle.peakForceLeft != null && muscle.peakForceRight != null) {
    const involved = Math.min(muscle.peakForceLeft, muscle.peakForceRight);
    const uninvolved = Math.max(muscle.peakForceLeft, muscle.peakForceRight);
    muscle.lsi = calculateLSI(involved, uninvolved);
    muscle.difference = calculateDifference(muscle.peakForceRight, muscle.peakForceLeft);
    muscle.percentDiff = calculatePercentDiff(muscle.peakForceRight, muscle.peakForceLeft);
  }
  return muscle;
}

export function parseActiveForcePaste(rawText: string): ParsedAssessment {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const result: ParsedAssessment = {
    muscleGroups: [],
    unit: "lbs",
  };

  let currentMuscle: ParsedMuscleGroup | null = null;
  let currentSection = "";
  let repCount = { left: 0, right: 0 };

  for (const line of lines) {
    // Parse header metadata
    if (line.startsWith("Identifier:")) {
      result.identifier = line.replace("Identifier:", "").trim();
      continue;
    }
    if (line.startsWith("Weight:")) {
      const weightMatch = line.match(/([\d.]+)\s*(kg|lb)/);
      if (weightMatch) {
        result.patientWeight = parseFloat(weightMatch[1]);
        result.patientWeightUnit = weightMatch[2];
      }
      continue;
    }
    if (line.startsWith("Age:")) {
      result.patientAge = parseInt(line.replace("Age:", "").trim());
      continue;
    }
    if (line.startsWith("Gender:")) {
      result.patientSex = line.replace("Gender:", "").trim().toLowerCase();
      continue;
    }
    if (line.startsWith("Dominant Side:")) {
      result.dominantSide = line.replace("Dominant Side:", "").trim();
      continue;
    }

    // Detect date line — format: "Full body\nSunday, May 10, 2026 at 11:10 AM"
    if (line.match(/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday),/)) {
      result.assessmentDate = line;
      continue;
    }

    // Detect muscle group header
    if (line.startsWith("====")) {
      if (currentMuscle) {
        result.muscleGroups.push(finalizeMuscleGroup(currentMuscle, result.unit));
      }

      const headerText = parseMuscleGroupHeader(line);
      const side = parseSideFromHeader(line);

      // Find matching muscle group
      let matchedGroup = { muscleGroup: headerText, bodyRegion: "General" };
      for (const [alias, mapped] of Object.entries(MUSCLE_GROUP_ALIASES)) {
        if (headerText.toLowerCase().includes(alias.toLowerCase())) {
          matchedGroup = mapped;
          break;
        }
      }

      currentMuscle = {
        muscleGroup: matchedGroup.muscleGroup,
        bodyRegion: matchedGroup.bodyRegion,
        side,
        unit: result.unit,
      };
      currentSection = "";
      repCount = { left: 0, right: 0 };
      continue;
    }

    if (!currentMuscle) continue;

    // Detect section headers
    if (line === "Peak Force") {
      currentSection = "peak";
      continue;
    }
    if (line === "Time to Peak Force") {
      currentSection = "time";
      continue;
    }
    if (line === "Average Force") {
      currentSection = "average";
      continue;
    }
    if (line === "Force-Weight Ratio") {
      currentSection = "ratio";
      continue;
    }
    if (line === "Average Peak Force") {
      currentSection = "avgPeak";
      continue;
    }
    if (line === "Average Time to Peak Force") {
      currentSection = "avgTime";
      continue;
    }
    if (line === "Average Force-Weight Ratio") {
      currentSection = "avgRatio";
      continue;
    }
    if (line.startsWith("Repetition")) {
      currentSection = "rep";
      continue;
    }

    // Parse unit from a force line
    if (line.includes(" lb")) result.unit = "lbs";
    if (line.includes(" kg")) result.unit = "kg";

    // Parse values by section
    if (currentSection === "peak" || currentSection === "avgPeak") {
      if (line.startsWith("Left:") || line.startsWith("Left Peak Force:")) {
        currentMuscle.peakForceLeft = parseForceValue(line);
      }
      if (line.startsWith("Right:") || line.startsWith("Right Peak Force:")) {
        currentMuscle.peakForceRight = parseForceValue(line);
      }
    }

    if (currentSection === "time") {
      if (line.startsWith("Left:")) currentMuscle.timeToPeakLeft = parseForceValue(line);
      if (line.startsWith("Right:")) currentMuscle.timeToPeakRight = parseForceValue(line);
    }

    // "Average Time to Peak Force" has its own ForceLabSession column
    // (timeToPeakAvgLeft/Right) distinct from "Time to Peak Force" — an export that reports
    // both (a single best-rep time alongside the multi-rep average) needs them kept apart.
    if (currentSection === "avgTime") {
      if (line.startsWith("Left:")) currentMuscle.timeToPeakAvgLeft = parseForceValue(line);
      if (line.startsWith("Right:")) currentMuscle.timeToPeakAvgRight = parseForceValue(line);
    }

    if (currentSection === "average") {
      if (line.startsWith("Left:")) currentMuscle.averageForceLeft = parseForceValue(line);
      if (line.startsWith("Right:")) currentMuscle.averageForceRight = parseForceValue(line);
    }

    if (currentSection === "ratio" || currentSection === "avgRatio") {
      if (line.startsWith("Left:")) currentMuscle.forceWeightRatioLeft = parseForceValue(line);
      if (line.startsWith("Right:")) currentMuscle.forceWeightRatioRight = parseForceValue(line);
    }

    if (currentSection === "rep") {
      if (line.startsWith("Left Peak Force:")) {
        repCount.left++;
        if (repCount.left === 1) currentMuscle.rep1Left = parseForceValue(line);
        if (repCount.left === 2) currentMuscle.rep2Left = parseForceValue(line);
        if (repCount.left === 3) currentMuscle.rep3Left = parseForceValue(line);
      }
      if (line.startsWith("Right Peak Force:")) {
        repCount.right++;
        if (repCount.right === 1) currentMuscle.rep1Right = parseForceValue(line);
        if (repCount.right === 2) currentMuscle.rep2Right = parseForceValue(line);
        if (repCount.right === 3) currentMuscle.rep3Right = parseForceValue(line);
      }
    }
  }

  // Push final muscle group
  if (currentMuscle) {
    result.muscleGroups.push(finalizeMuscleGroup(currentMuscle, result.unit));
  }

  return result;
}
