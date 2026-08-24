/** Pure math, no server dependency — deliberately separate from lib/article-variables.ts
 *  (which does the "server-only" LLM extraction) so the client component can call this
 *  directly on the already-fetched variable list without a network round trip every time
 *  the reader switches which variable they're looking at.
 *
 *  There's no raw dataset behind any of this — an abstract only ever reports summary
 *  statistics (mean/SD, or median/range). So rather than asking the model to invent bin
 *  counts (a real fabrication risk it has no way to ground), this reconstructs an
 *  approximate bell-shaped distribution deterministically from whatever summary stats were
 *  actually extracted, using a split-normal (two-piece normal) curve — one SD estimate for
 *  the half below the center, another for the half above — which is the simplest standard
 *  way to represent an asymmetric bell shape from a single center + spread + skew
 *  direction. Every caller must present this as an illustrative reconstruction, not the
 *  study's actual raw data (see ArticleHistogramExplorer.tsx's caption).
 */

export type ArticleVariableShape = "normal" | "right-skewed" | "left-skewed" | "unknown";

export interface ArticleVariable {
  name: string;
  unit: string | null;
  n: number | null;
  mean: number | null;
  sd: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  shape: ArticleVariableShape;
}

export interface HistogramBin {
  label: string;
  heightPct: number;
}

const BIN_COUNT = 9;
// How much wider the "far" side's spread is than the "near" side's, for a skewed shape —
// asymmetric enough to visibly read as skewed without exaggerating past what a shape hint
// alone (no real skewness statistic) justifies.
const SKEW_WIDE_FACTOR = 1.6;
const SKEW_NARROW_FACTOR = 0.7;

// Unit is deliberately left off bin-edge labels — repeating it across 9 bins is noisy, and
// the caller already states it once in the variable's summary line (see formatStat in
// ArticleHistogramExplorer.tsx).
function formatBinEdge(v: number): string {
  return Math.abs(v) >= 100 ? String(Math.round(v)) : String(Math.round(v * 10) / 10);
}

/** Returns null when the variable doesn't carry enough reported detail to build even an
 *  approximate shape — no mean/median to center on, or no way to estimate a spread. The
 *  component treats null as "can't plot this one," not an error. */
export function buildHistogramBins(v: ArticleVariable): HistogramBin[] | null {
  const center = v.mean ?? v.median;
  if (center == null) return null;

  let sd = v.sd;
  if (sd == null && v.min != null && v.max != null && v.max > v.min) {
    // Range rule of thumb: for a roughly bell-shaped sample, the full range is commonly
    // ~4 SDs wide. A rough stand-in only for when the abstract gave a range but no SD.
    sd = (v.max - v.min) / 4;
  }
  if (sd == null || sd <= 0) return null;

  const lowerSd = v.shape === "right-skewed" ? sd * SKEW_NARROW_FACTOR : v.shape === "left-skewed" ? sd * SKEW_WIDE_FACTOR : sd;
  const upperSd = v.shape === "right-skewed" ? sd * SKEW_WIDE_FACTOR : v.shape === "left-skewed" ? sd * SKEW_NARROW_FACTOR : sd;

  const lo = v.min ?? center - 3 * lowerSd;
  const hi = v.max ?? center + 3 * upperSd;
  if (!(hi > lo)) return null;

  const binWidth = (hi - lo) / BIN_COUNT;
  const densities: number[] = [];
  for (let i = 0; i < BIN_COUNT; i++) {
    const x = lo + binWidth * (i + 0.5);
    const sigma = x < center ? lowerSd : upperSd;
    const z = (x - center) / sigma;
    densities.push(Math.exp(-0.5 * z * z));
  }
  const maxDensity = Math.max(...densities);

  return densities.map((d, i) => {
    const binLo = lo + binWidth * i;
    const binHi = binLo + binWidth;
    return {
      label: `${formatBinEdge(binLo)}–${formatBinEdge(binHi)}`,
      heightPct: Math.max(4, Math.round((d / maxDensity) * 100)),
    };
  });
}
