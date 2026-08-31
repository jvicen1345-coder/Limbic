import "server-only";
import { prisma } from "@/lib/db";
import { lastNDateKeys } from "@/lib/games";
import {
  BOARD_QUESTIONS,
  NPTE_DOMAINS,
  RECENT_CONTENT_WINDOW_DAYS,
  npteDomainOf,
  pickDailyQuestion,
  pickDailyTerm,
  questionById,
  questionForDate,
  termById,
  type BoardQuestion,
  type BoardTerm,
  type NpteDomain,
} from "@/lib/board-content";

/** Everything Limbic Boards needs to read out of the database about one reader's history,
 *  in one place: which question and term they get today, how they're doing per NPTE
 *  domain, and which questions they got wrong and haven't since gotten right.
 *
 *  Kept out of app/(app)/boards/page.tsx because two of the three are also the answer to
 *  "what was this old DailyCompletion row actually about" — a question the Atrium's own
 *  per-domain chart has to ask too (see app/(app)/student/page.tsx), and which stopped
 *  having a date-only answer once the daily pick became per-reader (see
 *  lib/board-content.ts pickDailyQuestion). */

/** The shape of a persisted answer this module reads. Narrower than the Prisma row so
 *  callers can pass a `select`ed subset without a cast. */
interface CompletionRow {
  dateKey: string;
  contentId: string | null;
  selectedIndex: number | null;
}

/** Which question a stored boardQuestion row was answering. Rows written before
 *  DailyCompletion.contentId existed have no id on them, so they fall back to the old
 *  date-only rotation — which is exactly what those rows were served from, so the answer
 *  is still right for them. Undefined only if the id points at a question no longer in the
 *  bank. */
export function boardQuestionForCompletion(row: CompletionRow): BoardQuestion | undefined {
  return row.contentId ? questionById(row.contentId) : questionForDate(row.dateKey);
}

export interface BoardsDailyContent {
  question: BoardQuestion;
  term: BoardTerm;
}

/** Today's question and term for one reader.
 *
 *  Already answered today? Serve back exactly what they were served, read off the stored
 *  contentId — never a fresh pick, or reloading a finished session would show a different
 *  question next to the answer they gave. Otherwise pick fresh, excluding what they've
 *  been served in the last RECENT_CONTENT_WINDOW_DAYS days. */
export async function getBoardsDailyContent(userId: string, dateKey: string): Promise<BoardsDailyContent> {
  const windowKeys = lastNDateKeys(dateKey, RECENT_CONTENT_WINDOW_DAYS);
  const rows = await prisma.dailyCompletion.findMany({
    where: { userId, kind: { in: ["boardQuestion", "boardTerm"] }, dateKey: { in: windowKeys } },
    select: { kind: true, dateKey: true, contentId: true },
  });

  const servedToday = (kind: string) => rows.find((r) => r.kind === kind && r.dateKey === dateKey)?.contentId ?? null;
  const recentIds = (kind: string) =>
    rows.filter((r) => r.kind === kind && r.dateKey !== dateKey).flatMap((r) => (r.contentId ? [r.contentId] : []));

  const todayQuestionId = servedToday("boardQuestion");
  const todayTermId = servedToday("boardTerm");

  return {
    question: (todayQuestionId ? questionById(todayQuestionId) : undefined) ?? pickDailyQuestion(dateKey, userId, recentIds("boardQuestion")),
    term: (todayTermId ? termById(todayTermId) : undefined) ?? pickDailyTerm(dateKey, userId, recentIds("boardTerm")),
  };
}

export interface DomainProgress {
  domain: NpteDomain;
  correct: number;
  total: number;
  /** How many questions the bank has for this domain — the denominator for "you have
   *  practiced 4 of 9 Cardiopulmonary questions", which is a different question from
   *  accuracy and the one that tells a reader where the unexplored material is. */
  bankSize: number;
  seen: number;
}

export interface MissedQuestion {
  question: BoardQuestion;
  dateKey: string;
  /** What they picked that day — shown alongside the right answer, since "what I thought
   *  it was" is most of what makes a missed question worth reviewing. */
  selectedIndex: number;
}

export interface BoardsProgress {
  /** All 5 domains, always, in NPTE_DOMAINS order — a domain with no answers yet reads as
   *  "no data" rather than disappearing, so the breakdown's shape doesn't reflow as a
   *  reader works through it. */
  domains: DomainProgress[];
  missed: MissedQuestion[];
  answeredCount: number;
  correctCount: number;
}

/** All-time per-domain accuracy plus the current missed-question review list, from this
 *  reader's stored boardQuestion answers.
 *
 *  A question counts as "missed" if the most recent answer to it was wrong — get it right
 *  on a later day and it leaves the list, which is what makes the list shrink as review
 *  works rather than growing forever. Only the latest answer per question is considered,
 *  so re-answering the same question on two days can't put it in the list twice. */
export async function getBoardsProgress(userId: string, missedLimit = 10): Promise<BoardsProgress> {
  const rows = await prisma.dailyCompletion.findMany({
    where: { userId, kind: "boardQuestion", selectedIndex: { not: null } },
    select: { dateKey: true, contentId: true, selectedIndex: true },
    orderBy: { dateKey: "asc" },
  });

  // Latest answer per question id. Ascending dateKey above means a later row overwrites an
  // earlier one for the same question, leaving exactly the most recent attempt at each.
  const latest = new Map<string, { question: BoardQuestion; dateKey: string; selectedIndex: number }>();
  for (const row of rows) {
    const question = boardQuestionForCompletion(row);
    if (!question || row.selectedIndex == null) continue;
    latest.set(question.id, { question, dateKey: row.dateKey, selectedIndex: row.selectedIndex });
  }

  const stats = new Map<NpteDomain, { correct: number; total: number }>(NPTE_DOMAINS.map((d) => [d, { correct: 0, total: 0 }]));
  const missed: MissedQuestion[] = [];
  for (const entry of latest.values()) {
    const domain = npteDomainOf(entry.question);
    const stat = stats.get(domain);
    if (stat) {
      stat.total += 1;
      if (entry.selectedIndex === entry.question.correctIndex) stat.correct += 1;
    }
    if (entry.selectedIndex !== entry.question.correctIndex) missed.push(entry);
  }

  const domains: DomainProgress[] = NPTE_DOMAINS.map((domain) => {
    const stat = stats.get(domain) ?? { correct: 0, total: 0 };
    return {
      domain,
      correct: stat.correct,
      total: stat.total,
      seen: stat.total,
      bankSize: BOARD_QUESTIONS.filter((q) => npteDomainOf(q) === domain).length,
    };
  });

  return {
    domains,
    // Most recently missed first — the ones still fresh enough to be worth re-reading.
    missed: missed.sort((a, b) => b.dateKey.localeCompare(a.dateKey)).slice(0, missedLimit),
    answeredCount: latest.size,
    correctCount: Array.from(latest.values()).filter((e) => e.selectedIndex === e.question.correctIndex).length,
  };
}
