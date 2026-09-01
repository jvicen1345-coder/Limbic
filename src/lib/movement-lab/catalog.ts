/**
 * The exercise catalogue itself — aggregation and querying, with no knowledge of protocols.
 *
 * Split out from index.ts specifically to keep the module graph acyclic: protocols.ts needs
 * to look exercises up by id, and index.ts re-exports both, so if the lookup lived in
 * index.ts the two would import each other. A cycle would technically resolve, but it would
 * mean `MOVEMENT_EXERCISE_BY_ID` (built at module load) could be read half-initialised
 * depending on which module the bundler happened to evaluate first. Consumers should still
 * import from `@/lib/movement-lab`, not from here.
 */

import type {
  MovementCategory,
  MovementEquipment,
  MovementExercise,
  MovementPosition,
  MovementRegion,
  RehabPhase,
} from "@/lib/movement-lab/types";
import { MOVEMENT_REGIONS } from "@/lib/movement-lab/types";
import { CERVICAL_EXERCISES } from "@/lib/movement-lab/exercises/cervical";
import { THORACIC_EXERCISES } from "@/lib/movement-lab/exercises/thoracic";
import { LUMBAR_CORE_EXERCISES } from "@/lib/movement-lab/exercises/lumbar-core";
import { SHOULDER_EXERCISES } from "@/lib/movement-lab/exercises/shoulder";
import { UPPER_LIMB_EXERCISES } from "@/lib/movement-lab/exercises/upper-limb";
import { HIP_EXERCISES } from "@/lib/movement-lab/exercises/hip";
import { KNEE_EXERCISES } from "@/lib/movement-lab/exercises/knee";
import { ANKLE_FOOT_EXERCISES } from "@/lib/movement-lab/exercises/ankle-foot";
import { NEURO_BALANCE_EXERCISES } from "@/lib/movement-lab/exercises/neuro-balance";
import { CONDITIONING_EXERCISES } from "@/lib/movement-lab/exercises/conditioning";

/** Every exercise in the bank, in MOVEMENT_REGIONS order so an unfiltered list reads
 *  head-to-toe rather than in whatever order the imports happen to sit in. Adding an
 *  eleventh region file means changing exactly one line here. */
export const MOVEMENT_EXERCISES: MovementExercise[] = [
  ...CERVICAL_EXERCISES,
  ...THORACIC_EXERCISES,
  ...LUMBAR_CORE_EXERCISES,
  ...SHOULDER_EXERCISES,
  ...UPPER_LIMB_EXERCISES,
  ...HIP_EXERCISES,
  ...KNEE_EXERCISES,
  ...ANKLE_FOOT_EXERCISES,
  ...NEURO_BALANCE_EXERCISES,
  ...CONDITIONING_EXERCISES,
];

/** Built once at module load. protocols.ts references exercises by id, so a typo there would
 *  otherwise surface as a silently missing exercise in a loaded program — see
 *  resolveProtocolSteps, which drops unresolved ids rather than rendering a blank row, and
 *  e2e/movement-lab.spec.ts, which fails if any protocol id doesn't resolve here. */
export const MOVEMENT_EXERCISE_BY_ID: ReadonlyMap<string, MovementExercise> = new Map(
  MOVEMENT_EXERCISES.map((ex) => [ex.id, ex]),
);

export function getMovementExercise(id: string): MovementExercise | undefined {
  return MOVEMENT_EXERCISE_BY_ID.get(id);
}

/** Region → count, for the browse page's region chips. Every region is present (possibly 0)
 *  so the chip row is stable as the bank grows — the same reasoning as
 *  getHepTemplatesAction's pre-seeded body-part buckets in app/actions/hep.ts. */
export const MOVEMENT_LAB_COUNTS: Record<MovementRegion, number> = MOVEMENT_REGIONS.reduce(
  (acc, region) => {
    acc[region] = MOVEMENT_EXERCISES.filter((ex) => ex.region === region).length;
    return acc;
  },
  {} as Record<MovementRegion, number>,
);

export const MOVEMENT_LAB_TOTAL = MOVEMENT_EXERCISES.length;

/** Every filter is optional, and `undefined` means "no constraint on this axis" — the browse
 *  page keeps one piece of state per axis and passes the lot straight through rather than
 *  branching on which filters happen to be active. */
