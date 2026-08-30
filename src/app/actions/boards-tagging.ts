"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isSiteAdmin } from "@/lib/admin";
import { BOARD_QUESTIONS, type BoardQuestion } from "@/lib/board-content";

export interface TaggedBoardQuestion {
  id: string;
  domain: string;
  question: string;
  bodyRegions: string[];
  muscleGroups: string[];
}

function parseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Every Limbic Boards question (see lib/board-content.ts's static BOARD_QUESTIONS) merged
 *  with its current region tags, if any — powers the admin tagging list at
 *  app/(app)/admin/boards-tagging. Admin-only; returns an empty list for anyone else rather
 *  than throwing, same defensive shape as the rest of this app's admin-only actions. */
export async function getBoardsQuestionsForTagging(): Promise<TaggedBoardQuestion[]> {
  if (!(await isSiteAdmin())) return [];

  const tags = await prisma.boardsQuestionTag.findMany();
  const tagByQuestionId = new Map(tags.map((t) => [t.questionId, t]));

  return BOARD_QUESTIONS.map((q) => {
    const tag = tagByQuestionId.get(q.id);
    return {
      id: q.id,
      domain: q.domain,
      question: q.question,
      bodyRegions: tag ? parseJsonArray(tag.bodyRegions) : [],
      muscleGroups: tag ? parseJsonArray(tag.muscleGroups) : [],
    };
  });
}

/** Admin-only — upserts one question's region/muscle-group tags (see BoardsQuestionTag in
 *  schema.prisma). A no-op for anyone else. */
export async function updateQuestionTags(questionId: string, bodyRegions: string[], muscleGroups: string[]): Promise<void> {
  if (!(await isSiteAdmin())) return;
  if (!BOARD_QUESTIONS.some((q) => q.id === questionId)) return;

  await prisma.boardsQuestionTag.upsert({
    where: { questionId },
    create: { questionId, bodyRegions: JSON.stringify(bodyRegions), muscleGroups: JSON.stringify(muscleGroups) },
    update: { bodyRegions: JSON.stringify(bodyRegions), muscleGroups: JSON.stringify(muscleGroups) },
  });
  revalidatePath("/admin/boards-tagging");
}

/** Every question tagged for `regionId` (an Atlas zone id, see lib/atlas-regions.ts) — powers
 *  Limbic Atlas's "Board Questions" section (components/atlas/AtlasClient.tsx). No auth
 *  required; the Atlas page itself gates whether this section is even shown. Small,
 *  infrequently-tagged dataset, so filtering the JSON-string tags in JS after one findMany is
 *  simpler than a raw JSON-contains query. */
export async function getQuestionsForRegion(regionId: string): Promise<BoardQuestion[]> {
  const tags = await prisma.boardsQuestionTag.findMany();
  const matchedIds = new Set(tags.filter((t) => parseJsonArray(t.bodyRegions).includes(regionId)).map((t) => t.questionId));
  return BOARD_QUESTIONS.filter((q) => matchedIds.has(q.id));
}
