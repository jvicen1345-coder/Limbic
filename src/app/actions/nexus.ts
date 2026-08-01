"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function sendConnectionRequestAction(recipientId: string) {
  const user = await getCurrentUser();
  if (!user || user.id === recipientId) return;

  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: user.id, recipientId },
        { requesterId: recipientId, recipientId: user.id },
      ],
    },
  });
  if (existing && existing.status !== "declined") return;

  if (existing) {
    // A previously declined request can be re-sent, from either side.
    await prisma.connection.update({
      where: { id: existing.id },
      data: { requesterId: user.id, recipientId, status: "pending", respondedAt: null },
    });
  } else {
    await prisma.connection.create({ data: { requesterId: user.id, recipientId } });
  }
  revalidatePath("/nexus");
}

export async function respondConnectionAction(connectionId: string, accept: boolean) {
  const user = await getCurrentUser();
  if (!user) return;

  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection || connection.recipientId !== user.id) return;

  await prisma.connection.update({
    where: { id: connectionId },
    data: { status: accept ? "accepted" : "declined", respondedAt: new Date() },
  });
  revalidatePath("/nexus");
}

export async function createNexusPostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await prisma.nexusPost.create({ data: { authorId: user.id, body } });
  revalidatePath("/nexus");
}

export async function toggleNexusLikeAction(postId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const existing = await prisma.nexusPostLike.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });
  if (existing) {
    await prisma.nexusPostLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.nexusPostLike.create({ data: { postId, userId: user.id } });
  }
  revalidatePath("/nexus");
}

export async function addNexusCommentAction(postId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await prisma.nexusPostComment.create({ data: { postId, authorId: user.id, body } });
  revalidatePath("/nexus");
}

export async function sendNexusMessageAction(recipientId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const connection = await prisma.connection.findFirst({
    where: {
      status: "accepted",
      OR: [
        { requesterId: user.id, recipientId },
        { requesterId: recipientId, recipientId: user.id },
      ],
    },
  });
  if (!connection) return;

  await prisma.nexusMessage.create({ data: { senderId: user.id, recipientId, body } });
  revalidatePath(`/nexus/messages/${recipientId}`);
  revalidatePath("/nexus/messages");
}
