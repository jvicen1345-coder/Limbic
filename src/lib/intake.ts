import { MOVEMENT_EQUIPMENT, type MovementEquipment } from "@/lib/movement-lab";

/** The shape of a completed client intake — what the public form collects and what
 *  IntakeSubmission.answers holds (see prisma/schema.prisma).
 *
 *  Client-safe on purpose: the public form (components/IntakeForm.tsx), the submit action
 *  and the dashboard's review card all read these same definitions, so a question can't be
 *  added to the form and quietly dropped on the way in or out.
 *
 *  The equipment options are MOVEMENT_EQUIPMENT itself rather than a copy — a returned
 *  intake therefore feeds the Movement Lab equipment filter with no translation step, and a
 *  value added to the bank shows up here without anyone remembering to mirror it. */
export const INTAKE_EQUIPMENT: readonly MovementEquipment[] = MOVEMENT_EQUIPMENT;

export const INTAKE_ACTIVITY_LEVELS = [
  "Sedentary",
  "Lightly active (1-2/wk)",
  "Moderately active (3-4/wk)",
  "Very active (5+/wk)",
] as const;

export const INTAKE_ACTIVITIES = [
  "Walking",
  "Running",
  "Cycling",
  "Swimming",
  "Strength training",
  "Yoga or Pilates",
  "Sport",
  "Manual work",
] as const;

export interface IntakeAnswers {
  activityLevel: string;
  activities: string[];
  daysPerWeek: string;
  sessionLength: string;
  howLong: string;
  goalShort: string;
  goalLong: string;
  limits: string;
  cleared: boolean;
  equipment: string[];
}

export const EMPTY_INTAKE_ANSWERS: IntakeAnswers = {
  activityLevel: "",
  activities: [],
  daysPerWeek: "",
  sessionLength: "",
  howLong: "",
  goalShort: "",
  goalLong: "",
  limits: "",
  cleared: false,
  equipment: [],
};

const MAX_TEXT = 600;
const MAX_LIST = 40;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_TEXT) : "";
}

/** Only values the form actually offers survive, so a hand-rolled POST can't write arbitrary
 *  strings into a checkbox list that the dashboard later renders. */
function pick(value: unknown, allowed: readonly string[]): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && allowed.includes(v)).slice(0, MAX_LIST);
}

/** Normalizes whatever arrives from the public form into IntakeAnswers.
 *
 *  This is the trust boundary: the intake page is unauthenticated, so nothing it sends is
 *  believed. Free text is trimmed and capped, checkbox lists are intersected with the options
 *  the form offers, and anything unrecognized is dropped rather than rejected — a client who
 *  submits a slightly odd payload should still get their answers through, not a dead end. */
export function parseIntakeAnswers(raw: unknown): IntakeAnswers {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const level = str(o.activityLevel);
  return {
    activityLevel: (INTAKE_ACTIVITY_LEVELS as readonly string[]).includes(level) ? level : "",
    activities: pick(o.activities, INTAKE_ACTIVITIES),
    daysPerWeek: str(o.daysPerWeek),
    sessionLength: str(o.sessionLength),
    howLong: str(o.howLong),
    goalShort: str(o.goalShort),
    goalLong: str(o.goalLong),
    limits: str(o.limits),
    cleared: o.cleared === true,
    equipment: pick(o.equipment, INTAKE_EQUIPMENT),
  };
}

/** An intake with nothing in it is not worth a row in the review queue. Goals are the one
 *  thing the form exists to collect, so at least one has to be present. */
export function hasSubstance(a: IntakeAnswers): boolean {
  return Boolean(a.goalShort || a.goalLong);
}

/** How long a generated link stays usable. Long enough that a client can get to it over a
 *  weekend, short enough that a link forwarded on months later is dead. */
export const INTAKE_LINK_DAYS = 14;
