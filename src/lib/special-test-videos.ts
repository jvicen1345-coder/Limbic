import "server-only";
import { findEmbeddableVideo, type EducationVideo } from "@/lib/education-video-search";

export type SpecialTestVideo = EducationVideo;

/** Finds a real demonstration video for one special test — called from
 *  getSpecialTestVideoAction (app/actions/special-tests.ts) only once a reader actually asks
 *  to see a given test's video, not prefetched for the whole 50-test library. Thin wrapper
 *  around the shared search/cache/embeddability-check logic in lib/education-video-search.ts
 *  (see that file for why this never hardcodes a video id). */
export async function findSpecialTestVideo(testName: string, region: string): Promise<SpecialTestVideo | null> {
  const query = `${testName} special test ${region} physical therapy demonstration`;
  return findEmbeddableVideo(testName, query, "special-test-videos");
}
