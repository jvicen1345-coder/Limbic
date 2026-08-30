"use server";

import { getCurrentUser } from "@/lib/session";
import { findSpecialTestVideo, type SpecialTestVideo } from "@/lib/special-test-videos";

/** Called from SpecialTestsLibrary's "Watch demonstration" link (see
 *  components/pro/SpecialTestsLibrary.tsx) — a Server Action is its own callable endpoint
 *  regardless of which page's UI happens to call it, so this re-checks access itself rather
 *  than trusting the page that rendered the button. Special Tests Library is free to any
 *  signed-in user (see app/(app)/pro/special-tests/page.tsx), so this only re-checks that
 *  the caller is signed in at all. */
export async function getSpecialTestVideoAction(testName: string, region: string): Promise<SpecialTestVideo | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return findSpecialTestVideo(testName, region);
}
