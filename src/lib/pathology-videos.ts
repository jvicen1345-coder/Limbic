import "server-only";
import { findEmbeddableVideo, type EducationVideo } from "@/lib/education-video-search";

export type PathologyVideo = EducationVideo;

/** Finds a real explanation video for one Common Pathologies entry — called from
 *  getPathologyVideoAction (app/actions/pathologies.ts) only once a reader actually asks to
 *  see a given condition's video, not prefetched for the whole list. Thin wrapper around the
 *  shared search/cache/embeddability-check logic in lib/education-video-search.ts (see that
 *  file for why this never hardcodes a video id). */
export async function findPathologyVideo(slug: string, videoQuery: string): Promise<PathologyVideo | null> {
  return findEmbeddableVideo(slug, videoQuery, "pathology-videos");
}