export interface MovementFilters {
  region?: MovementRegion;
  category?: MovementCategory;
  position?: MovementPosition;
  equipment?: MovementEquipment;
  phase?: RehabPhase;
  /** Inclusive upper bound — "show me everything this patient could manage, or easier". */
  maxDifficulty?: number;
}

export function filterExercises(
  exercises: readonly MovementExercise[],
  filters: MovementFilters,
): MovementExercise[] {
  return exercises.filter((ex) => {
    if (filters.region && ex.region !== filters.region) return false;
    if (filters.category && ex.category !== filters.category) return false;
    if (filters.position && !ex.positions.includes(filters.position)) return false;
    if (filters.equipment && !ex.equipment.includes(filters.equipment)) return false;
    if (filters.phase && !ex.phases.includes(filters.phase)) return false;
    if (filters.maxDifficulty != null && ex.difficulty > filters.maxDifficulty) return false;
    return true;
  });
}

/**
 * True when `term` occurs in `haystack` at the start of a word — it need not finish one.
 *
 * This is deliberately stricter than `includes` and looser than a full word match, because
 * both of those are wrong here in opposite directions. Plain `includes` matches inside a
 * word, which is how a search for "RDL" used to return every exercise targeting a shoulder
 * or pelvic *girdle* — and short clinical acronyms (RDL, SLR, ACL, ITB) are exactly the
 * queries where buried substrings are common enough to bury the real answer. Requiring a
 * whole word instead would break typing: the browse page filters on every keystroke, so
 * "shoul" has to keep matching "shoulder" while the clinician is still typing it.
 *
 * A word starts at the beginning of the string or after any non-alphanumeric character, so
 * hyphens and slashes count as boundaries — "foot" still finds "rear-foot-elevated" and "90"
 * still finds "90/90". Both arguments are expected already lowercased.
 */
function matchesWordPrefix(haystack: string, term: string): boolean {
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(term, from);
    if (at === -1) return false;
    if (at === 0 || !/[a-z0-9]/.test(haystack[at - 1])) return true;
    from = at + 1;
  }
}

/** Fields a free-text term is matched against, ordered by how strongly a hit in each one
 *  suggests the clinician found what they were after. `indications` is in here because
 *  searching by condition ("plantar", "ACL", "sciatica") is how a clinician actually looks
 *  for an exercise, and `aka` because they type the name they were taught rather than the
 *  one this bank happens to use. Every field below matches on a word prefix rather than a
 *  bare substring — see matchesWordPrefix for why. */
function searchScore(ex: MovementExercise, term: string): number {
  const name = ex.name.toLowerCase();
  if (name === term) return 100;
  if (name.startsWith(term)) return 80;
  if (matchesWordPrefix(name, term)) return 60;
  if (ex.aka?.some((a) => matchesWordPrefix(a.toLowerCase(), term))) return 50;
  if (ex.indications.some((i) => matchesWordPrefix(i.toLowerCase(), term))) return 40;
  if (ex.targets.some((t) => matchesWordPrefix(t.toLowerCase(), term))) return 30;
  if (matchesWordPrefix(ex.region.toLowerCase(), term) || matchesWordPrefix(ex.category.toLowerCase(), term)) return 20;
  if (matchesWordPrefix(ex.cue.toLowerCase(), term) || matchesWordPrefix(ex.setup.toLowerCase(), term)) return 10;
  return 0;
}

/**
 * Free-text search plus filters, ranked. A multi-word query must match every word somewhere
 * — each word is scored independently and a zero on any word rules the exercise out — so
 * "shoulder band" narrows rather than widens. An OR-match would return every shoulder
 * exercise plus every band exercise, which at this bank's size is no better than no search.
 */
export function searchExercises(query: string, filters: MovementFilters = {}): MovementExercise[] {
  const filtered = filterExercises(MOVEMENT_EXERCISES, filters);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return filtered;

  const scored: { ex: MovementExercise; score: number }[] = [];
  for (const ex of filtered) {
    let total = 0;
    let matchedAll = true;
    for (const term of terms) {
      const score = searchScore(ex, term);
      if (score === 0) {
        matchedAll = false;
        break;
      }
      total += score;
    }
    if (matchedAll) scored.push({ ex, score: total });
  }

  // Ties broken by name so the order is stable between renders rather than depending on the
  // sort implementation — a list that reshuffles as you type is hard to click.
  scored.sort((a, b) => b.score - a.score || a.ex.name.localeCompare(b.ex.name));
  return scored.map((s) => s.ex);
}
