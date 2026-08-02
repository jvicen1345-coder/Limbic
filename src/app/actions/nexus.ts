"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function optInToNexusAction() {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.user.update({ where: { id: user.id }, data: { nexusOptIn: true } });
  revalidatePath("/", "layout");
}

/**
 * Leaving Nexus is a real removal, not just flipping a flag: it deletes every trace of
 * the user's participation — connections (either direction), their own posts (cascades to
 * that post's likes/comments), their likes/comments on other people's posts, and their
 * messages (either direction) — then clears the opt-in flag and the Nexus-specific
 * headline/bio. A user who rejoins later starts fresh rather than reappearing with old
 * connections intact.
 */
export async function leaveNexusAction() {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.$transaction([
    prisma.connection.deleteMany({ where: { OR: [{ requesterId: user.id }, { recipientId: user.id }] } }),
    prisma.nexusPostLike.deleteMany({ where: { userId: user.id } }),
    prisma.nexusPostComment.deleteMany({ where: { authorId: user.id } }),
    prisma.nexusPost.deleteMany({ where: { authorId: user.id } }),
    prisma.nexusMessage.deleteMany({ where: { OR: [{ senderId: user.id }, { recipientId: user.id }] } }),
    prisma.user.update({
      where: { id: user.id },
      data: { nexusOptIn: false, headline: null, bio: null },
    }),
  ]);
  revalidatePath("/", "layout");
  redirect("/profile");
}

export async function sendConnectionRequestAction(recipientId: string) {
  const user = await getCurrentUser();
  if (!user || user.id === recipientId || !user.nexusOptIn) return;

  // The Directory only ever lists opted-in people, but that's a UI-level filter — without
  // this check, a request built outside the app's own UI could still target (or come from)
  // someone who never joined Nexus, or who joined and later left.
  const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { nexusOptIn: true } });
  if (!recipient?.nexusOptIn) return;

  // The existence check and the write are wrapped in one transaction so they're atomic —
  // otherwise two people connecting with each other at nearly the same moment could each
  // pass the "no existing row" check before either write lands, creating two rows (A→B
  // and B→A) instead of one relationship, since the unique constraint is direction-
  // sensitive and doesn't consider those the same pair.
  await prisma.$transaction(async (tx) => {
    const existing = await tx.connection.findFirst({
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
      await tx.connection.update({
        where: { id: existing.id },
        data: { requesterId: user.id, recipientId, status: "pending", respondedAt: null },
      });
    } else {
      await tx.connection.create({ data: { requesterId: user.id, recipientId } });
    }
  });
  revalidatePath("/nexus");
}

export async function respondConnectionAction(connectionId: string, accept: boolean) {
  const user = await getCurrentUser();
  if (!user || !user.nexusOptIn) return;

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
  if (!user || !user.nexusOptIn) return;

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await prisma.nexusPost.create({ data: { authorId: user.id, body } });
  revalidatePath("/nexus");
}

export async function toggleNexusLikeAction(postId: string) {
  const user = await getCurrentUser();
  if (!user || !user.nexusOptIn) return;

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
  if (!user || !user.nexusOptIn) return;

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await prisma.nexusPostComment.create({ data: { postId, authorId: user.id, body } });
  revalidatePath("/nexus");
}

export async function sendNexusMessageAction(recipientId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !user.nexusOptIn) return;

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
