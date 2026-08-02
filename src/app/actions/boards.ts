"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, isStudentEmail } from "@/lib/session";
import { recordBoardActivity } from "@/lib/board-activity";

/** Called whenever a student engages with today's Limbic Boards content — answering the
 *  question or revealing the term both call this; see lib/board-activity.ts for why a
 *  second call the same day is a harmless no-op on the streak. */
export async function recordBoardsActivityAction(dateKey: string) {
  const user = await getCurrentUser();
  // Re-checked here, not just gated on the /boards page — a Server Action is its own
  // callable endpoint regardless of which page's UI happens to call it (same reasoning as
  // every other gated write in this app, see app/actions/agent.ts requireProUser).
  if (!user || !isStudentEmail(user.email)) return;
  await recordBoardActivity(user.id, dateKey);
  revalidatePath("/boards");
}
