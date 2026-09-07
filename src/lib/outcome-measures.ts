/**
 * Published MCID and MDC figures for the outcome measures Limbic already carries, in one
 * place, so an appraisal's clinical-magnitude check can be filled from a picker instead of
 * from memory (see lib/appraisal.ts, components/admin/AppraisalWorkbench.tsx).
 *
 * Two things about this data are deliberate.
 *
 * `mcid: null` is a real and common answer, not a gap to fill in later. The TUG, the 6MWT,
 * the Berg and the 30-second sit-to-stand have no single widely-accepted MCID, and typing a
 * plausible-looking number for one of them is worse than leaving it blank: it would drive
 * the clinical-magnitude verdict in runAppraisalChecks(), which is the strongest claim an
 * appraisal makes. For those measures the picker fills the units, leaves the MCID empty, and
 * shows why — an appraiser who then enters one has done it knowingly.
 *
 * The values were lifted from the calculator components that already display them, named in
 * `origin` on each record so the two can be compared. Those components still carry their own
 * prose: reconciling them to read from this file is a worthwhile follow-up but a separate
 * change, since it touches eleven files of user-visible clinical copy for no behavioural
 * gain here. Until it happens, `origin` is where to check when a number looks wrong.
 */

export interface OutcomeMeasure {
  id: string;
  /** Full name, as a clinician would write it in an appraisal. */
  name: string;
  abbreviation: string;
  /** Units the effect is expressed in — prefilled into the appraisal's effect-unit field so
   *  the MCID and the effect are always compared in the same terms. */
  unit: string;
  /** The published minimal clinically important difference, as a positive magnitude. Null
   *  when no single value is widely accepted — see the note at the top of this file. */
  mcid: number | null;
  /** The population or derivation the MCID comes from, or, when mcid is null, why there
   *  isn't one. Shown beside the picker as context; deliberately NOT prefilled into the
   *  appraisal's MCID-source field, which asks where the appraiser got the number and is
   *  answered by a citation they can stand behind, not by this file (see MeasurePicker). */
  mcidNote: string;
  /** Minimal detectable change, where the app already records one. Not used by any check —
   *  shown beside the MCID because an effect below the MDC is measurement noise, which is
   *  worth knowing while entering the numbers. */
  mdc: number | null;
  mdcNote: string;
  /** The component this record's figures were taken from, for checking against. */
  origin: string;
}

export const OUTCOME_MEASURES: readonly OutcomeMeasure[] = [
  {
    id: "nprs",
    name: "Numeric Pain Rating Scale",
    abbreviation: "NPRS",
    unit: "points",
    mcid: 2,
    mcidNote: "General musculoskeletal pain populations",
    mdc: null,
    mdcNote: "",
    origin: "components/pro/calculators/NprsCalculator.tsx",
  },
  {
    id: "odi",
    name: "Oswestry Disability Index",
    abbreviation: "ODI",
    unit: "percentage points",
    mcid: 10,
    mcidNote: "Commonly cited; varies with calculation method and population",
    mdc: 9,
    mdcNote: "",
    origin: "components/pro/calculators/OswestryCalculator.tsx",
  },
  {
    id: "dash",
    name: "Disabilities of the Arm, Shoulder and Hand",
    abbreviation: "DASH",
    unit: "points",
    mcid: 11,
    mcidNote: "Musculoskeletal disorders, pooled meta-analysis estimate",
    mdc: 11,
    mdcNote: "",
    origin: "components/pro/calculators/DashCalculator.tsx",
  },
  {
    id: "lefs",
    name: "Lower Extremity Functional Scale",
    abbreviation: "LEFS",
    unit: "points",
    mcid: 9,
    mcidNote: "",
    mdc: 9,
    mdcNote: "",
    origin: "components/pro/calculators/LefsCalculator.tsx",
  },
  {
    id: "psfs",
    name: "Patient-Specific Functional Scale",
    abbreviation: "PSFS",
    unit: "points per activity",
    mcid: 2,
    mcidNote: "",
    mdc: null,
    mdcNote: "",
    origin: "components/pro/calculators/PsfsCalculator.tsx",
  },
  {
    id: "fga",
    name: "Functional Gait Assessment",
    abbreviation: "FGA",
    unit: "points",
    mcid: 4,
    mcidNote: "Community-dwelling older adults",
    mdc: 4.2,
    mdcNote: "Stroke",
    origin: "components/pro/calculators/FgaCalculator.tsx",
  },
  {
    id: "berg",
    name: "Berg Balance Scale",
    abbreviation: "BBS",
    unit: "points",
    mcid: null,
    mcidNote: "Varies by baseline score and population, commonly cited in the 4-8 point range",
    mdc: 6.5,
    mdcNote: "Community-dwelling older adults",
    origin: "components/pro/calculators/BergBalanceCalculator.tsx",
  },
  {
    id: "tug",
    name: "Timed Up and Go",
    abbreviation: "TUG",
    unit: "seconds",
    mcid: null,
    mcidNote: "Varies substantially by population and condition",
    mdc: 4,
    mdcNote: "Community-dwelling older adults",
    origin: "components/pro/calculators/TugCalculator.tsx",
  },
  {
    id: "sixmwt",
    name: "Six-Minute Walk Test",
    abbreviation: "6MWT",
    unit: "meters",
    mcid: null,
    mcidNote: "Highly condition-dependent, from roughly 15 to 195 meters across published populations",
    mdc: 54,
    mdcNote: "Community-dwelling older adults",
    origin: "components/pro/calculators/SixMinuteWalkCalculator.tsx",
  },
  {
    id: "sts30",
    name: "30-Second Sit to Stand",
    abbreviation: "30s STS",
    unit: "repetitions",
    mcid: null,
    mcidNote: "Norms are age- and sex-banded rather than change-based",
    mdc: 2,
    mdcNote: "Community-dwelling older adults",
    origin: "components/pro/calculators/ThirtySecondStsCalculator.tsx",
  },
  {
    id: "mbess",
    name: "Modified Balance Error Scoring System",
    abbreviation: "mBESS",
    unit: "error points",
    mcid: null,
    mcidNote: "A 1-2 error increase after concussion can fall within measurement error alone",
    mdc: null,
    mdcNote: "Roughly 3-5 error points, varying by rater and population",
    origin: "components/pro/calculators/MbessCalculator.tsx",
  },
] as const;

export function findOutcomeMeasure(id: string): OutcomeMeasure | null {
  return OUTCOME_MEASURES.find((m) => m.id === id) ?? null;
}

/** The one-line summary shown under the picker once a measure is chosen. Says plainly when
 *  there is no MCID to fill in, so a blank field reads as a fact about the literature rather
 *  than as something the picker failed to do. */
export function measureSummary(measure: OutcomeMeasure): string {
  const mcid =
    measure.mcid === null
      ? `No single MCID: ${measure.mcidNote.charAt(0).toLowerCase()}${measure.mcidNote.slice(1)}.`
      : `MCID ${measure.mcid} ${measure.unit}${measure.mcidNote ? ` (${measure.mcidNote.toLowerCase()})` : ""}.`;
  const mdc =
    measure.mdc === null
      ? measure.mdcNote
        ? ` MDC: ${measure.mdcNote.charAt(0).toLowerCase()}${measure.mdcNote.slice(1)}.`
        : ""
      : ` MDC ${measure.mdc} ${measure.unit}${measure.mdcNote ? ` (${measure.mdcNote.toLowerCase()})` : ""}.`;
  return `${mcid}${mdc}`;
}
