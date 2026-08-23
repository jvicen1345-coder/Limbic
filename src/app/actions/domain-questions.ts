"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { todayDateKey } from "@/lib/board-content";

export interface DomainAnswerView {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

/** Every answer the signed-in reader has already submitted today for `domain`'s practice
 *  page (see components/student/DomainBoardConnections.tsx) — same "scoped to today's
 *  dateKey resets it automatically" pattern as app/actions/specialty-questions.ts
 *  getSpecialtyAnswers. Deliberately takes no userId parameter — the reader comes from the
 *  session, same reasoning as every other action in this app. */
export async function getDomainAnswers(domain: string): Promise<DomainAnswerView[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  return prisma.domainQuestionAnswer.findMany({
    where: { userId: user.id, domain, dateKey: todayDateKey() },
    select: { questionIndex: true, selectedAnswer: true, isCorrect: true },
  });
}

export interface SaveDomainAnswerResult {
  ok: boolean;
  error?: string;
}

/** Called the instant a reader picks an answer on a domain's practice page — no save
 *  button, same as saveSpecialtyAnswer in app/actions/specialty-questions.ts, which this
 *  otherwise mirrors exactly. */
export async function saveDomainAnswer(
  domain: string,
  questionIndex: number,
  selectedAnswer: string,
  isCorrect: boolean
): Promise<SaveDomainAnswerResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authorized." };

  const dateKey = todayDateKey();
  await prisma.domainQuestionAnswer.upsert({
    where: { userId_domain_questionIndex_dateKey: { userId: user.id, domain, questionIndex, dateKey } },
    create: { userId: user.id, domain, questionIndex, selectedAnswer, isCorrect, dateKey },
    update: { selectedAnswer, isCorrect },
  });
  return { ok: true };
}
