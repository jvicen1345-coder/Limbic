"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { isKnownGuide, canReadGuide } from "@/lib/guides";
import { getPlaybook } from "@/lib/playbook-content";

/** Whether `slug` is a real, currently-open (not "Coming soon") playbook or guide — the
 *  only things worth spending a free pick on. Guides and data playbooks share one hub (see
 *  app/(app)/student/playbooks/page.tsx) and one free-pick pool, so this checks both
 *  registries rather than just lib/guides.ts. */
function isChoosableSlug(slug: string): boolean {
  if (isKnownGuide(slug)) return canReadGuide(slug, { admin: false });
  return getPlaybook(slug) != null;
}

/** Spends a non-subscribed student's one free playbook pick (see hasPlaybookAccess in
 *  lib/session.ts). Permanent: once User.freePlaybookSlug is set this no-ops rather than
 *  letting a reader switch it and read the whole paid library one pick at a time — the hub
 *  and the detail pages only ever offer the button while the column is still null, but the
 *  action re-checks it anyway since a reader can't be trusted to have the current page. A
 *  paid LimbicStudent subscriber already reads every slug and never needs this, so it
 *  no-ops for them too rather than writing a pick nothing will ever check. */
export async function chooseFreePlaybookAction(slug: string) {
  const user = await getCurrentUser();
  if (!user || !hasStudentAccess(user)) return;
  if (user.freePlaybookSlug != null || user.studentTier === "limbicStudent") return;
  if (!isChoosableSlug(slug)) return;

  await prisma.user.update({ where: { id: user.id }, data: { freePlaybookSlug: slug } });
  revalidatePath("/student/playbooks");
  revalidatePath(`/student/playbooks/${slug}`);
  revalidatePath(`/student/guides/${slug}`);
}
