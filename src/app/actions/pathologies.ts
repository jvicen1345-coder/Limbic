"use server";

import { getCurrentUser } from "@/lib/session";
import { getPathology } from "@/lib/pathologies-static";
import { findPathologyVideo, type PathologyVideo } from "@/lib/pathology-videos";

/** Called from PathologyVideo's "Watch explanation video" button (see
 *  app/(app)/wellness/pathologies/page.tsx) — a Server Action is its own callable endpoint
 *  regardless of which page's UI happens to call it, so this re-derives the query from the
 *  slug itself rather than trusting a query string passed in from the client. Common
 *  Pathologies is a signed-in Health & Wellness feature (not gated behind Pro/student
 *  access like LimbicPRO's clinical tools), so this only requires a signed-in reader. */
export async function getPathologyVideoAction(slug: string): Promise<PathologyVideo | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const pathology = getPathology(slug);
  if (!pathology) return null;
  return findPathologyVideo(pathology.slug, pathology.videoQuery);
}
