/**
 * Limbic Appraisals — the structured-entry alternative to summarising someone else's
 * article.
 *
 * The whole design turns on one constraint: **no publisher text ever enters this system.**
 * There is deliberately no "paste the abstract here" field anywhere in the form
 * (components/admin/AppraisalEditor.tsx), no fetch of a paywalled page, and nothing sent to
 * Anthropic except the fields typed below. What gets entered is what a reader extracted —
 * sample sizes, an effect estimate and its interval, a follow-up length, an outcome
 * measure's name. Those are facts about a study, and facts are not copyrightable; the
 * sentences an author used to report them are. Uploading the PDF to a model would breach
 * most publishers' subscriber terms at the moment of upload regardless of what was
 * published afterwards, so the upload simply does not exist as a code path.
 *
 * The second reason for the shape is editorial, not legal. A field for "number randomised"
 * next to a field for "number analysed" cannot be filled in from an abstract — it needs the
 * flow diagram. Requiring the numbers *is* the appraisal discipline, and the gap between
 * those two numbers is usually the story an abstract does not tell.
 *
 * Everything in this file is pure and deterministic. The verdicts a reader sees on an
 * appraisal come from arithmetic over the entered numbers, never from a model: an effect
 * that fails to clear its MCID is a comparison of two typed values, and it should be
 * impossible for the prose to disagree with it. lib/appraisal-draft.ts writes the prose and
 * is given the output of runAppraisalChecks() so it can describe the verdicts, but it never
 * computes one.
 */

export const APPRAISAL_STATUSES = ["draft", "published"] as const;
export type AppraisalStatus = (typeof APPRAISAL_STATUSES)[number];

/** How the appraiser actually read the study. Recorded per appraisal and shown to readers,
 *  because "I read the full text" and "I only had the abstract" support very different
 *  claims — an abstract-only appraisal cannot honestly comment on attrition or on whether
 *  the primary outcome was switched, and this field is what stops that distinction from
 *  quietly disappearing once the piece is written. It is also the provenance record: if a
 *  publisher ever asks how their paper was used, the answer for every appraisal on file is
 *  a stored enum value and a set of numbers, not a reconstruction from memory. */
export const SOURCE_ACCESS = ["open_access", "full_text_licensed", "abstract_only"] as const;
export type SourceAccess = (typeof SOURCE_ACCESS)[number];

export const SOURCE_ACCESS_LABELS: Record<SourceAccess, string> = {
  open_access: "Open access full text",
  full_text_licensed: "Full text via subscription",
  abstract_only: "Abstract only",
};

/** Difference measures (mean differences, differences in change scores) share units with
 *  the outcome measure, so they can be compared against an MCID. Ratio measures (risk
 *  ratios, odds ratios, hazard ratios) cannot — an MCID is expressed in an instrument's
 *  points, and there is no meaningful comparison between "1.4x" and "2 points on the NPRS".
 *  The checks below refuse the comparison rather than performing a plausible-looking one. */
export const EFFECT_MEASURES = ["difference", "ratio"] as const;
export type EffectMeasure = (typeof EFFECT_MEASURES)[number];

/** The value at which an effect measure means "no effect" — zero for a difference, one for
 *  a ratio. Used only to decide whether a confidence interval spans it. */
export function nullValueFor(measure: EffectMeasure): number {
  return measure === "ratio" ? 1 : 0;
}

/**
 * Everything an appraiser types. Every numeric field is nullable because "not reported" is a
 * real and common state in the literature, and it has to be distinguishable from zero — a
 * trial that never states its attrition is a different object from one that reports none.
 * The checks below say "not reported" rather than assuming a value, which is the same rule
 * the app's other research tools follow (see lib/generalizability-score.ts).
 */
export interface AppraisalInput {
  // — Citation. Identifies the paper; none of it is the paper's own prose. —
  title: string;
  authors: string;
  journal: string;
  year: number | null;
  doi: string;
  pmid: string;
  sourceUrl: string;

  // — Design, in the appraiser's own words. Short labels, not the paper's sentences. —
  design: string;
  population: string;
  setting: string;
  intervention: string;
  comparator: string;
  followUpWeeks: number | null;

