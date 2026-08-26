/** Pure pattern checks over a patient's outcome history and visit cadence — no I/O, no
 *  server-only restriction, so this can be unit-tested in isolation. checkRedFlags in
 *  app/actions/clinician-dashboard.ts is the only caller — it's what turns a detected
 *  pattern into a persisted (and dedupable) RedFlagAlert row. */

interface OutcomeLike {
  score: number;
  maxScore: number;
  recordedAt: Date;
  measureName: string;
}

const RED_FLAG_PATTERNS: {
  type: string;
  check: (outcomes: OutcomeLike[], visitCount: number, lastSeen: Date | null) => string | null;
}[] = [
  {
    type: "declining_outcomes",
    check: (outcomes) => {
      if (outcomes.length < 3) return null;
      const sorted = [...outcomes].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
      const recent = sorted.slice(-3);
      const firstPct = recent[0].score / recent[0].maxScore;
      const lastPct = recent[2].score / recent[2].maxScore;
      if (lastPct < firstPct - 0.1) {
        return `${recent[2].measureName} has declined more than 10% over the last 3 recorded sessions`;
      }
      return null;
    },
  },
  {
    type: "no_progress",
    check: (outcomes) => {
      if (outcomes.length < 4) return null;
      const sorted = [...outcomes].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
      const recent = sorted.slice(-4);
      const scores = recent.map((o) => o.score / o.maxScore);
      const range = Math.max(...scores) - Math.min(...scores);
      if (range < 0.03) {
        return `${recent[0].measureName} has shown no meaningful change over the last 4 recorded sessions`;
      }
      return null;
    },
  },
  {
    type: "overdue_reassessment",
    check: (_outcomes, _visitCount, lastSeen) => {
      if (!lastSeen) return null;
      const daysSince = Math.floor((Date.now() - new Date(lastSeen).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > 21) {
        return `Patient has not been seen in ${daysSince} days — consider reassessment or discharge`;
      }
      return null;
    },
  },
];

export function detectRedFlags(patient: {
  outcomes: OutcomeLike[];
  visitCount: number;
  lastSeen: Date | null;
}): { type: string; description: string }[] {
  const flags: { type: string; description: string }[] = [];
  for (const pattern of RED_FLAG_PATTERNS) {
    const result = pattern.check(patient.outcomes, patient.visitCount, patient.lastSeen);
    if (result) flags.push({ type: pattern.type, description: result });
  }
  return flags;
}
