"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isSiteAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";
import {
  NOTICE_TARGET_TYPES,
  type NoticeTargetType,
} from "@/lib/copyright";

/**
 * Admin-only actions behind /admin/copyright — the working end of the DMCA policy at
 * app/dmca/page.tsx. Recording a notice, taking material down, rejecting or reinstating it,
 * and suspending a repeat infringer.
 *
 * Two rules hold across all of them. Every action re-checks isSiteAdmin() itself rather
 * than trusting the page that rendered the button, since each is a callable endpoint in its
 * own right (same reasoning as app/actions/admin.ts). And nothing here ever hard-deletes:
 * a takedown sets removedAt, a suspension sets suspendedAt, and a resolved notice keeps its
 * row — because under §512(i) the record that the policy was actually enforced is the
 * thing being asked for, and destroying it destroys the defence along with the data.
 */

export interface CopyrightActionResult {
  ok: boolean;
  error?: string;
}

/** Resolves the targeted content to the account that authored it. Returns null when the
 *  id doesn't match anything, so a mistyped id is a friendly error rather than a notice
 *  filed against nobody. */
async function findTargetAuthorId(targetType: NoticeTargetType, targetId: string): Promise<string | null> {
  if (targetType === "post") {
    const post = await prisma.nexusPost.findUnique({ where: { id: targetId }, select: { authorId: true } });
    return post?.authorId ?? null;
  }
  const comment = await prisma.nexusPostComment.findUnique({ where: { id: targetId }, select: { authorId: true } });
  return comment?.authorId ?? null;
}

/**
 * Logs a notice of claimed infringement. Deliberately does *not* remove anything on its
 * own — §512 asks for expeditious removal on a valid notice, and whether a notice is valid
 * is a judgment, not a form submission. Recording and acting are two steps so that a
 * facially defective notice can be logged and rejected without ever taking a reader's
 * content down (and without becoming a strike against them).
 */
export async function recordCopyrightNoticeAction(input: {
  complainantName: string;
  complainantEmail: string;
  workDescription: string;
  targetType: string;
  targetId: string;
  notes?: string;
}): Promise<CopyrightActionResult> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };

  const complainantName = input.complainantName.trim();
  const complainantEmail = input.complainantEmail.trim();
  const workDescription = input.workDescription.trim();
  const targetId = input.targetId.trim();

  if (!complainantName || !complainantEmail || !workDescription || !targetId) {
    return { ok: false, error: "Complainant name, email, work description, and content ID are all required." };
  }
  if (!(NOTICE_TARGET_TYPES as readonly string[]).includes(input.targetType)) {
    return { ok: false, error: "Content type must be a post or a comment." };
  }
  const targetType = input.targetType as NoticeTargetType;

  const targetAuthorId = await findTargetAuthorId(targetType, targetId);
  if (!targetAuthorId) {
    return { ok: false, error: `No ${targetType} exists with that ID. Check the ID from the reported URL.` };
  }

  await prisma.copyrightNotice.create({
    data: {
      complainantName,
      complainantEmail,
      workDescription,
      targetType,
      targetId,
      targetAuthorId,
      notes: input.notes?.trim() || null,
    },
  });

  revalidatePath("/admin/copyright");
  return { ok: true };
}

/**
 * Takes the material down and marks the notice as upheld — the §512(c)(1)(C) step, and the
 * only transition that produces a strike (see countsAsStrike in lib/copyright.ts).
 *
 * Sets removedAt rather than deleting, so the content can be restored if a valid
 * counter-notice arrives (the DMCA page's §4 promises exactly that) and so there is
 * something left to look at when deciding. Tolerates content that no longer exists: the
 * author may have deleted it themselves after the notice landed, and the notice still has
 * to resolve rather than getting stuck.
 */
export async function removeReportedContentAction(noticeId: string): Promise<CopyrightActionResult> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };

  const notice = await prisma.copyrightNotice.findUnique({ where: { id: noticeId } });
  if (!notice) return { ok: false, error: "That notice no longer exists." };

  const removal = { removedAt: new Date(), removedReason: `DMCA notice ${notice.id}` };
  if (notice.targetType === "post") {
    await prisma.nexusPost.updateMany({ where: { id: notice.targetId }, data: removal });
  } else {
    await prisma.nexusPostComment.updateMany({ where: { id: notice.targetId }, data: removal });
  }

  await prisma.copyrightNotice.update({
    where: { id: noticeId },
    data: { status: "removed", actionedAt: new Date() },
  });

  revalidatePath("/admin/copyright");
  revalidatePath("/nexus");
  return { ok: true };
}