  // — The numbers. This is where the value is. —
  nRandomised: number | null;
  nAnalysed: number | null;
  primaryOutcomeName: string;
  effectMeasure: EffectMeasure;
  effectPoint: number | null;
  effectCiLower: number | null;
  effectCiUpper: number | null;
  effectUnit: string;
  /** The published minimal clinically important difference for this outcome measure, as a
   *  positive magnitude regardless of which direction favours the intervention. */
  mcid: number | null;
  /** Where that MCID came from. Required in practice — an MCID with no citation behind it
   *  is a number someone remembered, and the whole point of the magnitude check is that a
   *  reader can go and check it. */
  mcidSource: string;
  /** Free text, so "<0.001" and "0.04" are both enterable. Never parsed or compared. */
  pValue: string;

  // — Integrity signals. Only answerable from the full text or a registry record. —
  registered: boolean;
  registrationId: string;
  primaryOutcomeChanged: boolean;
  fundingSource: string;
  conflictsDeclared: boolean;

  // — Provenance and the appraiser's own take. —
  sourceAccess: SourceAccess;
  /** The appraiser's own notes, in their own words. Passed to the drafting model as the
   *  editorial line to develop — this is the one field that carries a point of view, and it
   *  is the reason the finished piece is an appraisal rather than a summary. */
  notes: string;
}

export type CheckVerdict = "ok" | "caution" | "concern" | "unknown";

export interface AppraisalCheck {
  id: string;
  label: string;
  verdict: CheckVerdict;
  /** One plain sentence stating what the numbers show. Written here, deterministically, so
   *  it is the same sentence every time the same numbers are entered. */
  detail: string;
}

/** Conventional threshold for attrition that threatens a trial's conclusions. Not a law of
 *  nature — it is the commonly cited 20% rule of thumb, flagged as a prompt to think rather
 *  than as a verdict, which is why it produces "caution" and not "concern". */
const ATTRITION_CAUTION = 0.2;
/** Above this, the analysed sample has diverged far enough from the randomised one that
 *  intention-to-treat is doing a lot of work. */
const ATTRITION_CONCERN = 0.4;

function round(value: number, places = 1): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/** Whether the interval spans the no-effect value, i.e. the data are compatible with the
 *  intervention doing nothing. Returns null when either bound is missing. */
export function intervalCrossesNull(input: AppraisalInput): boolean | null {
  const { effectCiLower: lo, effectCiUpper: hi } = input;
  if (lo === null || hi === null) return null;
  const nullValue = nullValueFor(input.effectMeasure);
  const low = Math.min(lo, hi);
  const high = Math.max(lo, hi);
  return low <= nullValue && nullValue <= high;
}

/** The end of the confidence interval nearest to no effect, as a magnitude — the smallest
 *  effect the data are reasonably compatible with. Only meaningful for difference measures
 *  whose interval excludes the null; returns null otherwise, rather than a number that would
 *  read as an answer. */
export function smallestPlausibleEffect(input: AppraisalInput): number | null {
  if (input.effectMeasure !== "difference") return null;
  if (input.effectCiLower === null || input.effectCiUpper === null) return null;
  if (intervalCrossesNull(input)) return null;
  return Math.min(Math.abs(input.effectCiLower), Math.abs(input.effectCiUpper));
}

/**
 * The whole deterministic layer, in the order a reader should meet it. Every check is
 * arithmetic over entered values or a direct restatement of an entered flag; none of it is
 * a judgment, and none of it is generated. A field that was not entered produces an
 * "unknown" check saying so, which is information in its own right — an appraisal with four
 * unknowns is visibly thinner than one with none, and hiding the empties would conceal that.
 */
