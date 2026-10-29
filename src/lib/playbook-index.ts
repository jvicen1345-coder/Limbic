import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { GUIDES } from "@/lib/guides";
import { extractPassages, type PlaybookPassage } from "@/lib/playbook-passages";
import { buildIndex, type PlaybookIndex } from "@/lib/playbook-search";

/**
 * Reads every served playbook once per server instance and holds the search index in memory.
 *
 * Same files, same reasoning and the same caching as the guide route next door (see
 * app/(app)/student/guides/[guide]/route.ts): a few hundred kilobytes each, and they never
 * change between deploys, so parsing them per request would be work done to get the same
 * answer. The whole index is about 1,950 passages over roughly 640KB of text — small enough
 * that there is no case for a database table or a build step, and small enough that a cold
 * instance can build it inside one request.
 *
 * The cache is per instance, exactly like the route's. That means editing a playbook's HTML
 * in development does not change search results until the dev server restarts — the same
 * gotcha the guide route has, noted here because search makes it easy to misread a stale
 * index as a ranking bug.
 *
 * `outputFileTracingIncludes` in next.config.ts is what puts these files in the serverless
 * bundle. The entry for the search surface has to be listed there too, or this read works
 * locally and 404s every playbook in production.
 */

const DIR = path.join(process.cwd(), "content", "playbooks");

let cached: PlaybookIndex | null = null;
let building: Promise<PlaybookIndex> | null = null;

async function build(): Promise<PlaybookIndex> {
  const passages: PlaybookPassage[] = [];

  // Read the files concurrently but keep the passage order deterministic, so two instances
  // holding the same index break ties between equal-scoring passages the same way.
  const files = await Promise.all(
    GUIDES.map(async (guide) => ({
      slug: guide.slug,
      html: await readFile(path.join(DIR, `${guide.slug}.html`), "utf8"),
    }))
  );

  for (const { slug, html } of files) {
    passages.push(...extractPassages(slug, html));
  }

  return buildIndex(passages);
}

/** The shared index, built on first use. Concurrent callers during a cold start await the
 *  same build rather than each parsing the whole library. */
export async function playbookIndex(): Promise<PlaybookIndex> {
  if (cached) return cached;
  if (!building) {
    building = build().then(
      (index) => {
        cached = index;
        building = null;
        return index;
      },
      (error) => {
        // Leave nothing cached, so a transient read failure does not pin an empty index for
        // the lifetime of the instance.
        building = null;
        throw error;
      }
    );
  }
  return building;
}