/**
 * Rejects a notice — facially defective, or the material isn't infringing. Content stays
 * up and the notice does not count as a strike. A reason is required: the point of this
 * log is that a later reader can see the decision was made on a basis, and "reasonably
 * implemented" under §512(i) cuts both ways — refusing bad notices is part of running the
 * policy honestly, not an exception to it.
 */
export async function rejectCopyrightNoticeAction(
  noticeId: string,
  reason: string
): Promise<CopyrightActionResult> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };
  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "Give a reason for rejecting this notice." };

  const notice = await prisma.copyrightNotice.findUnique({ where: { id: noticeId } });
  if (!notice) return { ok: false, error: "That notice no longer exists." };

  await prisma.copyrightNotice.update({
    where: { id: noticeId },
    data: {
      status: "rejected",
      actionedAt: new Date(),
      notes: [notice.notes, `Rejected: ${trimmed}`].filter(Boolean).join("\n"),
    },
  });

  revalidatePath("/admin/copyright");
  return { ok: true };
}

/**
 * Puts removed material back and clears the strike — the §512(g) path, after a valid
 * counter-notification or a withdrawn complaint. Note the statutory timing this does *not*
 * enforce: §512(g)(2)(C) contemplates restoring in not less than 10 and not more than 14
 * business days after forwarding the counter-notice, unless the complainant tells you
 * they've filed suit. That waiting period is a judgment call with real consequences either
 * way, so it stays with the admin rather than being automated on a timer.
 */
export async function reinstateContentAction(
  noticeId: string,
  reason: string
): Promise<CopyrightActionResult> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };
  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "Give a reason for reinstating this content." };

  const notice = await prisma.copyrightNotice.findUnique({ where: { id: noticeId } });
  if (!notice) return { ok: false, error: "That notice no longer exists." };

  const restore = { removedAt: null, removedReason: null };
  if (notice.targetType === "post") {
    await prisma.nexusPost.updateMany({ where: { id: notice.targetId }, data: restore });
  } else {
    await prisma.nexusPostComment.updateMany({ where: { id: notice.targetId }, data: restore });
  }

  await prisma.copyrightNotice.update({
    where: { id: noticeId },
    data: {
      status: "reinstated",
      actionedAt: new Date(),
      notes: [notice.notes, `Reinstated: ${trimmed}`].filter(Boolean).join("\n"),
    },
  });

  revalidatePath("/admin/copyright");
  revalidatePath("/nexus");
  return { ok: true };
}

/**
 * Suspends an account under the repeat-infringer policy. Not automatic on any strike count
 * — see STRIKE_THRESHOLD in lib/copyright.ts for why the threshold only flags an account
 * for review. A reason is required and stored, because "we terminated this account, in
 * these circumstances, for this reason" is precisely the showing §512(i) wants.
 *
 * The account keeps its content and its notice history; only access is withdrawn. Refuses
 * to suspend the admin's own account, same guard as deleteUserAction.
 */
export async function suspendUserAction(userId: string, reason: string): Promise<CopyrightActionResult> {
  const admin = await getCurrentUser();
  if (!admin || !(await isSiteAdmin())) return { ok: false, error: "Not authorized." };
  if (userId === admin.id) return { ok: false, error: "You can't suspend your own account." };

  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "Give a reason for the suspension." };

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, error: "That account no longer exists." };

  await prisma.user.update({
    where: { id: userId },
    data: { suspendedAt: new Date(), suspendedReason: trimmed },
  });

  revalidatePath("/admin/copyright");
  revalidatePath("/admin/accounts");
  return { ok: true };
}

/** Lifts a suspension — a counter-notice held up, or the suspension was a mistake. */
export async function unsuspendUserAction(userId: string): Promise<CopyrightActionResult> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, error: "That account no longer exists." };

  await prisma.user.update({
    where: { id: userId },
    data: { suspendedAt: null, suspendedReason: null },
  });

  revalidatePath("/admin/copyright");
  revalidatePath("/admin/accounts");
  return { ok: true };
}