export function runAppraisalChecks(input: AppraisalInput): AppraisalCheck[] {
  const checks: AppraisalCheck[] = [];
  const unit = input.effectUnit.trim();
  const unitSuffix = unit ? ` ${unit}` : "";

  // 1. Does the interval exclude no effect at all?
  const crosses = intervalCrossesNull(input);
  if (crosses === null) {
    checks.push({
      id: "precision",
      label: "Confidence interval",
      verdict: "unknown",
      detail: "No confidence interval was entered, so the range of effects compatible with this data is unknown.",
    });
  } else {
    const nullLabel = input.effectMeasure === "ratio" ? "1" : "0";
    checks.push({
      id: "precision",
      label: "Confidence interval",
      verdict: crosses ? "concern" : "ok",
      detail: crosses
        ? `The interval (${input.effectCiLower} to ${input.effectCiUpper}) includes ${nullLabel}, so no effect at all is compatible with this data.`
        : `The interval (${input.effectCiLower} to ${input.effectCiUpper}) excludes ${nullLabel}.`,
    });
  }

  // 2. Does the point estimate clear the smallest difference a patient would notice?
  if (input.effectMeasure === "ratio") {
    checks.push({
      id: "magnitude",
      label: "Clinical magnitude",
      verdict: "unknown",
      detail:
        "The effect is reported as a ratio, which has no shared units with an MCID — the magnitude comparison does not apply to this measure.",
    });
  } else if (input.effectPoint === null || input.mcid === null) {
    checks.push({
      id: "magnitude",
      label: "Clinical magnitude",
      verdict: "unknown",
      detail:
        input.effectPoint === null
          ? "No point estimate was entered, so it cannot be compared against the MCID."
          : "No MCID was entered for this outcome measure, so the effect cannot be placed against one.",
    });
  } else {
    const magnitude = Math.abs(input.effectPoint);
    const clears = magnitude >= input.mcid;
    checks.push({
      id: "magnitude",
      label: "Clinical magnitude",
      verdict: clears ? "ok" : "concern",
      detail: clears
        ? `The effect (${magnitude}${unitSuffix}) reaches the MCID of ${input.mcid}${unitSuffix}.`
        : `The effect (${magnitude}${unitSuffix}) is smaller than the MCID of ${input.mcid}${unitSuffix} — below the smallest difference a patient would be expected to notice.`,
    });

    // 3. And is that still true at the pessimistic end of the interval?
    const smallest = smallestPlausibleEffect(input);
    if (smallest !== null) {
      const robust = smallest >= input.mcid;
      checks.push({
        id: "robustness",
        label: "Worst case within the interval",
        verdict: robust ? "ok" : "caution",
        detail: robust
          ? `Even the smallest effect the interval allows (${round(smallest, 2)}${unitSuffix}) reaches the MCID.`
          : `The smallest effect the interval allows (${round(smallest, 2)}${unitSuffix}) falls below the MCID of ${input.mcid}${unitSuffix}, so a clinically meaningless result is compatible with this data.`,
      });
    }
  }

  // 4. How many of the randomised participants made it into the analysis?
  if (input.nRandomised === null || input.nAnalysed === null) {
    checks.push({
      id: "attrition",
      label: "Attrition",
      verdict: "unknown",
      detail: "Randomised and analysed sample sizes were not both entered, so loss to follow-up is unknown.",
    });
  } else if (input.nRandomised <= 0) {
    checks.push({
      id: "attrition",
      label: "Attrition",
      verdict: "unknown",
      detail: "The randomised sample size entered is not a usable number, so attrition cannot be calculated.",
    });
  } else {
    const lost = input.nRandomised - input.nAnalysed;
    const rate = lost / input.nRandomised;
    const pct = round(rate * 100);
    const verdict: CheckVerdict = rate >= ATTRITION_CONCERN ? "concern" : rate >= ATTRITION_CAUTION ? "caution" : "ok";
    checks.push({
      id: "attrition",
      label: "Attrition",
      verdict,
      detail:
        lost <= 0
          ? `All ${input.nRandomised} randomised participants were analysed.`
          : `${lost} of ${input.nRandomised} randomised participants (${pct}%) were not in the analysis.`,
    });
  }

  // 5. Was the outcome the paper leads with the one it said it would measure?
  if (!input.registered) {
    checks.push({
      id: "registration",
      label: "Prospective registration",
      verdict: "caution",
      detail: "No trial registration was recorded, so the reported primary outcome cannot be checked against a pre-specified one.",
    });
  } else if (input.primaryOutcomeChanged) {
    checks.push({
      id: "registration",
      label: "Prospective registration",
      verdict: "concern",
      detail: `Registered as ${input.registrationId || "a registered trial"}, but the primary outcome reported differs from the registered one.`,
    });
  } else {
    checks.push({
      id: "registration",
      label: "Prospective registration",
      verdict: "ok",
      detail: `Registered as ${input.registrationId || "a registered trial"}, with the reported primary outcome matching the registered one.`,
    });
  }

  // 6. Long enough to say anything about durability?
  if (input.followUpWeeks === null) {
    checks.push({
      id: "followUp",
      label: "Follow-up",
      verdict: "unknown",
      detail: "No follow-up duration was entered.",
    });
  } else {
    checks.push({
      id: "followUp",
      label: "Follow-up",
      verdict: input.followUpWeeks >= 26 ? "ok" : "caution",
      detail:
        input.followUpWeeks >= 26
          ? `Followed up to ${input.followUpWeeks} weeks.`
          : `Followed up to ${input.followUpWeeks} weeks, which says nothing about whether the effect lasts.`,
    });
  }

  // 7. Who paid, and did they say so.
  checks.push({
    id: "conflicts",
    label: "Funding and conflicts",
    verdict: input.conflictsDeclared ? "ok" : "caution",
    // "not recorded" either way when the funding field is blank — a declared conflict of
    // interest says nothing about who paid, and writing "stated in the paper" for a field
    // nobody filled in would put a claim about the study into a check that has no basis
    // for it.
    detail: input.conflictsDeclared
      ? `Funding: ${input.fundingSource || "not recorded"}. Conflicts of interest were declared.`
      : `Funding: ${input.fundingSource || "not recorded"}. No conflict-of-interest declaration was recorded.`,
  });

  return checks;
}

