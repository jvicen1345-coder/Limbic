/**
 * Spaced-review schedule for Focus timer recall topics (see RecallEntry in
 * prisma/schema.prisma and app/actions/focus.ts). Pure functions only, so the schedule can
 * be unit-tested without a database or a model call.
 *
 * A topic climbs one rung of REVIEW_INTERVAL_DAYS each time it is recalled well, stays on
 * its rung after a partial recall, and drops back to the first rung after a weak one. The
 * ladder starts at 1-3-7 days, the spacing students already know from most spaced-repetition
 * advice, and stretches out from there so a well-known topic stops taking up review time.
 */
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30, 60] as const;

/** Scores at or above this move a topic to its next rung. */
export const STRONG_RECALL = 80;
/** Scores below this send a topic back to the first rung. */
export const WEAK_RECALL = 50;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The rung a topic moves to after a recall attempt. `score` is Claude's 0-100 estimate of
 * how complete and accurate the recall was (see lib/focus-recall.ts); null means the
 * student only named the topic without writing anything to check, which keeps it on the
 * first rung so it comes back tomorrow.
 */
export function nextReviewStage(currentStage: number, score: number | null): number {
  const last = REVIEW_INTERVAL_DAYS.length - 1;
  const stage = Math.min(Math.max(0, Math.floor(currentStage)), last);
  if (score === null || score < WEAK_RECALL) return 0;
  if (score >= STRONG_RECALL) return Math.min(stage + 1, last);
  return stage;
}

/** When a topic on `stage` should come back, counted from `from`. */
export function nextReviewDate(from: Date, stage: number): Date {
  const last = REVIEW_INTERVAL_DAYS.length - 1;
  const days = REVIEW_INTERVAL_DAYS[Math.min(Math.max(0, Math.floor(stage)), last)];
  return new Date(from.getTime() + days * DAY_MS);
}

/**
 * The rung a brand-new topic starts on after its first recall, right after the focus block
 * that covered it. A strong first recall skips the one-day review and comes back in three
 * days; anything else comes back tomorrow.
 */
export function initialReviewStage(score: number | null): number {
  return score !== null && score >= STRONG_RECALL ? 1 : 0;
}
