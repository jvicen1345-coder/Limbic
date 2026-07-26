"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function toggleSaveAction(articleId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const existing = await prisma.savedArticle.findUnique({
    where: { userId_articleId: { userId: user.id, articleId } },
  });
  if (existing) {
    await prisma.savedArticle.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedArticle.create({ data: { userId: user.id, articleId } });
  }
  revalidatePath("/", "layout");
}