/** The one-line verdict a feed card carries, derived from the checks rather than written.
 *  Ordered by severity so the worst thing the numbers show is the thing a reader sees
 *  first — an appraisal whose interval crosses zero should not lead with its follow-up. */
export function headlineVerdict(checks: AppraisalCheck[]): AppraisalCheck | null {
  return (
    checks.find((c) => c.id === "magnitude" && c.verdict === "concern") ??
    checks.find((c) => c.verdict === "concern") ??
    checks.find((c) => c.verdict === "caution") ??
    checks.find((c) => c.verdict === "ok") ??
    null
  );
}

/** Reading time from the finished prose, at a deliberately unhurried 200 words a minute —
 *  these are appraisals of research, not news items, and a minimum of one minute stops a
 *  short one rendering as "0 min". */
export function readMinsFor(body: string[]): number {
  const words = body.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** An empty form. Exported so the editor and the server action agree on what "unset" means
 *  rather than each spelling out its own defaults. */
export function emptyAppraisalInput(): AppraisalInput {
  return {
    title: "",
    authors: "",
    journal: "",
    year: null,
    doi: "",
    pmid: "",
    sourceUrl: "",
    design: "",
    population: "",
    setting: "",
    intervention: "",
    comparator: "",
    followUpWeeks: null,
    nRandomised: null,
    nAnalysed: null,
    primaryOutcomeName: "",
    effectMeasure: "difference",
    effectPoint: null,
    effectCiLower: null,
    effectCiUpper: null,
    effectUnit: "",
    mcid: null,
    mcidSource: "",
    pValue: "",
    registered: false,
    registrationId: "",
    primaryOutcomeChanged: false,
    fundingSource: "",
    conflictsDeclared: false,
    sourceAccess: "abstract_only",
    notes: "",
  };
}

/** What must be present before an appraisal can be published. Deliberately short: the
 *  checks above already make a thin appraisal look thin, so this guards identification and
 *  the appraiser's own contribution rather than trying to enforce completeness. */
export function publishBlockers(input: AppraisalInput, body: string[]): string[] {
  const blockers: string[] = [];
  if (!input.title.trim()) blockers.push("The study needs a title.");
  if (!input.sourceUrl.trim() && !input.doi.trim() && !input.pmid.trim()) {
    blockers.push("A DOI, PMID, or link is needed so readers can reach the paper.");
  }
  if (!input.notes.trim()) blockers.push("Your own take is the appraisal — write the notes before publishing.");
  if (body.filter((p) => p.trim()).length === 0) blockers.push("There is no written body to publish yet.");
  if (input.mcid !== null && !input.mcidSource.trim()) {
    blockers.push("An MCID needs a citation — readers have to be able to check it.");
  }
  return blockers;
}
