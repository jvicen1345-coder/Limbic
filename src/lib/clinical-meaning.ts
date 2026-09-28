import { OUTCOME_MEASURES, type OutcomeMeasure } from "@/lib/outcome-measures";
import type { ExtractedEffect } from "@/lib/article-breakdown-shared";

/**
 * "Does it matter?" for a study breakdown — compares the effects a breakdown extracted from
 * an abstract (see ExtractedEffect in lib/article-breakdown-shared.ts) against the published
 * MCIDs in lib/outcome-measures.ts.
 *
 * Same rule as lib/appraisal.ts: the verdict is arithmetic over numbers, never a model's
 * opinion. The model's only job upstream was to copy the numbers out of the abstract; this
 * file decides what they mean, and says so in a sentence built from those same numbers.
 *
 * It is deliberately conservative, because a wrong "clinically meaningful" badge is worse
 * than none:
 *  - Only between-group effects count. A within-group change says the treated group
 *    improved, not that the treatment beat the comparison.
 *  - Only measures with a single accepted MCID (lib/outcome-measures.ts leaves the rest
 *    null on purpose) are judged.
 *  - An estimate larger than the measure's whole scale is taken as a unit mismatch (a 0-100
 *    VAS reported under an NPRS name, a percentage change) and skipped rather than judged.
 */

export type MeaningVerdict = "likely" | "uncertain" | "unlikely";

export interface ClinicalMeaning {
  measure: OutcomeMeasure;
  effect: ExtractedEffect;
  verdict: MeaningVerdict;
  /** One plain sentence built from the numbers. */
  detail: string;
}

/** How each judgeable measure is recognized in free text, and the largest magnitude a
 *  between-group difference on it can have. */
const MATCHERS: Record<string, { patterns: RegExp[]; scaleMax: number }> = {
  nprs: { patterns: [/\bNPRS\b/i, /\bnumeric (pain )?rating scale\b/i, /\bNRS\b/], scaleMax: 10 },
  odi: { patterns: [/\bODI\b/, /\boswestry\b/i], scaleMax: 100 },
  // Full DASH only — QuickDASH has its own, different MCID and must not borrow this one.
  dash: { patterns: [/(?<![A-Za-z-])DASH\b/, /\bdisabilities of the arm\b/i], scaleMax: 100 },
  lefs: { patterns: [/\bLEFS\b/, /\blower extremity functional scale\b/i], scaleMax: 80 },
  psfs: { patterns: [/\bPSFS\b/, /\bpatient[- ]specific functional scale\b/i], scaleMax: 10 },
  fga: { patterns: [/\bFGA\b/, /\bfunctional gait assessment\b/i], scaleMax: 30 },
};

export function matchMeasure(outcome: string): OutcomeMeasure | null {
  for (const measure of OUTCOME_MEASURES) {
    if (measure.mcid === null) continue;
    const matcher = MATCHERS[measure.id];
    if (matcher?.patterns.some((re) => re.test(outcome))) return measure;
  }
  return null;
}

function fmt(n: number): string {
  return String(Math.round(n * 100) / 100);
}

export function assessEffect(effect: ExtractedEffect): ClinicalMeaning | null {
  if (effect.comparison !== "between-group") return null;
  if (!Number.isFinite(effect.estimate)) return null;
  const measure = matchMeasure(effect.outcome);
  if (!measure || measure.mcid === null) return null;
  const { scaleMax } = MATCHERS[measure.id];
  const magnitude = Math.abs(effect.estimate);
  if (magnitude > scaleMax) return null;
  if (/%|percent/i.test(effect.unit) && measure.id !== "odi") return null;

  const mcid = measure.mcid;
  const unit = measure.unit;
  const name = measure.abbreviation;
  const hasCi = effect.ciLower !== null && effect.ciUpper !== null;

  if (hasCi) {
    const lo = Math.min(effect.ciLower!, effect.ciUpper!);
    const hi = Math.max(effect.ciLower!, effect.ciUpper!);
    if (lo <= 0 && hi >= 0) {
      return {
        measure,
        effect,
        verdict: "unlikely",
        detail: `The ${name} difference (${fmt(effect.estimate)}, 95% CI ${fmt(lo)} to ${fmt(hi)}) includes zero, so no difference between groups is compatible with the data.`,
      };
    }
    const nearest = Math.min(Math.abs(lo), Math.abs(hi));
    if (magnitude < mcid) {
      return {
        measure,
        effect,
        verdict: "unlikely",
        detail: `The ${name} difference of ${fmt(magnitude)} ${unit} is smaller than its MCID of ${mcid} ${unit}, the smallest change patients typically notice.`,
      };
    }
    if (nearest >= mcid) {
      return {
        measure,
        effect,
        verdict: "likely",
        detail: `The ${name} difference of ${fmt(magnitude)} ${unit} clears its MCID of ${mcid} ${unit}, and so does the most cautious end of the confidence interval (${fmt(nearest)}).`,
      };
    }
    return {
      measure,
      effect,
      verdict: "uncertain",
      detail: `The ${name} difference of ${fmt(magnitude)} ${unit} clears its MCID of ${mcid} ${unit}, but the confidence interval reaches down to ${fmt(nearest)}, below it.`,
    };
  }

  if (magnitude < mcid) {
    return {
      measure,
      effect,
      verdict: "unlikely",
      detail: `The ${name} difference of ${fmt(magnitude)} ${unit} is smaller than its MCID of ${mcid} ${unit}, the smallest change patients typically notice.`,
    };
  }
  return {
    measure,
    effect,
    verdict: "uncertain",
    detail: `The ${name} difference of ${fmt(magnitude)} ${unit} reaches its MCID of ${mcid} ${unit}, but no confidence interval was reported, so the precision is unknown.`,
  };
}

export function assessEffects(effects: ExtractedEffect[] | undefined): ClinicalMeaning[] {
  if (!effects) return [];
  const seen = new Set<string>();
  const out: ClinicalMeaning[] = [];
  for (const effect of effects) {
    const result = assessEffect(effect);
    if (!result || seen.has(result.measure.id)) continue;
    seen.add(result.measure.id);
    out.push(result);
  }
  return out;
}

export const MEANING_LABELS: Record<MeaningVerdict, string> = {
  likely: "Likely meaningful",
  uncertain: "Uncertain",
  unlikely: "Unlikely meaningful",
};
