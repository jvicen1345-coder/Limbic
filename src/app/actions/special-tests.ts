"use server";

import { getCurrentUser, hasClinicalReferenceAccess } from "@/lib/session";
import { findSpecialTestVideo, type SpecialTestVideo } from "@/lib/special-test-videos";

/** Called from SpecialTestsLibrary's "Show video demonstration" button (see
 *  components/pro/SpecialTestsLibrary.tsx) — a Server Action is its own callable endpoint
 *  regardless of which page's UI happens to call it, so this re-checks access itself rather
 *  than trusting the page that rendered the button (same reasoning as
 *  requireProUser in app/actions/agent.ts). */
export async function getSpecialTestVideoAction(testName: string, region: string): Promise<SpecialTestVideo | null> {
  const user = await getCurrentUser();
  if (!user || !hasClinicalReferenceAccess(user)) return null;
  return findSpecialTestVideo(testName, region);
}
