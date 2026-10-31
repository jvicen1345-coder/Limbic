import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { extractPassages, type LibraryPassage } from "@/lib/library-passages";
import { librarySources, type LibrarySource } from "@/lib/library-sources";
import { buildIndex, type LibraryIndex } from "@/lib/library-search";

/**
 * Reads every searchable document once per server instance and holds the search index in
 * memory. Which documents those are is lib/library-sources.ts's answer.
 *
 * Same files, same reasoning and the same caching as the route handlers that serve them (see
 * app/(app)/student/guides/[guide]/route.ts): a few hundred kilobytes each, and they never
 * change between deploys, so parsing them per request would be work done to get the same
 * answer. The whole index is about 2,700 passages over the ten documents — small enough that
 * there is no case for a database table or a build step, and small enough that a cold
 * instance can build it inside one request.
 *
 * There are two indexes, not one, because an admin may read an unpublished playbook and an
 * ordinary reader may not, and search must not be the surface that reveals one. Keying the
 * cache on that single bit keeps the two sets of passages from ever meeting.
 *
 * The cache is per instance, exactly like each route's. That means editing a document's HTML
 * in development does not change search results until the dev server restarts — the same
 * gotcha those routes have, noted here because search makes it easy to misread a stale index
 * as a ranking bug.
 *
 * `outputFileTracingIncludes` in next.config.ts is what puts these files in the serverless
 * bundle. The search route has to list both content directories there, or this read works
 * locally and finds nothing in production.
 */

const CONTENT = path.join(process.cwd(), "content");

const cached = new Map<string, LibraryIndex>();
const building = new Map<string, Promise<LibraryIndex>>();

async function build(sources: LibrarySource[]): Promise<LibraryIndex> {
  // Read concurrently but keep the passage order deterministic, so two instances holding the
  // same index break ties between equal-scoring passages the same way.
  const files = await Promise.all(
    sources.map(async (source) => ({
      source,
      html: await readFile(path.join(CONTENT, source.dir, `${source.slug}.html`), "utf8"),
    }))
  );

  const passages: LibraryPassage[] = [];
  for (const { source, html } of files) {
    passages.push(...extractPassages(source.slug, html, source.profile));
  }
  return buildIndex(passages);
}

/** The shared index for this reader's visibility, built on first use. Concurrent callers
 *  during a cold start await the same build rather than each parsing the whole library. */
export async function libraryIndex({ admin }: { admin: boolean }): Promise<LibraryIndex> {
  const key = admin ? "admin" : "reader";
  const hit = cached.get(key);
  if (hit) return hit;

  const inFlight = building.get(key);
  if (inFlight) return inFlight;

  const promise = build(librarySources({ admin })).then(
    (index) => {
      cached.set(key, index);
      building.delete(key);
      return index;
    },
    (error) => {
      // Leave nothing cached, so a transient read failure does not pin an empty index for the
      // lifetime of the instance.
      building.delete(key);
      throw error;
    }
  );
  building.set(key, promise);
  return promise;
}
